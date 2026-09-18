/** Position (as CSS percentages) for seat `index` of `total` around the table ellipse. */
export function seatStyle(index: number, total: number): { left: string; top: string } {
  const angle = (-90 + (360 / Math.max(total, 1)) * index) * (Math.PI / 180);
  const left = 50 + 41 * Math.cos(angle);
  const top = 50 + 40 * Math.sin(angle);
  return { left: `${left}%`, top: `${top}%` };
}
