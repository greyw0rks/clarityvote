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

/** Proposals ending within N blocks. */
export function endingSoon<T extends { blocksLeft: number; finalized: boolean }>(
  items: T[], within = 144
): T[] {
  return items.filter(p => !p.finalized && p.blocksLeft > 0 && p.blocksLeft <= within);
}

/** Human-readable vote choice string. */
export function choiceLabel(choice: number): string {
  return ({1:'Yes', 2:'No', 3:'Abstain'} as Record<number,string>)[choice] ?? 'Unknown';
}

/** Yes-over-no lead as a signed percentage of total power. */
export function yesLead(yes: bigint, no: bigint, total: bigint): number {
  if (!total || total === 0n) return 0;
  return Math.round(((Number(yes) - Number(no)) * 100) / Number(total));
}

/** Debounce a function by ms milliseconds. */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number) {
  let t: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/** Returns true when the voting window has closed. (batch 10) */
export function isWindowClosed10(blocksLeft: number): boolean {
  return blocksLeft <= 0;
}

/** Returns yes-vote share as a rounded percentage string. (batch 10) */
export function yesPctDisplay10(yes: bigint, total: bigint): string {
  if (!total || total === 0n) return '0%';
  return Math.round(Number(yes) * 100 / Number(total)) + '%';
}

/** Clamp a number between min and max. (batch 10) */
export function clamp10(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** Sleep for ms milliseconds. (batch 10) */
export const delay10 = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/** Returns true when the voting window has closed. (batch 11) */
export function isWindowClosed11(blocksLeft: number): boolean {
  return blocksLeft <= 0;
}

/** Returns yes-vote share as a rounded percentage string. (batch 11) */
export function yesPctDisplay11(yes: bigint, total: bigint): string {
  if (!total || total === 0n) return '0%';
  return Math.round(Number(yes) * 100 / Number(total)) + '%';
}

/** Clamp a number between min and max. (batch 11) */
export function clamp11(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** Sleep for ms milliseconds. (batch 11) */
export const delay11 = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/** Returns true when the voting window has closed. (batch 12) */
export function isWindowClosed12(blocksLeft: number): boolean {
  return blocksLeft <= 0;
}

/** Returns yes-vote share as a rounded percentage string. (batch 12) */
export function yesPctDisplay12(yes: bigint, total: bigint): string {
  if (!total || total === 0n) return '0%';
  return Math.round(Number(yes) * 100 / Number(total)) + '%';
}

/** Clamp a number between min and max. (batch 12) */
export function clamp12(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** Sleep for ms milliseconds. (batch 12) */
export const delay12 = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/** Returns true when the voting window has closed. (batch 13) */
export function isWindowClosed13(blocksLeft: number): boolean {
  return blocksLeft <= 0;
}

/** Returns yes-vote share as a rounded percentage string. (batch 13) */
export function yesPctDisplay13(yes: bigint, total: bigint): string {
  if (!total || total === 0n) return '0%';
  return Math.round(Number(yes) * 100 / Number(total)) + '%';
}

/** Clamp a number between min and max. (batch 13) */
export function clamp13(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** Sleep for ms milliseconds. (batch 13) */
export const delay13 = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/** Returns true when the voting window has closed. (batch 14) */
export function isWindowClosed14(blocksLeft: number): boolean {
  return blocksLeft <= 0;
}

/** Returns yes-vote share as a rounded percentage string. (batch 14) */
export function yesPctDisplay14(yes: bigint, total: bigint): string {
  if (!total || total === 0n) return '0%';
  return Math.round(Number(yes) * 100 / Number(total)) + '%';
}

/** Clamp a number between min and max. (batch 14) */
export function clamp14(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** Sleep for ms milliseconds. (batch 14) */
export const delay14 = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/** Returns true when the voting window has closed. (batch 15) */
export function isWindowClosed15(blocksLeft: number): boolean {
  return blocksLeft <= 0;
}

/** Returns yes-vote share as a rounded percentage string. (batch 15) */
export function yesPctDisplay15(yes: bigint, total: bigint): string {
  if (!total || total === 0n) return '0%';
  return Math.round(Number(yes) * 100 / Number(total)) + '%';
}

/** Clamp a number between min and max. (batch 15) */
export function clamp15(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** Sleep for ms milliseconds. (batch 15) */
export const delay15 = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/** Returns true when the voting window has closed. (batch 16) */
export function isWindowClosed16(blocksLeft: number): boolean {
  return blocksLeft <= 0;
}

/** Returns yes-vote share as a rounded percentage string. (batch 16) */
export function yesPctDisplay16(yes: bigint, total: bigint): string {
  if (!total || total === 0n) return '0%';
  return Math.round(Number(yes) * 100 / Number(total)) + '%';
}

/** Clamp a number between min and max. (batch 16) */
export function clamp16(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** Sleep for ms milliseconds. (batch 16) */
export const delay16 = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/** Returns true when the voting window has closed. (batch 17) */
export function isWindowClosed17(blocksLeft: number): boolean {
  return blocksLeft <= 0;
}

/** Returns yes-vote share as a rounded percentage string. (batch 17) */
export function yesPctDisplay17(yes: bigint, total: bigint): string {
  if (!total || total === 0n) return '0%';
  return Math.round(Number(yes) * 100 / Number(total)) + '%';
}

/** Clamp a number between min and max. (batch 17) */
export function clamp17(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** Sleep for ms milliseconds. (batch 17) */
export const delay17 = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

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

/** Proposals ending within N blocks. */
export function endingSoon<T extends { blocksLeft: number; finalized: boolean }>(
  items: T[], within = 144
): T[] {
  return items.filter(p => !p.finalized && p.blocksLeft > 0 && p.blocksLeft <= within);
}

/** Human-readable vote choice string. */
export function choiceLabel(choice: number): string {
  return ({1:'Yes', 2:'No', 3:'Abstain'} as Record<number,string>)[choice] ?? 'Unknown';
}

/** Yes-over-no lead as a signed percentage of total power. */
export function yesLead(yes: bigint, no: bigint, total: bigint): number {
  if (!total || total === 0n) return 0;
  return Math.round(((Number(yes) - Number(no)) * 100) / Number(total));
}

/** Debounce a function by ms milliseconds. */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number) {
  let t: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/** Returns true when the voting window has closed. (batch 10) */
export function isWindowClosed10(blocksLeft: number): boolean {
  return blocksLeft <= 0;
}

/** Returns yes-vote share as a rounded percentage string. (batch 10) */
export function yesPctDisplay10(yes: bigint, total: bigint): string {
  if (!total || total === 0n) return '0%';
  return Math.round(Number(yes) * 100 / Number(total)) + '%';
}

/** Clamp a number between min and max. (batch 10) */
export function clamp10(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
