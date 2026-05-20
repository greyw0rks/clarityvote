import Link from 'next/link';
import { T } from '@/lib/tokens';

export function Footer() {
  return (
    <footer style={{
      borderTop:      `1px solid ${T.bdr}`,
      padding:        '20px 28px',
      display:        'flex',
      justifyContent: 'space-between',
      alignItems:     'center',
      fontSize:       12,
      color:          T.mu,
      background:     T.s1,
    }}>
      <span>
        <span className="serif" style={{ fontWeight: 700, color: T.tx }}>ClarityVote</span>
        {' '}· MIT © greyw0rks
      </span>

      <div style={{ display: 'flex', gap: 20 }}>
        <Link href="/proposals" style={{ color: T.mu }}>Proposals</Link>
        <Link href="/proposals/new" style={{ color: T.mu }}>Create</Link>
        <a
          href="https://github.com/greyw0rks"
          target="_blank"
          rel="noreferrer"
          style={{ color: T.mu }}
        >
          GitHub ↗
        </a>
      </div>
    </footer>
  );
}
