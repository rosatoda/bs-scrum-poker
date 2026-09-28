'use client';

import { useMemo } from 'react';
import { computeResults } from '../lib/computeResults';
import type { RoomState } from './types';

/** Derived voter/result breakdowns for the current room state, split by role. */
export function useRoomStats(room: RoomState | null, myId: string | null) {
  const me = useMemo(() => room?.participants.find((p) => p.id === myId) ?? null, [room, myId]);

  const isAdmin = Boolean(myId && room?.adminId === myId);

  const voters = useMemo(() => room?.participants.filter((p) => !p.spectator) ?? [], [room]);
  const devVoters = useMemo(() => voters.filter((p) => p.role === 'DEV'), [voters]);
  const qaVoters = useMemo(() => voters.filter((p) => p.role === 'QA'), [voters]);

  const votesIn = voters.filter((p) => p.hasVoted).length;

  const devResults = useMemo(() => (room?.revealed ? computeResults(devVoters) : null), [room, devVoters]);
  const qaResults = useMemo(() => (room?.revealed ? computeResults(qaVoters) : null), [room, qaVoters]);
  // Joint average is the sum of the DEV and QA averages (a missing side counts as 0).
  const results = useMemo(() => {
    if (!room?.revealed) return null;
    const all = computeResults(voters);
    const dev = devResults?.average ?? null;
    const qa = qaResults?.average ?? null;
    const average = dev === null && qa === null ? null : Math.round(((dev ?? 0) + (qa ?? 0)) * 10) / 10;
    return { ...all, average };
  }, [room, voters, devResults, qaResults]);

  return { me, isAdmin, voters, devVoters, qaVoters, votesIn, results, devResults, qaResults };
}
