'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { ProposalCard } from '@/components/ProposalCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { cn } from '@/lib/cn';
import type { ProposalState } from '@/lib/types';

const FILTERS: { key: 'all' | ProposalState; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: 'active', label: 'LIVE' },
  { key: 'passed', label: 'PASSED' },
  { key: 'rejected', label: 'REJECTED' },
  { key: 'tied', label: 'TIED' },
];

export default function ProposalsPage() {
  const { proposals, votes, loading, hasMore, loadMore, total, connected } = useApp();
  const [filter, setFilter] = useState<'all' | ProposalState>('all');
  const [q, setQ] = useState('');

  const shown = useMemo(() => {
    const query = q.trim().toLowerCase();
    return proposals.filter((p) => {
      if (filter !== 'all' && p.state !== filter) return false;
      if (query && !`${p.title} ${p.description}`.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [proposals, filter, q]);

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="tele mb-1">[ REGISTRY / {total} UNITS ON CHAIN ]</div>
          <h1 className="macro text-5xl md:text-6xl">PROPOSALS</h1>
        </div>
        {connected && (
          <Link href="/proposals/new"><Button size="lg">NEW PROPOSAL +</Button></Link>
        )}
      </div>

      <hr className="rule my-6" />

      {/* CONTROLS */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-px border-2 border-ink bg-ink">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-4 py-2 font-mono text-[0.7rem] font-bold uppercase tracking-widest',
                filter === f.key ? 'bg-hazard text-paper' : 'bg-paper text-ink hover:bg-paper-2',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="md:w-72">
          <Input placeholder="SEARCH TITLE / BODY…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {/* GRID */}
      <div className="mt-6">
        {loading && proposals.length === 0 ? (
          <div className="border-2 border-ink bg-paper-2 p-16 text-center macro text-2xl">
            <span className="blink">READING CHAIN…</span>
          </div>
        ) : shown.length === 0 ? (
          <div className="border-2 border-ink bg-paper-2 p-16 text-center">
            <div className="macro text-2xl">NO MATCHES</div>
            <p className="mt-2 mono text-[0.7rem] uppercase tracking-widest text-ink-3">
              {proposals.length === 0 ? 'NO PROPOSALS ON CHAIN YET' : 'ADJUST FILTER OR SEARCH'}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((p) => <ProposalCard key={p.id} p={p} myVote={votes[p.id]} />)}
          </div>
        )}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <Button variant="outline" size="lg" onClick={loadMore} disabled={loading}>
            {loading ? 'LOADING…' : 'LOAD MORE »'}
          </Button>
        </div>
      )}
    </div>
  );
}
