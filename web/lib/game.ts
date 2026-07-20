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
