'use client';

import { useCallback } from 'react';
import { ROOM_EVENTS } from '@/entities/room';

export function useRevealRound(emit: (event: string, payload?: unknown) => void) {
  const reveal = useCallback(() => emit(ROOM_EVENTS.REVEAL), [emit]);
  const newRound = useCallback(() => emit(ROOM_EVENTS.RESET), [emit]);
  return { reveal, newRound };
}
