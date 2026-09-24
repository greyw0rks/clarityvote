'use client';

import { useCallback, useEffect, useState } from 'react';
import { useApp } from '@/lib/store';
import {
  fetchDelegationInfo, checkCircular,
  buildDelegate, buildRevokeDelegation, buildTransferDelegation,
  explorerAddressUrl,
} from '@/lib/contract';
import type { DelegationInfo } from '@/lib/types';
import { ConnectWall } from '@/components/ConnectWall';
import { Stat } from '@/components/Stat';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { toSTXFull, trunc } from '@/lib/utils';
import { toast } from 'sonner';

const PRINCIPAL_RE = /^S[PTMN][0-9A-HJKMNP-Z]{37,40}$/;

export default function DelegationPage() {
  const { connected, address, pending, submit } = useApp();
  const [info, setInfo] = useState<DelegationInfo | null>(null);
  const [target, setTarget] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!address) { setLoading(false); return; }
    const i = await fetchDelegationInfo(address).catch(() => null);
    setInfo(i);
    setLoading(false);
  }, [address]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (pending.length) load(); }, [pending.length, load]);

  const validTarget = PRINCIPAL_RE.test(target.trim());

  async function doDelegate(transfer: boolean) {
    const t = target.trim();
    if (!validTarget) return;
    if (t === address) { toast.error('CANNOT DELEGATE TO SELF'); return; }
    setBusy(transfer ? 'transfer' : 'delegate');
    const circular = await checkCircular(address, t).catch(() => false);
    if (circular) {
      toast.error('CIRCULAR DELEGATION', { description: 'That account already delegates to you.' });
      setBusy(null);
      return;
    }
    await submit(transfer ? buildTransferDelegation(t) : buildDelegate(t), transfer ? 'TRANSFER' : 'DELEGATE');
    setBusy(null);
    setTarget('');
    setTimeout(load, 1500);
  }

  async function doRevoke() {
    setBusy('revoke');
    await submit(buildRevokeDelegation(), 'REVOKE');
    setBusy(null);
    setTimeout(load, 1500);
  }

  const hasDelegation = !!info?.delegatee;

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="tele mb-1">[ VOTE DELEGATION / clarityvote-delegation ]</div>
      <h1 className="macro text-5xl md:text-6xl">DELEGATION</h1>
      <p className="mt-3 max-w-2xl text-ink-2">
        Assign your STX voting weight to another account. They vote on your behalf with your combined power.
        Revocable and transferable at any time. One hop only — circular delegation is rejected on-chain.
      </p>

      <hr className="rule my-6" />

      {!connected ? (
        <ConnectWall message="CONNECT A STACKS WALLET TO MANAGE DELEGATION" />
      ) : loading ? (
        <div className="border-2 border-ink bg-paper-2 p-16 text-center macro text-2xl"><span className="blink">READING CHAIN…</span></div>
      ) : (
        <div className="space-y-px bg-ink">
          {/* STATS */}
          <div className="grid gap-px bg-ink md:grid-cols-4">
            <Stat label="EFFECTIVE WEIGHT" value={info ? toSTXFull(info.effectiveWeight) : '0'} sub="STX (OWN + DELEGATED)" accent />
            <Stat label="DELEGATED TO YOU" value={info ? toSTXFull(info.delegatedWeight) : '0'} sub="STX INBOUND" />
            <Stat label="YOUR DELEGATORS" value={info?.delegatorCount ?? 0} sub="ACCOUNTS" />
            <Stat label="PROTOCOL TOTAL" value={info?.totalDelegations ?? 0} sub="ALL DELEGATIONS" />
          </div>

          {/* CURRENT STATE + ACTIONS */}
          <div className="grid gap-px bg-ink lg:grid-cols-2">
            <div className="bg-paper p-6">
              <div className="tele mb-3">[ YOUR OUTBOUND DELEGATION ]</div>
              {hasDelegation ? (
                <div className="border-2 border-ink bg-paper-2 p-5">
                  <div className="mono text-[0.7rem] uppercase tracking-widest text-ink-3">DELEGATING TO</div>
                  <a
                    href={explorerAddressUrl(info!.delegatee!)}
                    target="_blank"
                    rel="noreferrer"
                    className="macro mt-1 block break-all text-xl text-ink hover:text-hazard"
                  >
                    {trunc(info!.delegatee!, 12)}
                  </a>
                  <Button className="mt-4 w-full" variant="hazard" disabled={busy !== null} onClick={doRevoke}>
                    {busy === 'revoke' ? 'AWAITING WALLET…' : 'REVOKE DELEGATION ✕'}
                  </Button>
                </div>
              ) : (
                <p className="border-2 border-ink bg-paper-2 p-5 mono text-[0.7rem] uppercase tracking-widest text-ink-3">
                  » NO ACTIVE DELEGATION. YOU VOTE WITH YOUR OWN WEIGHT.
                </p>
              )}
            </div>

            <div className="bg-paper p-6">
              <div className="tele mb-3">[ {hasDelegation ? 'REASSIGN' : 'SET'} DELEGATE ]</div>
              <Field label="DELEGATEE PRINCIPAL" hint={target && !validTarget ? '⚠ NOT A VALID STACKS PRINCIPAL' : undefined}>
                <Input placeholder="SP…" value={target} onChange={(e) => setTarget(e.target.value)} />
              </Field>
              <Button
                className="mt-4 w-full"
                size="lg"
                disabled={!validTarget || busy !== null}
                onClick={() => doDelegate(hasDelegation)}
              >
                {busy ? 'AWAITING WALLET…' : hasDelegation ? 'TRANSFER DELEGATION »' : 'DELEGATE WEIGHT »'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
