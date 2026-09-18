'use client';

import { useJoinRoom } from '../model/useJoinRoom';

export function JoinRoomForm({ name }: { name: string }) {
  const { joinCode, setJoinCode, joinRoom } = useJoinRoom();

  return (
    <form className="join-row" onSubmit={(e) => joinRoom(e, name)}>
      <input
        className="input mono"
        placeholder="8-digit room code"
        inputMode="numeric"
        value={joinCode}
        maxLength={8}
        onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, ''))}
        aria-label="Room code"
      />
      <button className="btn btn-quiet" type="submit">
        Join
      </button>
    </form>
  );
}
