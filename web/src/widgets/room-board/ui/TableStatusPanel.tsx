import type { PublicParticipant, RoundResults } from '@/entities/room';
import { RevealedResults } from './RevealedResults';
import { PendingVotesStatus } from './PendingVotesStatus';

export function TableStatusPanel({
  revealed,
  results,
  devResults,
  qaResults,
  voters,
  votesIn,
  isAdmin,
  reveal,
  newRound,
}: {
  revealed: boolean;
  results: RoundResults | null;
  devResults: RoundResults | null;
  qaResults: RoundResults | null;
  voters: PublicParticipant[];
  votesIn: number;
  isAdmin: boolean;
  reveal: () => void;
  newRound: () => void;
}) {
  return (
    <div className="table-status">
      {revealed && results ? (
        <RevealedResults
          results={results}
          devResults={devResults}
          qaResults={qaResults}
          voterCount={voters.length}
          isAdmin={isAdmin}
          newRound={newRound}
        />
      ) : (
        <PendingVotesStatus votesIn={votesIn} voterCount={voters.length} isAdmin={isAdmin} reveal={reveal} />
      )}
    </div>
  );
}
