'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import {
  fetchProposal, fetchBlockHeight, fetchVote, fetchDelegationInfo,
  explorerAddressUrl,
} from '@/lib/contract';
import type { Proposal, VoteChoice, VoteRecord, DelegationInfo } from '@/lib/types';
import { VoteBar } from '@/components/VoteBar';
import { QuorumBar } from '@/components/QuorumBar';
import { StateBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toSTXFull, trunc, t2blocks, unitId, choiceLabel } from '@/lib/utils';

const CHOICES: { c: VoteChoice; label: string; cls: string }[] = [
  { c: 1, label: 'YES', cls: 'border-ink bg-paper text-ink hover:bg-ink hover:text-paper' },
  { c: 3, label: 'ABSTAIN', cls: 'border-ink bg-paper text-ink hover:bg-ink hover:text-paper' },
  { c: 2, label: 'NO', cls: 'border-hazard bg-paper text-hazard hover:bg-hazard hover:text-paper' },
];

export default function ProposalDetail() {
  const params = useParams();
  const id = Number(params.id);
  const { connected, address, pending, castVote, finalizeProposal, cancelProposal } = useApp();

  const [p, setP] = useState<Proposal | null>(null);
  const [tip, setTip] = useState(0);
  const [myVote, setMyVote] = useState<VoteRecord | null>(null);
  const [del, setDel] = useState<DelegationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<VoteChoice | 'finalize' | 'cancel' | null>(null);

  const load = useCallback(async () => {
    const t = await fetchBlockHeight().catch(() => 0);
    setTip(t);
    const prop = await fetchProposal(id, t).catch(() => null);
    setP(prop);
    if (address) {
      fetchVote(id, address).then(setMyVote).catch(() => setMyVote(null));
      fetchDelegationInfo(address).then(setDel).catch(() => setDel(null));
    }
    setLoading(false);
  }, [id, address]);

  useEffect(() => { load(); }, [load]);
  // Re-read when a pending tx resolves.
  useEffect(() => { if (pending.length) load(); }, [pending.length, load]);

  async function vote(c: VoteChoice) {
    setBusy(c);
    await castVote(id, c);
    setBusy(null);
    setTimeout(load, 1500);
  }
  async function doFinalize() { setBusy('finalize'); await finalizeProposal(id); setBusy(null); setTimeout(load, 1500); }
  async function doCancel() { setBusy('cancel'); await cancelProposal(id); setBusy(null); setTimeout(load, 1500); }

  if (loading) {
    return <div className="px-6 py-24 text-center macro text-3xl md:px-10"><span className="blink">READING CHAIN…</span></div>;
  }
  if (!p) {
    return (
      <div className="px-6 py-24 text-center md:px-10">
        <div className="macro text-4xl">UNIT NOT FOUND</div>
        <p className="mt-2 mono text-[0.7rem] uppercase tracking-widest text-ink-3">{unitId('PROP', id)} DOES NOT EXIST ON CHAIN</p>
        <Link href="/proposals"><Button className="mt-5" variant="outline">« BACK TO REGISTRY</Button></Link>
      </div>
    );
  }

  const windowOpen = tip < p.endBlock && !p.finalized;
  const canFinalize = tip >= p.endBlock && !p.finalized;
  const canCancel = connected && address === p.proposer && tip < p.startBlock && p.state === 'active';
  const alreadyVoted = !!myVote;

  return (
    <div className="px-6 py-10 md:px-10">
      <Link href="/proposals" className="mono text-[0.7rem] font-bold uppercase tracking-widest text-ink-3 hover:text-hazard">
        « REGISTRY
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <div className="tele mb-2">{unitId('PROP', p.id)} / PROPOSER {trunc(p.proposer, 6)}</div>
          <h1 className="macro text-4xl md:text-6xl">{p.title || 'UNTITLED'}</h1>
        </div>
        <StateBadge state={p.state} className="text-sm" />
      </div>

      <hr className="rule my-6" />

      <div className="grid gap-px bg-ink lg:grid-cols-[1.5fr_1fr]">
        {/* LEFT: body + tally */}
        <div className="space-y-6 bg-paper p-6">
          <div>
            <div className="tele mb-2">[ DESCRIPTION ]</div>
            <p className="whitespace-pre-wrap text-base leading-relaxed text-ink-2">
              {p.description || 'No description provided.'}
            </p>
          </div>

          <div>
            <div className="tele mb-2">[ TALLY ]</div>
            <VoteBar yes={p.yesVotes} no={p.noVotes} abstain={p.abstainVotes} />
          </div>

          <QuorumBar totalPower={p.totalPower} quorum={p.quorum} />
        </div>

        {/* RIGHT: actions + metadata */}
        <div className="space-y-6 bg-paper p-6">
          {/* CAST VOTE */}
          <div>
            <div className="tele mb-2">[ CAST BALLOT ]</div>
            {!connected ? (
              <p className="border-2 border-ink bg-paper-2 p-4 mono text-[0.7rem] uppercase tracking-widest text-ink-3">
                CONNECT WALLET TO VOTE
              </p>
            ) : alreadyVoted ? (
              <div className="border-2 border-ink bg-ink p-4 text-center text-paper">
                <div className="mono text-[0.65rem] uppercase tracking-widest opacity-70">YOU VOTED</div>
                <div className="macro mt-1 text-3xl">{choiceLabel(myVote!.choice)}</div>
                <div className="mono mt-1 text-[0.7rem] uppercase tracking-widest opacity-70">
                  {toSTXFull(myVote!.votingPower)} STX
                </div>
              </div>
            ) : windowOpen ? (
              <div className="grid grid-cols-3 gap-2">
                {CHOICES.map((ch) => (
                  <button
                    key={ch.c}
                    disabled={busy !== null}
                    onClick={() => vote(ch.c)}
                    className={`border-2 py-4 font-display text-sm font-black uppercase tracking-tight disabled:opacity-40 ${ch.cls}`}
                  >
                    {busy === ch.c ? '···' : ch.label}
                  </button>
                ))}
              </div>
            ) : (
              <p className="border-2 border-ink bg-paper-2 p-4 mono text-[0.7rem] uppercase tracking-widest text-ink-3">
                VOTING WINDOW CLOSED
              </p>
            )}

            {connected && del && windowOpen && !alreadyVoted && (
              <p className="mt-2 mono text-[0.65rem] uppercase tracking-widest text-ink-3">
                » EFFECTIVE WEIGHT {toSTXFull(del.effectiveWeight)} STX
                {del.delegatedWeight > 0n && ` (INCL. ${toSTXFull(del.delegatedWeight)} DELEGATED)`}
              </p>
            )}
          </div>

          {/* FINALIZE / CANCEL */}
          {(canFinalize || canCancel) && (
            <div className="space-y-2">
              {canFinalize && (
                <Button className="w-full" disabled={busy !== null} onClick={doFinalize}>
                  {busy === 'finalize' ? 'AWAITING WALLET…' : 'FINALIZE OUTCOME »'}
                </Button>
              )}
              {canCancel && (
                <Button className="w-full" variant="hazard" disabled={busy !== null} onClick={doCancel}>
                  {busy === 'cancel' ? 'AWAITING WALLET…' : 'CANCEL PROPOSAL ✕'}
                </Button>
              )}
            </div>
          )}

          {/* METADATA */}
          <div>
            <div className="tele mb-2">[ ON-CHAIN METADATA ]</div>
            <dl className="gridlines grid-cols-2 text-xs">
              <Meta k="STATE" v={p.state.toUpperCase()} />
              <Meta k="FINALIZED" v={p.finalized ? 'YES' : 'NO'} />
              <Meta k="START BLOCK" v={String(p.startBlock)} />
              <Meta k="END BLOCK" v={String(p.endBlock)} />
              <Meta k="CHAIN TIP" v={String(tip)} />
              <Meta k={windowOpen ? 'CLOSES IN' : 'WINDOW'} v={windowOpen ? t2blocks(p.blocksLeft) : 'CLOSED'} />
              <Meta k="QUORUM" v={`${toSTXFull(p.quorum)}`} />
              <Meta k="TURNOUT" v={`${toSTXFull(p.totalPower)}`} />
            </dl>
            <a
              href={explorerAddressUrl(p.proposer)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block mono text-[0.7rem] uppercase tracking-widest underline decoration-hazard decoration-2 underline-offset-2"
            >
              PROPOSER » {trunc(p.proposer, 8)}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-paper px-3 py-2">
      <dt className="mono text-[0.6rem] uppercase tracking-widest text-ink-3">{k}</dt>
      <dd className="mono mt-0.5 text-sm font-bold text-ink">{v}</dd>
    </div>
  );
}
