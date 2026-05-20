import { BADGE_STYLES, BADGE_ICON } from '@/lib/tokens';
import type { ProposalState } from '@/lib/types';

export function Badge({ state }: { state: ProposalState }) {
  const b = BADGE_STYLES[state] ?? BADGE_STYLES.active;
  return (
    <span
      className="pill"
      style={{ background: b.bg, color: b.color, border: `1px solid ${b.border}` }}
    >
      <span style={{ fontSize: 8 }}>{BADGE_ICON[state]}</span>
      {state}
    </span>
  );
}
