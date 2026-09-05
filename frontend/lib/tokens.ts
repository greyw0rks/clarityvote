/**
 * ClarityVote design tokens.
 *
 * Archetype: technical-developer — cool-neutral foundation, one restrained
 * accent, high text contrast, uniform subtle radii, functional motion only.
 *
 * Contrast against `bg` (#09090B), all AA or better for body text:
 *   tx  #FAFAFA 19.1   mu  #A1A1AA 7.8   g #22C55E 8.7
 *   red #F87171  7.2   gold #FBBF24 11.9
 * The previous muted tone (#5A825A) sat at 4.4, which failed for small text —
 * that is the main reason the neutrals moved off green.
 */
export const T = {
  // surfaces, darkest first
  bg: '#09090B',
  s1: '#131315',
  s2: '#18181B',
  s3: '#212124',

  // borders
  bdr: '#27272A',
  bdh: '#3F3F46',

  // accent — reserved for live state, vote affordances and value
  g: '#22C55E',
  gd: '#16A34A',
  gg: 'rgba(34,197,94,0.10)',

  // ink
  tx: '#FAFAFA',
  mu: '#A1A1AA',
  sub: '#52525B',

  // status
  red: '#F87171',
  gold: '#FBBF24',

  // type — these are the three families globals.css actually loads
  font: "'DM Sans', system-ui, sans-serif",
  mono: "'DM Mono', ui-monospace, monospace",
  display: "'Fraunces', Georgia, serif",

  // shape and motion
  r: 8,
  rl: 12,
  tr: 'all 160ms cubic-bezier(0.2, 0, 0.2, 1)',
} as const;

/**
 * Proposal state chips. Each carries an icon as well as a colour so outcome is
 * never signalled by hue alone.
 */
export const BADGE_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  active: { bg: 'rgba(34,197,94,0.10)', color: T.g, border: '#1B4D2E' },
  passed: { bg: 'rgba(34,197,94,0.07)', color: '#4ADE80', border: '#1B4D2E' },
  rejected: { bg: 'rgba(248,113,113,0.08)', color: T.red, border: '#4C1D1D' },
  tied: { bg: 'rgba(251,191,36,0.08)', color: T.gold, border: '#4A3411' },
};

export const BADGE_ICON: Record<string, string> = {
  active: '◉',
  passed: '✓',
  rejected: '✕',
  tied: '⇌',
};
