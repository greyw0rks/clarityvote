/** Compact microSTX display: 1.25M / 250K / 900. */
export function toSTX(micro: bigint): string {
  const n = Number(micro) / 1e6;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toFixed(0);
}

/** Full microSTX display with thousands separators. */
export function toSTXFull(micro: bigint): string {
  return (Number(micro) / 1e6).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

/** STX string ("1.5") → microSTX bigint. */
export function stxToMicro(stx: string): bigint {
  const n = parseFloat(stx);
  if (!Number.isFinite(n) || n < 0) return 0n;
  return BigInt(Math.round(n * 1_000_000));
}

export function pct(part: bigint, total: bigint): number {
  if (!total || total === 0n) return 0;
  return Math.round((Number(part) * 100) / Number(total));
}

export function trunc(a: string, n = 9): string {
  if (!a) return '';
  return `${a.slice(0, n)}…${a.slice(-4)}`;
}

/** Remaining blocks as approximate wall-clock time. Stacks averages ~10 min. */
export function t2blocks(b: number): string {
  if (b <= 0) return 'CLOSED';
  const m = b * 10;
  if (m < 60) return `~${m}M`;
  if (m < 1440) return `~${Math.round(m / 60)}H`;
  return `~${Math.round(m / 1440)}D`;
}

/** Estimated calendar date a future block lands on. */
export function blocksToDate(blocksFromNow: number): string {
  const date = new Date(Date.now() + blocksFromNow * 10 * 60 * 1000);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Estimated calendar date + time a block (offset from the current tip) lands on. */
export function blockToDateTime(blocksFromNow: number): string {
  const date = new Date(Date.now() + blocksFromNow * 10 * 60 * 1000);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const CHOICE_LABEL = { 1: 'YES', 2: 'NO', 3: 'ABSTAIN' } as const;

export function choiceLabel(choice: 1 | 2 | 3): string {
  return CHOICE_LABEL[choice];
}

/** Zero-padded unit id for the telemetry aesthetic: 7 → "PROP-0007". */
export function unitId(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(4, '0')}`;
}
