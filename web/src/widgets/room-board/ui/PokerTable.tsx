import type { PublicParticipant, RoomState, RoundResults } from '@/entities/room';
import { TableStatusPanel } from './TableStatusPanel';
import { Seat } from './Seat';

export function PokerTable({
  room,
  myId,
  voters,
  votesIn,
  results,
  devResults,
  qaResults,
  isAdmin,
  reveal,
  newRound,
  makeAdmin,
}: {
  room: RoomState | null;
  myId: string | null;
  voters: PublicParticipant[];
  votesIn: number;
  results: RoundResults | null;
  devResults: RoundResults | null;
  qaResults: RoundResults | null;
  isAdmin: boolean;
  reveal: () => void;
  newRound: () => void;
  makeAdmin: (targetId: string) => void;
}) {
  const seats = room?.participants ?? [];

  return (
    <main className="table-zone">
      <div className="table-wrap">
        <div className="felt-table">
          <TableStatusPanel
            revealed={Boolean(room?.revealed)}
            results={results}
            devResults={devResults}
            qaResults={qaResults}
            voters={voters}
            votesIn={votesIn}
            isAdmin={isAdmin}
            reveal={reveal}
            newRound={newRound}
          />
        </div>

        {seats.map((p, i) => (
          <Seat
            key={p.id}
            participant={p}
            index={i}
            total={seats.length}
            isMe={p.id === myId}
            isSeatAdmin={p.id === room?.adminId}
            revealed={Boolean(room?.revealed)}
            isAdmin={isAdmin}
            makeAdmin={makeAdmin}
          />
        ))}
      </div>
    </main>
  );
}
