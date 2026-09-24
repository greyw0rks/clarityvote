import { CONTRACT_ID, explorerContractUrl, NETWORK_NAME } from '@/lib/contract';
import { APP_NAME } from '@/lib/config';

export function Footer() {
  return (
    <footer className="mt-24 border-t-2 border-ink">
      <div className="hazard-stripe h-3" />
      <div className="mx-auto grid max-w-[1400px] gap-px bg-ink md:grid-cols-3">
        <div className="bg-paper p-6">
          <div className="macro text-2xl">{APP_NAME}<span className="text-hazard">®</span></div>
          <p className="mt-2 mono text-[0.7rem] text-ink-3">
            ON-CHAIN GOVERNANCE / STACKS MAINNET / STX-WEIGHTED VOTES
          </p>
        </div>
        <div className="bg-paper p-6">
          <div className="tele mb-2">CORE CONTRACT</div>
          <a
            href={explorerContractUrl()}
            target="_blank"
            rel="noreferrer"
            className="mono block break-all text-xs text-ink underline decoration-hazard decoration-2 underline-offset-2"
          >
            {CONTRACT_ID || '— NOT CONFIGURED —'}
          </a>
        </div>
        <div className="bg-paper p-6">
          <div className="tele mb-2">SYSTEM</div>
          <dl className="mono space-y-1 text-xs">
            <div className="flex justify-between"><dt className="text-ink-3">NETWORK</dt><dd className="uppercase">{NETWORK_NAME}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-3">REV</dt><dd>2.0</dd></div>
            <div className="flex justify-between"><dt className="text-ink-3">UNIT</dt><dd>CV / D-01</dd></div>
          </dl>
        </div>
      </div>
    </footer>
  );
}
