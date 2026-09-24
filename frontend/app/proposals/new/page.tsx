'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { ConnectWall } from '@/components/ConnectWall';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/field';
import { cn } from '@/lib/cn';
import { DURATION_OPTS, QUORUM_OPTS, TITLE_MAX, DESCRIPTION_MAX } from '@/lib/config';
import { toSTX, blocksToDate } from '@/lib/utils';

export default function NewProposalPage() {
  const { connected, createProposal } = useApp();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(DURATION_OPTS[2].blocks);
  const [quorum, setQuorum] = useState(QUORUM_OPTS[1].micro);
  const [busy, setBusy] = useState(false);

  const valid = title.trim().length > 0 && title.length <= TITLE_MAX && description.length <= DESCRIPTION_MAX && duration > 0;

  async function submit() {
    if (!valid || busy) return;
    setBusy(true);
    const txid = await createProposal({ title: title.trim(), description, durationBlocks: duration, quorum });
    setBusy(false);
    if (txid) router.push('/proposals');
  }

  if (!connected) {
    return (
      <div className="px-6 py-10 md:px-10">
        <h1 className="macro mb-6 text-5xl">NEW PROPOSAL</h1>
        <ConnectWall message="CONNECT A STACKS WALLET TO CREATE A PROPOSAL" />
      </div>
    );
  }

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="tele mb-1">[ AUTHORING / NEW GOVERNANCE UNIT ]</div>
      <h1 className="macro text-5xl md:text-6xl">NEW PROPOSAL</h1>
      <hr className="rule my-6" />

      <div className="grid gap-px bg-ink lg:grid-cols-[1.4fr_1fr]">
        {/* FORM */}
        <div className="space-y-6 bg-paper p-6">
          <Field label="TITLE" count={`${title.length}/${TITLE_MAX}`}>
            <Input
              value={title}
              maxLength={TITLE_MAX}
              placeholder="SHORT, SPECIFIC HEADLINE"
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>

          <Field label="DESCRIPTION" count={`${description.length}/${DESCRIPTION_MAX}`}>
            <Textarea
              rows={6}
              value={description}
              maxLength={DESCRIPTION_MAX}
              placeholder="WHAT IS BEING DECIDED, AND WHY. RATIONALE, LINKS, EXPECTED OUTCOME."
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          <div>
            <div className="tele mb-2 font-bold text-ink">VOTING WINDOW</div>
            <div className="grid grid-cols-4 gap-px border-2 border-ink bg-ink">
              {DURATION_OPTS.map((d) => (
                <button
                  key={d.blocks}
                  onClick={() => setDuration(d.blocks)}
                  className={cn(
                    'px-2 py-3 font-mono text-[0.7rem] font-bold uppercase tracking-widest',
                    duration === d.blocks ? 'bg-ink text-paper' : 'bg-paper hover:bg-paper-2',
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="tele mb-2 font-bold text-ink">QUORUM THRESHOLD (STX)</div>
            <div className="grid grid-cols-4 gap-px border-2 border-ink bg-ink">
              {QUORUM_OPTS.map((qo) => (
                <button
                  key={qo.label}
                  onClick={() => setQuorum(qo.micro)}
                  className={cn(
                    'px-2 py-3 font-mono text-[0.7rem] font-bold uppercase tracking-widest',
                    quorum === qo.micro ? 'bg-hazard text-paper' : 'bg-paper hover:bg-paper-2',
                  )}
                >
                  {qo.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="bg-paper p-6">
          <div className="tele mb-3">[ PREVIEW ]</div>
          <div className="border-2 border-ink bg-paper-2 p-5">
            <h3 className="macro text-2xl leading-[0.9]">{title || 'UNTITLED PROPOSAL'}</h3>
            <p className="mt-2 line-clamp-4 text-sm text-ink-2">{description || 'No description provided.'}</p>
            <hr className="rule-thin my-4" />
            <dl className="space-y-2 mono text-[0.7rem] uppercase tracking-widest">
              <Row k="WINDOW" v={`${duration} BLOCKS`} />
              <Row k="EST. CLOSE" v={blocksToDate(duration)} />
              <Row k="QUORUM" v={`${toSTX(quorum)} STX`} />
            </dl>
          </div>

          <Button className="mt-5 w-full" size="lg" disabled={!valid || busy} onClick={submit}>
            {busy ? 'AWAITING WALLET…' : 'SUBMIT TO CHAIN »'}
          </Button>
          <p className="mt-3 mono text-[0.65rem] uppercase leading-relaxed tracking-widest text-ink-3">
            » Permissionless. Your wallet signs one transaction. Voting opens immediately at the current block.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-3">{k}</dt>
      <dd className="text-ink">{v}</dd>
    </div>
  );
}
