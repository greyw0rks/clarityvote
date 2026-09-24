import type { DurationOption, QuorumOption } from './types';

/** Stacks block cadence — used for every blocks↔time conversion in the UI. */
export const BLOCK_TIME_SECONDS = 600;
export const BLOCKS_PER_DAY = 144;
export const BLOCKS_PER_WEEK = 1008;

export const APP_NAME = 'ClarityVote';
export const APP_TAGLINE = 'On-chain governance for Stacks';
export const APP_ICON = '/Clarity.png';

export const DURATION_OPTS: DurationOption[] = [
  { label: '1 DAY', blocks: BLOCKS_PER_DAY },
  { label: '3 DAYS', blocks: BLOCKS_PER_DAY * 3 },
  { label: '1 WEEK', blocks: BLOCKS_PER_WEEK },
  { label: '2 WEEKS', blocks: BLOCKS_PER_WEEK * 2 },
];

export const QUORUM_OPTS: QuorumOption[] = [
  { label: '1K', micro: 1_000_000_000n },
  { label: '100K', micro: 100_000_000_000n },
  { label: '1M', micro: 1_000_000_000_000n },
  { label: '5M', micro: 5_000_000_000_000n },
];

/**
 * Contract limits, mirrored exactly from contracts/clarityvote.clar:
 *   title       (string-ascii 100)
 *   description (string-utf8 1000)
 * The old frontend capped these at 80/500 — narrower than the contract allows.
 */
export const TITLE_MAX = 100;
export const DESCRIPTION_MAX = 1000;
export const MIN_DURATION_BLOCKS = 1;
export const MAX_DURATION_BLOCKS = 20_160;
