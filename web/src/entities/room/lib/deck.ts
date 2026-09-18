export const DECK: string[] = ['0', '½', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', '☕'];

export function cardNumericValue(value: string): number | null {
  if (value === '½') return 0.5;
  const n = Number(value);
  return Number.isFinite(n) ? n : null; // '?' and '☕' → null
}
