export function asNumber(value: string | number | null | undefined): number {
  const parsed = typeof value === 'number' ? value : Number(value ?? '');
  return Number.isFinite(parsed) ? parsed : 0;
}
