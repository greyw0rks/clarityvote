import { pct } from '@/lib/utils';
import { T } from '@/lib/tokens';

interface Props {
  yes:     bigint;
  no:      bigint;
  abstain: bigint;
  total:   bigint;
}

export function VoteBar({ yes, no, abstain, total }: Props) {
  const yp = pct(yes, total);
  const np = pct(no,  total);
  const ap = pct(abstain, total);

  return (
    <div>
      <div style={{
        height: 7, background: T.s3, borderRadius: 4,
        overflow: 'hidden', display: 'flex',
      }}>
        <div style={{ width: `${yp}%`, background: T.g,   transition: 'width .5s ease' }} />
        <div style={{ width: `${ap}%`, background: T.sub, transition: 'width .5s ease' }} />
        <div style={{ width: `${np}%`, background: T.red, transition: 'width .5s ease' }} />
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 12, color: T.mu, marginTop: 5,
      }}>
        <span style={{ color: T.g,   fontWeight: 600 }}>{yp}% Yes</span>
        <span>{ap}% Abstain</span>
        <span style={{ color: T.red, fontWeight: 600 }}>{np}% No</span>
      </div>
    </div>
  );
}
