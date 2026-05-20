'use client';

import { T } from '@/lib/tokens';
import { Btn } from './Btn';

export function ConnectWall({ onConnect }: { onConnect: () => void }) {
  return (
    <div
      className="card"
      style={{
        padding: '28px 24px',
        textAlign: 'center',
        borderColor: T.bdh,
        background: 'linear-gradient(135deg, rgba(0,216,124,.04), rgba(0,0,0,0))',
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 12 }}>🔐</div>
      <p className="serif" style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>
        Connect your wallet to vote
      </p>
      <p style={{ fontSize: 13, color: T.mu, marginBottom: 20 }}>
        Voting power equals your STX balance — no extra setup.
      </p>
      <Btn onClick={onConnect}>Connect Wallet</Btn>
    </div>
  );
}
