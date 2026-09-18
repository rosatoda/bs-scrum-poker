import { cardNumericValue } from './deck';
import type { PublicParticipant } from '../model/types';

export interface RoundResults {
  average: number | null;
  consensus: string | null;
  castCount: number;
}

/** Average, consensus, and cast count for a revealed round. `voters` excludes spectators. */
export function computeResults(voters: PublicParticipant[]): RoundResults {
  const values = voters
    .map((p) => (p.vote != null ? cardNumericValue(p.vote) : null))
    .filter((v): v is number => v !== null);
  const cast = voters.filter((p) => p.vote != null);
  const average = values.length
    ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
    : null;
  const consensus =
    cast.length > 1 && cast.every((p) => p.vote === cast[0].vote) ? (cast[0].vote ?? null) : null;
  return { average, consensus, castCount: cast.length };
}
