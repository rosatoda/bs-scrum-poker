'use client';

import { useEffect, useState } from 'react';
import { getRememberedName } from '@/shared/lib/rememberedName';
import { useCreateRoom } from '@/features/create-room';
import { JoinRoomForm } from '@/features/join-room';

/** The landing page's only interactive island: a name shared by "create" and "join". */
export function LandingActions() {
  const [name, setName] = useState('');
  const { creating, createRoom } = useCreateRoom();

  useEffect(() => {
    setName(getRememberedName() ?? '');
  }, []);

  return (
    <div className="landing-form">
      <input
        className="input"
        placeholder="Your name"
        value={name}
        maxLength={24}
        onChange={(e) => setName(e.target.value)}
        aria-label="Your name"
      />
      <button className="btn btn-gold" onClick={() => createRoom(name)} disabled={creating}>
        {creating ? 'Opening a table…' : 'Start a new game'}
      </button>
      <div className="divider">or join one</div>
      <JoinRoomForm name={name} />
    </div>
  );
}
