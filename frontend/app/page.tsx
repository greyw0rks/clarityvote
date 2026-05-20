import Link from 'next/link';
import { T } from '@/lib/tokens';

export default function HomePage() {
  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '80px 28px 64px', textAlign: 'center' }}>

      {/* Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'rgba(0,216,124,.1)', border: `1px solid rgba(0,216,124,.25)`,
        borderRadius: 20, padding: '4px 14px', fontSize: 12,
        fontWeight: 600, color: T.g, letterSpacing: '.04em', marginBottom: 28,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.g, display: 'inline-block' }} />
        Live on Stacks
      </div>

      {/* Headline */}
      <h1 style={{
        fontSize: 'clamp(2rem, 6vw, 3.2rem)', fontWeight: 800,
        lineHeight: 1.1, marginBottom: 20,
      }}>
        On-chain governance<br />
        for <span style={{ color: T.g }}>Stacks</span> communities
      </h1>

      <p style={{
        fontSize: 16, color: T.mu, lineHeight: 1.7,
        maxWidth: 520, margin: '0 auto 36px',
      }}>
        Create proposals, cast votes with your STX balance, and finalize results
        on-chain. Transparent. Permissionless. Unstoppable.
      </p>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
        <Link href="/proposals">
          <button style={{
            background: T.g, color: '#041a10', border: 'none',
            padding: '13px 28px', borderRadius: 8, fontSize: 15,
            fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>
            View proposals →
          </button>
        </Link>
        <Link href="/proposals/new">
          <button style={{
            background: 'transparent', color: T.mu,
            border: `1px solid ${T.bdr}`, padding: '13px 24px',
            borderRadius: 8, fontSize: 15, fontWeight: 500,
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>
            New proposal
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 40,
        flexWrap: 'wrap', padding: '28px 0',
        borderTop: `1px solid ${T.bdr}`, borderBottom: `1px solid ${T.bdr}`,
        marginBottom: 64,
      }}>
        {[
          ['100%', 'On-chain'],
          ['STX', 'Voting power'],
          ['Open', 'Permissionless'],
          ['Clarity', 'Smart contract'],
        ].map(([val, label]) => (
          <div key={label}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{val}</div>
            <div style={{ fontSize: 12, color: T.mu, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, textAlign: 'left' }}>
        {[
          ['STX-weighted votes', 'Voting power equals your live STX balance. No snapshots, no delegation.'],
          ['Permissionless', 'Anyone can create a proposal or cast a vote. No whitelist, no gatekeepers.'],
          ['On-chain finalization', 'Once voting closes, anyone can finalize and record the result in Clarity.'],
        ].map(([title, desc]) => (
          <div key={title} className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{title}</div>
            <div style={{ fontSize: 13, color: T.mu, lineHeight: 1.6 }}>{desc}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
