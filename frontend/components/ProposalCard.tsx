'use client';

import { useState } from 'react';
import Link from 'next/link';
import { T } from '@/lib/tokens';
import { trunc, t2blocks } from '@/lib/utils';
import { Badge } from './Badge';
import { VoteBar } from './VoteBar';
import { QuorumBar } from './QuorumBar';
import type { Proposal } from '@/lib/types';

export function ProposalCard({ p }: { p: Proposal }) {
  const [hov, setHov] = useState(false);

  return (
    <Link
      href={`/proposals/${p.id}`}
      className="card"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:     'block',
        padding:     '20px 24px',
        textDecoration: 'none',
        borderColor: hov ? T.bdh : T.bdr,
        background:  hov ? T.s2  : T.s1,
        transform:   hov ? 'translateY(-2px)' : 'none',
        boxShadow:   hov ? '0 8px 32px rgba(0,0,0,.4)' : 'none',
        transition:  'all .15s',
      }}
    >
      {/* Title row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: 8,
      }}>
        <h3 className="serif" style={{
          fontSize: 17, fontWeight: 700, color: T.tx,
          lineHeight: 1.3, flex: 1, marginRight: 16,
        }}>
          {p.title}
        </h3>
        <Badge state={p.state} />
      </div>

      {/* Meta */}
      <p style={{ fontSize: 12, color: T.mu, marginBottom: 14 }}>
        By {trunc(p.proposer)} ·{' '}
        {p.finalized ? 'Finalized' : `${t2blocks(p.blocksLeft)} left · #${p.id}`}
      </p>

      {/* Description preview */}
      <p style={{
        fontSize: 13, color: T.mu, lineHeight: 1.55, marginBottom: 16,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      } as React.CSSProperties}>
        {p.description}
      </p>

      <VoteBar yes={p.yesVotes} no={p.noVotes} abstain={p.abstainVotes} total={p.totalPower} />
      <div style={{ marginTop: 12 }}>
        <QuorumBar total={p.totalPower} quorum={p.quorum} />
      </div>
    </Link>
  );
}
