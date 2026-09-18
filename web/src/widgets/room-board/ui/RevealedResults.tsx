import type { RoundResults } from '@/entities/room';

export function RevealedResults({
  results,
  devResults,
  qaResults,
  voterCount,
  isAdmin,
  newRound,
}: {
  results: RoundResults;
  devResults: RoundResults | null;
  qaResults: RoundResults | null;
  voterCount: number;
  isAdmin: boolean;
  newRound: () => void;
}) {
  return (
    <div className="results">
      <div className="result-stat">
        <div className="value">{results.average ?? '—'}</div>
        <div className="label">Joint average</div>
      </div>
      <div className="result-stat">
        <div className="value">{devResults?.average ?? '—'}</div>
        <div className="label">DEV average</div>
      </div>
      <div className="result-stat">
        <div className="value">{qaResults?.average ?? '—'}</div>
        <div className="label">QA average</div>
      </div>
      <div className="result-stat">
        <div className="value">
          {results.castCount}/{voterCount}
        </div>
        <div className="label">Votes cast</div>
      </div>
      <div style={{ width: '100%' }}>
        {results.consensus && <div className="consensus">Consensus on {results.consensus} 🎉</div>}
        {isAdmin ? (
          <button className="btn btn-gold" onClick={newRound}>
            Start next round
          </button>
        ) : (
          <p style={{ marginTop: '0.7rem' }}>Waiting for the room admin to start the next round.</p>
        )}
      </div>
    </div>
  );
}
