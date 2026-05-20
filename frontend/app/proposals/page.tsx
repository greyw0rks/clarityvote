'use client';

import { useState } from 'react';
import Link from 'next/link';
import { T } from '@/lib/tokens';
import { useApp } from '@/lib/store';
import { Btn } from '@/components/Btn';
import { ProposalCard } from '@/components/ProposalCard';
import type { ProposalState } from '@/lib/types';

type Filter = 'all' | ProposalState;
const TABS: Filter[] = ['all', 'active', 'passed', 'rejected', 'tied'];

export default function ProposalsPage() {
  const { proposals } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const [query,  setQuery]  = useState('');

  const filtered = proposals
    .filter(p => filter === 'all' || p.state === filter)
    .filter(p => !query || p.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fade" style={{ maxWidth: 900, margin: '0 auto', padding: '48px 28px 80px' }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: 32,
        flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 4 }}>Proposals</h1>
          <p style={{ color: T.mu, fontSize: 14 }}>
            Community governance on Stacks · {proposals.length} total
          </p>
        </div>
        <Link href="/proposals/new">
          <Btn>+ New Proposal</Btn>
        </Link>
      </div>

      {/* Filters + search */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{
          display: 'flex', gap: 4,
          background: T.s2, padding: 4, borderRadius: 8,
          border: `1px solid ${T.bdr}`,
        }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{
                padding:      '5px 14px',
                borderRadius: 6,
                background:   filter === t ? T.s1 : 'transparent',
                border:       `1px solid ${filter === t ? T.bdr : 'transparent'}`,
                color:        filter === t ? T.tx  : T.mu,
                fontSize:     13, fontWeight: 500,
                fontFamily:   "'DM Sans', sans-serif",
                cursor:       'pointer',
                transition:   'all .12s',
                textTransform: 'capitalize',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <input
          placeholder="Search proposals…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ maxWidth: 220, padding: '7px 12px', fontSize: 13 }}
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center', color: T.mu }}>
          No proposals match this filter.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(p => <ProposalCard key={p.id} p={p} />)}
        </div>
      )}

    </div>
  );
}
