import { cn } from '@/lib/cn';

/** Big telemetry stat tile. Label on top (mono), oversized value below (macro). */
export function Stat({
  label, value, sub, accent, className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('bg-paper p-5', className)}>
      <div className="tele font-bold">{label}</div>
      <div className={cn('macro mt-1 text-4xl md:text-5xl', accent && 'text-hazard')}>{value}</div>
      {sub && <div className="mono mt-1 text-[0.7rem] uppercase tracking-widest text-ink-3">{sub}</div>}
    </div>
  );
}
