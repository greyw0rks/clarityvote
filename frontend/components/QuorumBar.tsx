import { toSTX, pct } from '@/lib/utils';

/** Participation vs the quorum threshold. total-power is the votes cast so far. */
export function QuorumBar({ totalPower, quorum }: { totalPower: bigint; quorum: bigint }) {
  const reached = quorum > 0n && totalPower >= quorum;
  const p = quorum > 0n ? Math.min(100, pct(totalPower, quorum)) : 100;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="tele font-bold">QUORUM</span>
        <span className={`mono text-[0.7rem] font-bold uppercase ${reached ? 'text-ink' : 'text-hazard'}`}>
          {reached ? '✓ REACHED' : `${p}% OF ${toSTX(quorum)}`}
        </span>
      </div>
      <div className="h-3 w-full border-2 border-ink bg-paper">
        <div className={reached ? 'h-full bg-ink' : 'h-full hazard-stripe'} style={{ width: `${p}%` }} />
      </div>
    </div>
  );
}
