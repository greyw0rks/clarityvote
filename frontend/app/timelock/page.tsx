'use client';

import { useCallback, useEffect, useState } from 'react';
import { useApp } from '@/lib/store';
import {
  fetchTimelockAdmin, fetchTimelockDelay, fetchTimelockCounts, fetchQueuedList,
  buildQueueProposal, buildExecuteProposal, buildCancelQueued,
} from '@/lib/contract';
import type { QueuedProposal, TimelockState } from '@/lib/types';
import { ConnectWall } from '@/components/ConnectWall';
import { Stat } from '@/components/Stat';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/field';
import { cn } from '@/lib/cn';
import { trunc, t2blocks } from '@/lib/utils';

const STATE_CLS: Record<TimelockState, string> = {
  queued: 'bg-paper text-ink border-ink',
  ready: 'bg-ink text-paper border-ink',
  executed: 'bg-paper text-ink border-ink',
  cancelled: 'hatch text-ink border-ink',
  expired: 'bg-hazard text-paper border-hazard',
};

export default function TimelockPage() {
  const { connected, address, total, pending, submit } = useApp();

  const [admin, setAdmin] = useState('');
  const [delay, setDelay] = useState(0);
  const [counts, setCounts] = useState({ queued: 0, executed: 0 });
  const [list, setList] = useState<QueuedProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const [qId, setQId] = useState('');
  const [qDesc, setQDesc] = useState('');

  const load = useCallback(async () => {
    const [a, d, c, l] = await Promise.all([
      fetchTimelockAdmin().catch(() => ''),
      fetchTimelockDelay().catch(() => 0),
      fetchTimelockCounts().catch(() => ({ queued: 0, executed: 0 })),
      fetchQueuedList(total || 60).catch(() => []),
    ]);
    setAdmin(a); setDelay(d); setCounts(c); setList(l);
    setLoading(false);
  }, [total]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (pending.length) load(); }, [pending.length, load]);

  const isAdmin = connected && address && address === admin;

  async function queue() {
    const idNum = Number(qId);
    if (!Number.isInteger(idNum) || idNum < 1 || !qDesc.trim()) return;
    setBusy('queue');
    await submit(buildQueueProposal(idNum, qDesc.trim()), 'QUEUE');
    setBusy(null); setQId(''); setQDesc(''); setTimeout(load, 1500);
  }
  async function execute(id: number) {
    setBusy(`exec-${id}`); await submit(buildExecuteProposal(id), 'EXECUTE'); setBusy(null); setTimeout(load, 1500);
  }
  async function cancel(id: number) {
    setBusy(`cancel-${id}`); await submit(buildCancelQueued(id), 'CANCEL QUEUED'); setBusy(null); setTimeout(load, 1500);
  }

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="tele mb-1">[ EXECUTION TIMELOCK / clarityvote-timelock ]</div>
      <h1 className="macro text-5xl md:text-6xl">TIMELOCK</h1>
      <p className="mt-3 max-w-2xl text-ink-2">
        A mandatory delay between a passed proposal and its execution. Queued entries mature after the
        delay window, stay executable through a grace period, then expire. Admin-gated.
      </p>

      <hr className="rule my-6" />

      {loading ? (
        <div className="border-2 border-ink bg-paper-2 p-16 text-center macro text-2xl"><span className="blink">READING CHAIN…</span></div>
      ) : (
        <div className="space-y-px bg-ink">
          <div className="grid gap-px bg-ink md:grid-cols-4">
            <Stat label="DELAY" value={delay} sub="BURN BLOCKS" accent />
            <Stat label="QUEUED" value={counts.queued} sub="TOTAL EVER" />
            <Stat label="EXECUTED" value={counts.executed} sub="TOTAL EVER" />
            <Stat label="ADMIN" value={<span className="mono text-lg">{admin ? trunc(admin, 6) : '—'}</span>} sub={isAdmin ? '★ THAT IS YOU' : 'CONTROLLER'} />
          </div>

          {/* ADMIN: QUEUE FORM */}
          {isAdmin && (
            <div className="grid gap-px bg-ink lg:grid-cols-[1fr_2fr]">
              <div className="bg-paper p-6">
                <div className="tele mb-3">[ QUEUE PROPOSAL ]</div>
                <div className="space-y-4">
                  <Field label="PROPOSAL ID">
                    <Input type="number" min={1} placeholder="7" value={qId} onChange={(e) => setQId(e.target.value)} />
                  </Field>
                  <Field label="DESCRIPTION">
                    <Textarea rows={3} placeholder="EXECUTION NOTE…" value={qDesc} onChange={(e) => setQDesc(e.target.value)} />
                  </Field>
                  <Button className="w-full" disabled={!qId || !qDesc.trim() || busy !== null} onClick={queue}>
                    {busy === 'queue' ? 'AWAITING WALLET…' : 'QUEUE FOR EXECUTION »'}
                  </Button>
                </div>
              </div>
              <div className="bg-paper p-6">
                <div className="tele mb-3">[ CONTROLLER NOTES ]</div>
                <ul className="space-y-2 mono text-[0.7rem] uppercase leading-relaxed tracking-widest text-ink-3">
                  <li>» QUEUED ENTRIES MATURE AFTER {delay} BURN BLOCKS (ETA).</li>
                  <li>» EXECUTE ONLY AFTER ETA, BEFORE THE GRACE PERIOD EXPIRES.</li>
                  <li>» EXPIRED ENTRIES CANNOT BE EXECUTED — RE-QUEUE.</li>
                  <li>» CANCEL VOIDS A QUEUED ENTRY BEFORE EXECUTION.</li>
                </ul>
              </div>
            </div>
          )}

          {/* QUEUE LIST */}
          <div className="bg-paper p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="tele">[ ACTIVE QUEUE / SCAN OF {total} UNITS ]</div>
              {!connected && <span className="mono text-[0.65rem] uppercase tracking-widest text-ink-3">CONNECT AS ADMIN TO ACT</span>}
            </div>

            {list.length === 0 ? (
              <p className="border-2 border-ink bg-paper-2 p-10 text-center mono text-[0.7rem] uppercase tracking-widest text-ink-3">
                » NOTHING QUEUED IN THE SCANNED RANGE
              </p>
            ) : (
              <div className="space-y-3">
                {list.map((q) => (
                  <div key={q.proposalId} className="grid gap-px border-2 border-ink bg-ink md:grid-cols-[1fr_auto]">
                    <div className="bg-paper p-4">
                      <div className="flex items-center gap-3">
                        <span className="mono text-[0.7rem] font-bold tracking-widest text-ink-3">PROP-{String(q.proposalId).padStart(4, '0')}</span>
                        <span className={cn('border-2 px-2 py-0.5 mono text-[0.6rem] font-bold uppercase tracking-widest', STATE_CLS[q.state])}>
                          {q.state}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-ink-2">{q.description || '—'}</p>
                      <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 mono text-[0.65rem] uppercase tracking-widest text-ink-3">
                        <div>ETA <span className="text-ink">BLK {q.eta}</span></div>
                        <div>QUEUED <span className="text-ink">BLK {q.queuedAt}</span></div>
                        <div>MATURES <span className="text-ink">{q.ready ? 'NOW' : t2blocks(q.blocksUntilEta)}</span></div>
                        <div>PROPOSER <span className="text-ink">{trunc(q.proposer, 5)}</span></div>
                      </dl>
                    </div>
                    {isAdmin && !q.executed && !q.cancelled && (
                      <div className="flex items-stretch gap-px bg-ink md:flex-col">
                        <Button
                          className="flex-1 md:h-full"
                          size="sm"
                          disabled={!q.ready || q.expired || busy !== null}
                          onClick={() => execute(q.proposalId)}
                        >
                          {busy === `exec-${q.proposalId}` ? '···' : 'EXECUTE'}
                        </Button>
                        <Button
                          className="flex-1 md:h-full"
                          size="sm"
                          variant="hazard"
                          disabled={busy !== null}
                          onClick={() => cancel(q.proposalId)}
                        >
                          {busy === `cancel-${q.proposalId}` ? '···' : 'CANCEL'}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
