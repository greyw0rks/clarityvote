export const T = {
  bg:  '#09100A', s1: '#101710', s2: '#161F16', s3: '#1C2A1C',
  bdr: '#1F2E1F', bdh: '#2A4230',
  g:   '#00D87C', gd: '#009E58', gg: 'rgba(0,216,124,.1)',
  tx:  '#D8EAD8', mu: '#5A825A', sub: '#2A3E2A',
  red: '#F06060', gold: '#E8A830',
} as const;

export const BADGE_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  active:   { bg: 'rgba(0,216,124,.09)',  color: T.g,       border: '#1A3A26' },
  passed:   { bg: 'rgba(0,200,100,.07)',  color: '#00C87A', border: '#173222' },
  rejected: { bg: 'rgba(240,96,96,.07)',  color: T.red,     border: '#3A1E1E' },
  tied:     { bg: 'rgba(232,168,48,.07)', color: T.gold,    border: '#3A2E14' },
};

export const BADGE_ICON: Record<string, string> = {
  active: '◉', passed: '✓', rejected: '✕', tied: '⇌',
};

/** Animation durations in ms — keep in sync with globals.css transitions. */
export const ANIM = {
  fast:   150,
  normal: 220,
  slow:   500,
} as const;

/** Z-index scale to avoid magic numbers in components. */
export const Z = {
  base:    0,
  card:    1,
  nav:     100,
  modal:   200,
  toast:   300,
} as const;

/** Spacing scale in px — multiples of 4. */
export const SP = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

/** Border radius scale matching --r and --rl CSS vars. */
export const RADIUS = {
  sm:  6,
  md:  12,
  lg:  18,
  full: 9999,
} as const;

/** Font size scale in px matching body=15px baseline. */
export const FS = {
  xs:  11,
  sm:  13,
  md:  15,
  lg:  17,
  xl:  22,
  h1:  32,
} as const;

/** Consistent border string presets. */
export const BORDER = {
  default: '1px solid #1F2E1F',
  hi:      '1px solid #2A4230',
  focus:   '1px solid #00D87C',
  error:   '1px solid #3A1E1E',
} as const;

/** Gap scale for flex/grid layouts. */
export const GAP = { xs:4, sm:8, md:12, lg:16, xl:24, xxl:32 } as const;

export const CURSOR = {
  pointer: 'pointer', wait: 'wait',
  disabled: 'not-allowed', text: 'text',
} as const;

export const BACKDROP = 'rgba(9, 16, 10, 0.85)';
