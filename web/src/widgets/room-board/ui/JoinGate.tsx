'use client';

import { RoleToggle } from '@/features/voter-settings';
import type { Role } from '@/entities/room';

export function JoinGate({
  roomId,
  nameDraft,
  setNameDraft,
  role,
  setRole,
  spectator,
  setSpectator,
  submitName,
}: {
  roomId: string;
  nameDraft: string;
  setNameDraft: (value: string) => void;
  role: Role;
  setRole: (role: Role) => void;
  spectator: boolean;
  setSpectator: (value: boolean) => void;
  submitName: (e: React.FormEvent) => void;
}) {
  return (
    <div className="overlay">
      <div className="overlay-card">
        <h2 className="display">Take a seat</h2>
        <p>
          Joining table <span className="mono">{roomId}</span>. What name should be on
          your card?
        </p>
        <form onSubmit={submitName}>
          <input
            className="input"
            placeholder="Your name"
            value={nameDraft}
            maxLength={24}
            autoFocus
            onChange={(e) => setNameDraft(e.target.value)}
            aria-label="Your name"
          />
          <RoleToggle value={role} onChange={setRole} />
          <label className="check-row">
            <input
              type="checkbox"
              checked={spectator}
              onChange={(e) => setSpectator(e.target.checked)}
            />
            Join as spectator (watch without voting)
          </label>
          <button className="btn btn-gold" type="submit">
            Join the table
          </button>
        </form>
      </div>
    </div>
  );
}
