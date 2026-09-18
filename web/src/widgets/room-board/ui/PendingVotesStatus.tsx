export function PendingVotesStatus({
  votesIn,
  voterCount,
  isAdmin,
  reveal,
}: {
  votesIn: number;
  voterCount: number;
  isAdmin: boolean;
  reveal: () => void;
}) {
  return (
    <div>
      <strong className="display">
        {votesIn}/{voterCount || '–'} cards on the table
      </strong>
      <p>
        {voterCount < 2
          ? 'Share the invite link to deal your team in.'
          : isAdmin
            ? 'Reveal when everyone has picked.'
            : 'Waiting for the room admin to reveal the cards.'}
      </p>
      {isAdmin && (
        <button className="btn btn-gold" onClick={reveal} disabled={votesIn === 0}>
          Reveal cards
        </button>
      )}
    </div>
  );
}
