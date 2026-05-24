export function toSTX(micro: bigint): string {
  const n = Number(micro) / 1e6;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toFixed(0);
}

export function pct(part: bigint, total: bigint): number {
  if (!total || total === 0n) return 0;
  return Math.round((Number(part) * 100) / Number(total));
}

export function trunc(a: string, n = 9): string {
  if (!a) return '';
  return `${a.slice(0, n)}…${a.slice(-4)}`;
}

export function t2blocks(b: number): string {
  if (b <= 0) return 'Closed';
  const m = b * 10;
  if (m < 60)   return `~${m}m`;
  if (m < 1440) return `~${Math.round(m / 60)}h`;
  return `~${Math.round(m / 1440)}d`;
}

/** Estimate wall-clock date for a future block (10 min/block). */
export function blocksToDate(blocksFromNow: number): string {
  const ms   = blocksFromNow * 10 * 60 * 1000;
  const date = new Date(Date.now() + ms);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Format a Stacks principal for display (prefix + last 4). */
export function formatProposer(addr: string, prefixLen = 12): string {
  if (!addr || addr.length < prefixLen + 4) return addr;
  return `${addr.slice(0, prefixLen)}…${addr.slice(-4)}`;
}

/** Estimate wall-clock date for a future block (10 min/block). */
export function blocksToDate(blocksFromNow: number): string {
  const ms   = blocksFromNow * 10 * 60 * 1000;
  const date = new Date(Date.now() + ms);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Format a Stacks principal for display (prefix + last 4). */
export function formatProposer(addr: string, prefixLen = 12): string {
  if (!addr || addr.length < prefixLen + 4) return addr;
  return `${addr.slice(0, prefixLen)}…${addr.slice(-4)}`;
}

/** Returns true if a proposal voting window is still open. */
export function isActive(blocksLeft: number, finalized: boolean): boolean {
  return !finalized && blocksLeft > 0;
}

/** Format microSTX as a full STX string with 6 decimal places. */
export function toSTXFull(micro: bigint): string {
  const stx = Number(micro) / 1_000_000;
  return stx.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

/** Clamp a percentage value between 0 and 100. */
export function clampPct(n: number): number {
  return Math.min(100, Math.max(0, n));
}

/** Returns a short relative-time string for a past block count. */
export function blocksAgo(blocks: number): string {
  const m = blocks * 10;
  if (m < 60)   return `${m}m ago`;
  if (m < 1440) return `${Math.round(m / 60)}h ago`;
  return `${Math.round(m / 1440)}d ago`;
}

/** Pluralise a word based on count. */
export function plural(n: number, word: string, suffix = 's'): string {
  return `${n} ${word}${n === 1 ? '' : suffix}`;
}

/** Copy text to clipboard; returns true on success. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Returns the proposal with highest total voting power. */
export function topByTurnout<T extends { totalPower: bigint }>(items: T[]): T | null {
  if (!items.length) return null;
  return items.reduce((best, p) => p.totalPower > best.totalPower ? p : best);
}

/** Filter to only active non-finalized proposals. */
export function filterActive<T extends { state: string }>(items: T[]): T[] {
  return items.filter(p => p.state === 'active');
}

/** Stable colour from a string — for address avatars. */
export function stringToColor(s: string): string {
  const palette = ['#00D87C','#E8A830','#F06060','#5A82CA','#A068F0'];
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

/** Returns yes-vote percentage rounded to 1 decimal place. */
export function yesPct1dp(yes: bigint, total: bigint): string {
  if (!total || total === 0n) return '0.0';
  return ((Number(yes) * 100) / Number(total)).toFixed(1);
}
