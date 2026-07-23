import type { PublicParticipant } from './types';

export const DECK: string[] = ['0', '½', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', '☕'];

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export const NAME_KEY = 'scrum-poker:name';

export function cardNumericValue(value: string): number | null {
  if (value === '½') return 0.5;
  const n = Number(value);
  return Number.isFinite(n) ? n : null; // '?' and '☕' → null
}

export function randomRoomId(): string {
  return String(Math.floor(10000000 + Math.random() * 90000000));
}

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

/** Position (as CSS percentages) for seat `index` of `total` around the table ellipse. */
export function seatStyle(index: number, total: number): { left: string; top: string } {
  const angle = (-90 + (360 / Math.max(total, 1)) * index) * (Math.PI / 180);
  const left = 50 + 41 * Math.cos(angle);
  const top = 50 + 40 * Math.sin(angle);
  return { left: `${left}%`, top: `${top}%` };
}
