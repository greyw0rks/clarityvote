'use client';

import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Stat } from '@/components/Stat';
import { ProposalCard } from '@/components/ProposalCard';

export default function Home() {
  const { total, proposals, votes, loading, connected, connect } = useApp();
  const active = proposals.filter((p) => p.state === 'active');
  const featured = (active.length ? active : proposals).slice(0, 3);

  return (
    <div>
      {/* HERO */}
      <section className="border-b-2 border-ink">
        <div className="hazard-stripe h-4" />
        <div className="grid gap-px bg-ink lg:grid-cols-[1.6fr_1fr]">
          <div className="bg-paper px-6 py-14 md:px-10 md:py-20">
            <div className="tele mb-4">[ DECENTRALIZED GOVERNANCE UNIT / STACKS MAINNET ]</div>
            <h1 className="macro text-[clamp(3.5rem,11vw,10rem)]">
              GOVERN<br />ON-<span className="text-hazard">CHAIN</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-snug text-ink-2">
              Proposals, votes, and outcomes recorded directly on the Stacks blockchain.
              Voting power is your live STX balance. No custody. No backroom tallies.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/proposals"><Button size="lg">VIEW PROPOSALS »</Button></Link>
              {connected
                ? <Link href="/proposals/new"><Button size="lg" variant="outline">NEW PROPOSAL +</Button></Link>
                : <Button size="lg" variant="outline" onClick={connect}>CONNECT WALLET</Button>}
            </div>
          </div>

          <div className="grid grid-rows-3 gap-px bg-ink">
            <Stat label="TOTAL PROPOSALS" value={loading ? '····' : total} accent />
            <Stat label="LIVE NOW" value={loading ? '··' : active.length} sub="OPEN FOR VOTING" />
            <Stat label="YOUR BALLOTS" value={Object.keys(votes).length} sub={connected ? 'VOTES CAST' : 'CONNECT TO TRACK'} />
          </div>
        </div>
      </section>

      {/* PROTOCOL */}
      <section className="border-b-2 border-ink px-6 py-12 md:px-10">
        <div className="tele mb-6">[ PROTOCOL / 03 STEPS ]</div>
        <div className="gridlines md:grid-cols-3">
          {[
            { n: '01', t: 'PROPOSE', d: 'Anyone can open a proposal with a voting window and a quorum threshold. It is written straight to the contract.' },
            { n: '02', t: 'VOTE', d: 'STX holders cast YES / NO / ABSTAIN. Weight equals your live STX balance plus any delegated to you.' },
            { n: '03', t: 'FINALIZE', d: 'After the window closes anyone can finalize. Outcome is computed on-chain from quorum and the tally.' },
          ].map((s) => (
            <div key={s.n} className="p-6">
              <div className="macro text-6xl text-hazard">{s.n}</div>
              <div className="macro mt-3 text-2xl">{s.t}</div>
              <p className="mt-2 text-sm text-ink-2">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="px-6 py-12 md:px-10">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="macro text-3xl">FEATURED</h2>
            <Link href="/proposals" className="mono text-[0.7rem] font-bold uppercase tracking-widest underline decoration-hazard decoration-2 underline-offset-4">
              ALL PROPOSALS »
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => <ProposalCard key={p.id} p={p} myVote={votes[p.id]} />)}
          </div>
        </section>
      )}
    </div>
  );
}
