'use client';

import { RoleToggle } from '@/features/voter-settings';
import type { PublicParticipant, Role, RoomState } from '@/entities/room';

export function RoomHeader({
  roomId,
  room,
  me,
  copied,
  copyLink,
  switchRole,
  toggleSpectator,
}: {
  roomId: string;
  room: RoomState | null;
  me: PublicParticipant | null;
  copied: boolean;
  copyLink: () => void;
  switchRole: (role: Role) => void;
  toggleSpectator: () => void;
}) {
  return (
    <header className="room-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
        <span className="suit-mark" aria-hidden>
          ♠
        </span>
        <strong className="display">Scrum Poker</strong>
      </div>

      <div className="room-code">
        <span className="code mono">{roomId}</span>
        <button className="copy-btn" onClick={copyLink}>
          {copied ? 'Copied ✓' : 'Copy invite link'}
        </button>
      </div>

      <div className="header-actions">
        <span className="round-chip">Round {room?.round ?? 1}</span>
        {!me?.spectator && (
          <RoleToggle
            value={me?.role ?? 'DEV'}
            onChange={switchRole}
            disabled={room?.revealed}
            disabledTitle="Role can be changed before the next round"
          />
        )}
        <button className="btn btn-quiet" onClick={toggleSpectator}>
          {me?.spectator ? 'Join the vote' : 'Spectate'}
        </button>
      </div>
    </header>
  );
}
