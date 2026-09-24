import { cn } from '@/lib/cn';
import type { ProposalState } from '@/lib/types';

const STATE_STYLES: Record<ProposalState, string> = {
  active: 'bg-ink text-paper border-ink',
  passed: 'bg-paper text-ink border-ink',
  rejected: 'bg-hazard text-paper border-hazard',
  tied: 'hatch text-ink border-ink',
};

const STATE_LABEL: Record<ProposalState, string> = {
  active: '● LIVE',
  passed: '✓ PASSED',
  rejected: '✕ REJECTED',
  tied: '= TIED',
};

export function StateBadge({ state, className }: { state: ProposalState; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center border-2 px-2 py-0.5 font-mono text-[0.65rem] font-bold uppercase tracking-widest',
        STATE_STYLES[state],
        className,
      )}
    >
      {STATE_LABEL[state]}
    </span>
  );
}

export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border-2 border-ink bg-paper px-2 py-0.5 font-mono text-[0.65rem] font-bold uppercase tracking-widest text-ink',
        className,
      )}
    >
      {children}
    </span>
  );
}
