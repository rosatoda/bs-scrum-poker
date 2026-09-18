'use client';

import { useCallback } from 'react';
import { ROOM_EVENTS } from '@/entities/room';

export function useRoomAdminActions(emit: (event: string, payload?: unknown) => void) {
  const makeAdmin = useCallback(
    (targetId: string) => emit(ROOM_EVENTS.TRANSFER_ADMIN, { targetId }),
    [emit],
  );
  return { makeAdmin };
}
