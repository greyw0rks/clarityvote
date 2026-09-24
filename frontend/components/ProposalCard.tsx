import Link from 'next/link';
import type { Proposal, VoteChoice } from '@/lib/types';
import { StateBadge } from './ui/badge';
import { VoteBar } from './VoteBar';
import { QuorumBar } from './QuorumBar';
import { trunc, t2blocks, unitId, choiceLabel, blockToDateTime } from '@/lib/utils';

export function ProposalCard({ p, myVote }: { p: Proposal; myVote?: VoteChoice }) {
  // Stress-test seed proposals surface as recurring "daily votes" — label them
  // by their opening date/time rather than their placeholder title/body.
  const isStress = !p.title || /stress/i.test(p.title);
  const tip = p.endBlock - p.blocksLeft;
  const startedAt = blockToDateTime(p.startBlock - tip);

  return (
    <Link
      href={`/proposals/${p.id}`}
      className="group flex flex-col border-2 border-ink bg-paper p-5 hover:bg-paper-2"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="mono text-[0.7rem] font-bold tracking-widest text-ink-3">
          {unitId('PROP', p.id)}
        </span>
        <StateBadge state={p.state} />
      </div>

      <h3 className="macro mt-2 line-clamp-2 text-2xl leading-[0.9] group-hover:text-hazard">
        {isStress ? 'DAILY VOTE' : p.title}
      </h3>

      {isStress ? (
        <p className="mt-2 mono text-[0.75rem] font-bold uppercase tracking-widest text-ink-2">
          {startedAt}
        </p>
      ) : (
        <p className="mt-2 line-clamp-2 text-sm text-ink-2">{p.description}</p>
      )}

      <div className="mt-4">
        <VoteBar yes={p.yesVotes} no={p.noVotes} abstain={p.abstainVotes} />
      </div>

      <div className="mt-3">
        <QuorumBar totalPower={p.totalPower} quorum={p.quorum} />
      </div>

      <hr className="rule-thin my-4" />

      <dl className="flex items-center justify-between mono text-[0.7rem] uppercase tracking-widest">
        <div>
          <dt className="text-ink-3">PROPOSER</dt>
          <dd className="text-ink">{trunc(p.proposer, 6)}</dd>
        </div>
        <div className="text-right">
          <dt className="text-ink-3">{p.state === 'active' ? 'CLOSES' : 'STATUS'}</dt>
          <dd className="text-ink">{p.state === 'active' ? t2blocks(p.blocksLeft) : (p.finalized ? 'FINAL' : 'PENDING')}</dd>
        </div>
      </dl>

      {myVote && (
        <div className="mt-3 border-2 border-ink bg-ink px-2 py-1 text-center mono text-[0.65rem] font-bold uppercase tracking-widest text-paper">
          ★ YOU VOTED {choiceLabel(myVote)}
        </div>
      )}
    </Link>
  );
}
