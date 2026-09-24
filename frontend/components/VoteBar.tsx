import { toSTX, pct } from '@/lib/utils';

/** Yes = solid ink · No = hazard red · Abstain = neutral hatch. */
export function VoteBar({ yes, no, abstain }: { yes: bigint; no: bigint; abstain: bigint }) {
  const total = yes + no + abstain;
  const y = pct(yes, total);
  const n = pct(no, total);
  const a = Math.max(0, 100 - y - n);

  return (
    <div>
      <div className="flex h-7 w-full border-2 border-ink bg-paper">
        {total === 0n ? (
          <div className="hatch flex-1 opacity-40" />
        ) : (
          <>
            <div className="bg-ink" style={{ width: `${y}%` }} />
            <div className="hatch" style={{ width: `${a}%` }} />
            <div className="bg-hazard" style={{ width: `${n}%` }} />
          </>
        )}
      </div>
      <dl className="mt-2 grid grid-cols-3 gap-px border-2 border-ink bg-ink">
        <Cell label="YES" value={toSTX(yes)} className="bg-paper" swatch="bg-ink" />
        <Cell label="ABSTAIN" value={toSTX(abstain)} className="bg-paper" swatch="hatch" />
        <Cell label="NO" value={toSTX(no)} className="bg-paper" swatch="bg-hazard" />
      </dl>
    </div>
  );
}

function Cell({ label, value, className, swatch }: {
  label: string; value: string; className: string; swatch: string;
}) {
  return (
    <div className={`px-2 py-1.5 ${className}`}>
      <div className="flex items-center gap-1.5">
        <span className={`h-2 w-2 border border-ink ${swatch}`} />
        <dt className="mono text-[0.6rem] font-bold uppercase tracking-widest text-ink-3">{label}</dt>
      </div>
      <dd className="macro mt-0.5 text-lg">{value}</dd>
    </div>
  );
}
