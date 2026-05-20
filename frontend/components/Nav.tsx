'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { T } from '@/lib/tokens';
import { trunc } from '@/lib/utils';
import { useApp } from '@/lib/store';

const LINKS: [string, string][] = [
  ['/',              'Home'      ],
  ['/proposals',     'Proposals' ],
  ['/proposals/new', '+ Propose' ],
];

export function Nav() {
  const { connected, address, connect, disconnect } = useApp();
  const pathname = usePathname();

  return (
    <nav style={{
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'space-between',
      padding:         '12px 28px',
      background:      T.s1,
      borderBottom:    `1px solid ${T.bdr}`,
      position:        'sticky',
      top:             0,
      zIndex:          100,
    }}>
      {/* Brand */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, background: T.g, borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            color: T.bg, fontWeight: 800, fontSize: 13,
            fontFamily: "'DM Mono', monospace",
          }}>V</span>
        </div>
        <span className="serif" style={{ fontSize: 16, fontWeight: 700, color: T.tx }}>
          ClarityVote
        </span>
      </Link>

      {/* Links + wallet */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {LINKS.map(([href, label]) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                padding:    '5px 13px',
                borderRadius: 6,
                background: active ? T.s3 : 'transparent',
                border:     `1px solid ${active ? T.bdh : 'transparent'}`,
                color:      active ? T.tx  : T.mu,
                fontSize:   13,
                fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {label}
            </Link>
          );
        })}

        {connected ? (
          <>
            <span
              className="mono"
              style={{
                padding:      '4px 12px',
                background:   T.s2,
                border:       `1px solid ${T.bdr}`,
                borderRadius: 20,
                fontSize:     11,
                color:        T.mu,
                marginLeft:   4,
              }}
            >
              {trunc(address, 10)}
            </span>
            <button
              onClick={disconnect}
              style={{
                padding:    '5px 12px',
                background: 'transparent',
                border:     `1px solid ${T.bdr}`,
                borderRadius: 6,
                color:      T.mu,
                fontSize:   13,
                fontFamily: "'DM Sans', sans-serif",
                cursor:     'pointer',
              }}
            >
              ↩
            </button>
          </>
        ) : (
          <button
            onClick={connect}
            style={{
              padding:      '7px 18px',
              background:   T.g,
              border:       'none',
              borderRadius: 7,
              color:        T.bg,
              fontSize:     13,
              fontWeight:   700,
              fontFamily:   "'DM Sans', sans-serif",
              cursor:       'pointer',
              marginLeft:   4,
            }}
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}
