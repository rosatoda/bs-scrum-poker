'use client';

import { useCallback, useState } from 'react';
import { ROOM_EVENTS } from '@/entities/room';
import type { Role, RoomState } from '@/entities/room';

/**
 * Local spectator/role state. Declared separately from the actions below because
 * the room connection needs the current values before its `emit` function exists.
 */
export function useVoterSettingsState() {
  const [spectator, setSpectator] = useState(false);
  const [role, setRole] = useState<Role>('DEV');
  return { spectator, setSpectator, role, setRole };
}

/** Actions that push a spectator/role change to the server once `emit` is available. */
export function useVoterSettingsActions(
  emit: (event: string, payload?: unknown) => void,
  room: RoomState | null,
  spectator: boolean,
  setSpectator: (value: boolean) => void,
  role: Role,
  setRole: (value: Role) => void,
) {
  const toggleSpectator = useCallback(() => {
    const next = !spectator;
    setSpectator(next);
    emit(ROOM_EVENTS.SPECTATOR, { spectator: next });
  }, [spectator, setSpectator, emit]);

  const switchRole = useCallback(
    (next: Role) => {
      if (next === role || room?.revealed) return;
      setRole(next);
      emit(ROOM_EVENTS.ROLE, { role: next });
    },
    [role, setRole, room, emit],
  );

  return { toggleSpectator, switchRole };
}
