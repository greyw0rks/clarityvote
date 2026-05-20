import { pct, toSTX } from '@/lib/utils';
import { T } from '@/lib/tokens';

interface Props {
  total:  bigint;
  quorum: bigint;
}

export function QuorumBar({ total, quorum }: Props) {
  const p   = quorum === 0n ? 100 : Math.min(pct(total, quorum), 100);
  const met = total >= quorum;

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 12, color: T.mu, marginBottom: 5,
      }}>
        <span>{met ? '✓ Quorum met' : 'Quorum'}</span>
        <span className="mono">{toSTX(total)} / {toSTX(quorum)} STX</span>
      </div>
      <div style={{ height: 3, background: T.s3, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          width: `${p}%`, height: '100%',
          background: met ? T.g : T.bdh,
          transition: 'width .5s ease',
        }} />
      </div>
    </div>
  );
}
