'use client';

import { useCallback, useEffect, useState } from 'react';
import { ROOM_EVENTS } from '@/entities/room';
import type { PublicParticipant, RoomState } from '@/entities/room';

/** Local optimistic vote selection, synced back to server-confirmed state each round. */
export function useCastVote(
  room: RoomState | null,
  me: PublicParticipant | null,
  emit: (event: string, payload?: unknown) => void,
) {
  const [myVote, setMyVote] = useState<string | null>(null);

  // My selected card comes from server state after reveal; before reveal we track it locally
  useEffect(() => {
    if (room && !room.revealed && me && !me.hasVoted) setMyVote(null);
  }, [room, me]);
  useEffect(() => {
    // new round → clear local selection
    setMyVote(null);
  }, [room?.round]);

  const castVote = useCallback(
    (value: string) => {
      if (!room || room.revealed || me?.spectator) return;
      setMyVote((prev) => (prev === value ? null : value));
      emit(ROOM_EVENTS.VOTE, { value });
    },
    [room, me, emit],
  );

  const clearVote = useCallback(() => setMyVote(null), []);

  return { myVote, castVote, clearVote };
}
