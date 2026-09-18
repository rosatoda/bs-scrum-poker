'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { NAME_KEY, computeResults } from '@/lib/game';
import type { Role } from '@/lib/types';
import { useRoomSocket } from './useRoomSocket';

const COPIED_TOAST_MS = 1800;

/**
 * All state and actions behind the room screen: remembered/entered name,
 * connection + room state (via useRoomSocket), and the derived values and
 * socket actions the view needs. Keeps RoomClient purely presentational.
 */
export function useRoom(roomId: string) {
  const [name, setName] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState('');
  const [spectator, setSpectator] = useState(false);
  const [role, setRole] = useState<Role>('DEV');
  const [copied, setCopied] = useState(false);

  // Load a remembered name once on the client
  useEffect(() => {
    const saved = localStorage.getItem(NAME_KEY);
    if (saved) setName(saved);
    setNameDraft(saved ?? '');
  }, []);

  const { room, myId, status, errorMsg, emit } = useRoomSocket(roomId, name, spectator, role);

  const me = useMemo(
    () => room?.participants.find((p) => p.id === myId) ?? null,
    [room, myId],
  );

  const isAdmin = Boolean(myId && room?.adminId === myId);

  const voters = useMemo(
    () => room?.participants.filter((p) => !p.spectator) ?? [],
    [room],
  );

  const devVoters = useMemo(() => voters.filter((p) => p.role === 'DEV'), [voters]);
  const qaVoters = useMemo(() => voters.filter((p) => p.role === 'QA'), [voters]);

  const votesIn = voters.filter((p) => p.hasVoted).length;

  const results = useMemo(
    () => (room?.revealed ? computeResults(voters) : null),
    [room, voters],
  );
  const devResults = useMemo(
    () => (room?.revealed ? computeResults(devVoters) : null),
    [room, devVoters],
  );
  const qaResults = useMemo(
    () => (room?.revealed ? computeResults(qaVoters) : null),
    [room, qaVoters],
  );

  // My selected card comes from server state after reveal; before reveal we track it locally
  const [myVote, setMyVote] = useState<string | null>(null);
  useEffect(() => {
    if (room && !room.revealed && me && !me.hasVoted) setMyVote(null);
  }, [room, me]);
  useEffect(() => {
    // new round → clear local selection
    setMyVote(null);
  }, [room?.round]);

  const submitName = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = nameDraft.trim();
      if (!trimmed) return;
      localStorage.setItem(NAME_KEY, trimmed);
      setName(trimmed);
    },
    [nameDraft],
  );

  const castVote = useCallback(
    (value: string) => {
      if (!room || room.revealed || me?.spectator) return;
      setMyVote((prev) => (prev === value ? null : value));
      emit('room:vote', { value });
    },
    [room, me, emit],
  );

  const reveal = useCallback(() => emit('room:reveal'), [emit]);
  const newRound = useCallback(() => emit('room:reset'), [emit]);
  const makeAdmin = useCallback((targetId: string) => emit('room:transfer-admin', { targetId }), [emit]);

  const toggleSpectator = useCallback(() => {
    const next = !spectator;
    setSpectator(next);
    setMyVote(null);
    emit('room:spectator', { spectator: next });
  }, [spectator, emit]);

  const switchRole = useCallback(
    (next: Role) => {
      if (next === role || room?.revealed) return;
      setRole(next);
      emit('room:role', { role: next });
    },
    [role, room, emit],
  );

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_TOAST_MS);
    } catch {
      // clipboard unavailable — the visible code still lets people join manually
    }
  }, []);

  return {
    // identity / join screen
    name,
    nameDraft,
    setNameDraft,
    spectator,
    setSpectator,
    role,
    setRole,
    submitName,
    // connection + room state
    room,
    myId,
    status,
    errorMsg,
    // derived
    me,
    isAdmin,
    voters,
    devVoters,
    qaVoters,
    votesIn,
    results,
    devResults,
    qaResults,
    myVote,
    // actions
    castVote,
    reveal,
    newRound,
    makeAdmin,
    toggleSpectator,
    switchRole,
    copied,
    copyLink,
  };
}
