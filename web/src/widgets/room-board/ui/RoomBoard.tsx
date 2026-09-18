'use client';

import { useRoomBoard } from '../model/useRoomBoard';
import { JoinGate } from './JoinGate';
import { RoomHeader } from './RoomHeader';
import { PokerTable } from './PokerTable';
import { VotingHand } from './VotingHand';

export function RoomBoard({ roomId }: { roomId: string }) {
  const {
    name,
    nameDraft,
    setNameDraft,
    spectator,
    setSpectator,
    role,
    setRole,
    submitName,
    room,
    myId,
    status,
    errorMsg,
    me,
    isAdmin,
    voters,
    votesIn,
    results,
    devResults,
    qaResults,
    myVote,
    castVote,
    reveal,
    newRound,
    makeAdmin,
    toggleSpectator,
    switchRole,
    copied,
    copyLink,
  } = useRoomBoard(roomId);

  if (!name) {
    return (
      <JoinGate
        roomId={roomId}
        nameDraft={nameDraft}
        setNameDraft={setNameDraft}
        role={role}
        setRole={setRole}
        spectator={spectator}
        setSpectator={setSpectator}
        submitName={submitName}
      />
    );
  }

  return (
    <div className="room">
      <RoomHeader
        roomId={roomId}
        room={room}
        me={me}
        copied={copied}
        copyLink={copyLink}
        switchRole={switchRole}
        toggleSpectator={toggleSpectator}
      />

      {status === 'error' && (
        <p className="conn-note error">Can’t reach the game server. Check that it’s running and refresh.</p>
      )}
      {status === 'connecting' && <p className="conn-note">Connecting to the table…</p>}
      {errorMsg && <p className="conn-note error">{errorMsg}</p>}

      <PokerTable
        room={room}
        myId={myId}
        voters={voters}
        votesIn={votesIn}
        results={results}
        devResults={devResults}
        qaResults={qaResults}
        isAdmin={isAdmin}
        reveal={reveal}
        newRound={newRound}
        makeAdmin={makeAdmin}
      />

      {!me?.spectator && (
        <VotingHand
          myVote={myVote}
          revealed={Boolean(room?.revealed)}
          connectionBlocked={status !== 'connected'}
          castVote={castVote}
        />
      )}
    </div>
  );
}
