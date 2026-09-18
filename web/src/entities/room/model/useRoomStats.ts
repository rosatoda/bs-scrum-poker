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

  const results = useMemo(() => (room?.revealed ? computeResults(voters) : null), [room, voters]);
  const devResults = useMemo(() => (room?.revealed ? computeResults(devVoters) : null), [room, devVoters]);
  const qaResults = useMemo(() => (room?.revealed ? computeResults(qaVoters) : null), [room, qaVoters]);

  return { me, isAdmin, voters, devVoters, qaVoters, votesIn, results, devResults, qaResults };
}
