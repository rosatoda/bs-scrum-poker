import { DECK } from '@/entities/room';

export function VotingHand({
  myVote,
  revealed,
  connectionBlocked,
  castVote,
}: {
  myVote: string | null;
  revealed: boolean;
  connectionBlocked: boolean;
  castVote: (value: string) => void;
}) {
  return (
    <footer className="hand-zone">
      <p className="hand-hint">
        {revealed
          ? 'Cards are face up — start the next round to vote again.'
          : 'Pick your estimate. Tap the same card again to take it back.'}
      </p>
      <div className="hand" role="group" aria-label="Estimate cards">
        {DECK.map((value) => (
          <button
            key={value}
            className={`hand-card ${myVote === value ? 'selected' : ''}`}
            onClick={() => castVote(value)}
            disabled={revealed || connectionBlocked}
            aria-pressed={myVote === value}
          >
            {value}
          </button>
        ))}
      </div>
    </footer>
  );
}
