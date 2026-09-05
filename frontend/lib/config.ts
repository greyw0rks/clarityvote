import type { DurationOption, QuorumOption } from './types';

/** Stacks block cadence — used for every blocks↔time conversion in the UI. */
export const BLOCK_TIME_SECONDS = 600;
export const BLOCKS_PER_DAY = 144;
export const BLOCKS_PER_WEEK = 1008;

export const APP_NAME = 'ClarityVote';
export const APP_ICON = '/favicon.ico';

export const DURATION_OPTS: DurationOption[] = [
  { label: '1 day', blocks: BLOCKS_PER_DAY },
  { label: '3 days', blocks: BLOCKS_PER_DAY * 3 },
  { label: '1 week', blocks: BLOCKS_PER_WEEK },
  { label: '2 weeks', blocks: BLOCKS_PER_WEEK * 2 },
];

export const QUORUM_OPTS: QuorumOption[] = [
  { label: '1K STX', micro: 1_000_000_000n },
  { label: '100K STX', micro: 100_000_000_000n },
  { label: '1M STX', micro: 1_000_000_000_000n },
  { label: '5M STX', micro: 5_000_000_000_000n },
];

/** Contract limits, mirrored from contracts/clarityvote.clar. */
export const TITLE_MAX = 100;
export const DESCRIPTION_MAX = 500;
export const MIN_DURATION_BLOCKS = 144;
export const MAX_DURATION_BLOCKS = 20_160;
