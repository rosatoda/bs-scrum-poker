import { seatStyle } from '@/entities/room';
import type { PublicParticipant } from '@/entities/room';

export function Seat({
  participant,
  index,
  total,
  isMe,
  isSeatAdmin,
  revealed,
  isAdmin,
  makeAdmin,
}: {
  participant: PublicParticipant;
  index: number;
  total: number;
  isMe: boolean;
  isSeatAdmin: boolean;
  revealed: boolean;
  isAdmin: boolean;
  makeAdmin: (targetId: string) => void;
}) {
  const p = participant;
  const cardClass = p.spectator
    ? 'seat-card spectator'
    : revealed
      ? 'seat-card revealed'
      : p.hasVoted
        ? 'seat-card'
        : 'seat-card empty';

  return (
    <div className="seat" style={seatStyle(index, total)}>
      <div className={cardClass}>
        <div className="flip">
          <div className="face face-down">{p.spectator ? '👁' : ''}</div>
          <div className={`face face-up ${p.vote == null ? 'no-vote' : ''}`}>
            {p.spectator ? '' : p.vote == null ? 'no vote' : p.vote}
          </div>
        </div>
      </div>
      <span className="seat-name">
        {isSeatAdmin && (
          <span className="crown" title="Room admin" aria-label="Room admin">
            👑
          </span>
        )}
        {!p.spectator && <span className={`role-badge role-${p.role.toLowerCase()}`}>{p.role}</span>}
        {p.name}
        {isMe && <span className="you"> (you)</span>}
      </span>
      {isAdmin && !isMe && (
        <button className="make-admin-btn" onClick={() => makeAdmin(p.id)}>
          Make admin
        </button>
      )}
    </div>
  );
}
