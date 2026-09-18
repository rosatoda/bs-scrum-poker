'use client';

import { useCallback } from 'react';
import { useRoomConnection, useRoomStats } from '@/entities/room';
import { useJoinTable } from '@/features/join-table';
import { useVoterSettingsState, useVoterSettingsActions } from '@/features/voter-settings';
import { useCastVote } from '@/features/cast-vote';
import { useRevealRound } from '@/features/reveal-round';
import { useRoomAdminActions } from '@/features/room-admin';
import { useCopyInviteLink } from '@/features/copy-invite-link';

/**
 * Composition root for the room screen: wires the join, connection, voter-settings,
 * voting, and admin feature hooks together so `RoomBoard` and its children stay
 * purely presentational.
 */
export function useRoomBoard(roomId: string) {
  const { name, nameDraft, setNameDraft, submitName } = useJoinTable();
  const { spectator, setSpectator, role, setRole } = useVoterSettingsState();

  const { room, myId, status, errorMsg, emit } = useRoomConnection(roomId, name, spectator, role);

  const { toggleSpectator: toggleSpectatorSetting, switchRole } = useVoterSettingsActions(
    emit,
    room,
    spectator,
    setSpectator,
    role,
    setRole,
  );
  const stats = useRoomStats(room, myId);
  const { myVote, castVote, clearVote } = useCastVote(room, stats.me, emit);
  const toggleSpectator = useCallback(() => {
    toggleSpectatorSetting();
    clearVote();
  }, [toggleSpectatorSetting, clearVote]);
  const { reveal, newRound } = useRevealRound(emit);
  const { makeAdmin } = useRoomAdminActions(emit);
  const { copied, copyLink } = useCopyInviteLink();

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
    ...stats,
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
