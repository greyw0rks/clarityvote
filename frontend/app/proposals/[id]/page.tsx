'use client';

import { useState } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { T } from '@/lib/tokens';
import { pct, toSTX, trunc, t2blocks } from '@/lib/utils';
import { useApp } from '@/lib/store';
import { Badge } from '@/components/Badge';
import { ConnectWall } from '@/components/ConnectWall';
import { Btn } from '@/components/Btn';
import type { VoteChoice } from '@/lib/types';

const CHOICE_LABEL: Record<VoteChoice, string> = { 1: 'Yes', 2: 'No', 3: 'Abstain' };
const CHOICE_COLOR: Record<VoteChoice, string> = { 1: T.g,   2: T.red, 3: T.mu      };

export default function ProposalDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const { proposals, connected, address, connect, votes, castVote, finalizeProposal } = useApp();

  const [busy, setBusy] = useState(false);

  const p = proposals.find(x => x.id === Number(id));
  if (!p) return notFound();

  const myVote     = votes[p.id] as VoteChoice | undefined;
  const canVote    = connected && p.state === 'active' && !p.finalized && !myVote;
  const canFinalize = p.state === 'active' && !p.finalized && p.blocksLeft <= 0;

  const yp = pct(p.yesVotes,     p.totalPower);
  const np = pct(p.noVotes,      p.totalPower);
  const ap = pct(p.abstainVotes, p.totalPower);
  const qp = p.quorum === 0n ? 100 : Math.min(pct(p.totalPower, p.quorum), 100);

  const handleVote = async (choice: VoteChoice) => {
    if (!canVote || busy) return;
    setBusy(true);
    await new Promise(r => setTimeout(r, 600));
    castVote(p.id, choice);
    setBusy(false);
  };

  const handleFinalize = async () => {
    if (busy) return;
    setBusy(true);
    await new Promise(r => setTimeout(r, 800));
    finalizeProposal(p.id);
    setBusy(false);
  };

  return (
    <div className="fade" style={{ maxWidth: 800, margin: '0 auto', padding: '40px 28px 80px' }}>

      {/* Back */}
      <button
        onClick={() => router.push('/proposals')}
        style={{
          background: 'none', border: 'none', color: T.mu,
          fontSize: 13, fontFamily: "'DM Sans', sans-serif",
          cursor: 'pointer', marginBottom: 28,
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        ← Proposals
      </button>

      {/* ── Header ───────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Badge state={p.state} />
          {!p.finalized && p.blocksLeft > 0 && (
            <span style={{ fontSize: 12, color: T.mu }}>Closes in {t2blocks(p.blocksLeft)}</span>
          )}
          {p.finalized && (
            <span style={{ fontSize: 12, color: T.mu }}>Finalized</span>
          )}
        </div>

        <h1 style={{
          fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
          fontWeight: 800, lineHeight: 1.15, marginBottom: 14,
        }}>
          {p.title}
        </h1>

        <p style={{ fontSize: 13, color: T.mu, marginBottom: 20 }}>
          Proposed by{' '}
          <span className="mono" style={{ color: T.tx, fontSize: 12 }}>{p.proposer}</span>
          {' '}· Blocks #{p.startBlock} → #{p.endBlock}
        </p>

        <p style={{ fontSize: 15, color: T.mu, lineHeight: 1.8 }}>{p.description}</p>
      </div>

      {/* ── Results ──────────────────────────────────────── */}
      <div className="card" style={{ padding: '24px', marginBottom: 16 }}>
        <h3 style={{
          fontSize: 14, fontWeight: 600, color: T.mu,
          letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 20,
        }}>
          Results
        </h3>

        {([
          { label: 'Yes',     val: p.yesVotes,     c: T.g,   p: yp },
          { label: 'No',      val: p.noVotes,      c: T.red, p: np },
          { label: 'Abstain', val: p.abstainVotes, c: T.mu,  p: ap },
        ] as const).map(row => (
          <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <span style={{ width: 56, fontSize: 13, fontWeight: 700, color: row.c }}>{row.label}</span>
            <div style={{ flex: 1, height: 8, background: T.s3, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${row.p}%`, height: '100%', background: row.c, transition: 'width .6s ease' }} />
            </div>
            <span style={{ width: 36, textAlign: 'right', fontSize: 13, fontWeight: 700, color: row.c }}>
              {row.p}%
            </span>
            <span className="mono" style={{ width: 80, textAlign: 'right', fontSize: 12, color: T.mu }}>
              {toSTX(row.val)} STX
            </span>
          </div>
        ))}

        {/* Quorum */}
        <div style={{ borderTop: `1px solid ${T.bdr}`, paddingTop: 16, marginTop: 4 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 13, color: T.mu, marginBottom: 6,
          }}>
            <span>
              Quorum{p.totalPower >= p.quorum ? ' ✓ met' : ` · ${toSTX(p.quorum)} STX needed`}
            </span>
            <span className="mono">{toSTX(p.totalPower)} / {toSTX(p.quorum)} STX</span>
          </div>
          <div style={{ height: 4, background: T.s3, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              width: `${qp}%`, height: '100%',
              background: p.totalPower >= p.quorum ? T.g : T.bdh,
              transition: 'width .6s ease',
            }} />
          </div>
        </div>
      </div>

      {/* ── My vote display ──────────────────────────────── */}
      {myVote && (
        <div className="card" style={{
          padding: '16px 20px', marginBottom: 16,
          background: 'rgba(0,216,124,.06)', borderColor: T.bdh,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>✓</span>
          <div>
            <span style={{ fontSize: 13, color: T.mu }}>Your vote · </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: CHOICE_COLOR[myVote] }}>
              {CHOICE_LABEL[myVote]}
            </span>
          </div>
          <span className="mono" style={{ marginLeft: 'auto', fontSize: 12, color: T.mu }}>
            100K STX power
          </span>
        </div>
      )}

      {/* ── Vote actions ─────────────────────────────────── */}
      {p.state === 'active' && !p.finalized && (
        <div className="card" style={{ padding: '24px', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Cast your vote</h3>
          <p style={{ fontSize: 13, color: T.mu, marginBottom: 18 }}>
            Voting power = your STX balance at time of vote
          </p>

          {!connected ? (
            <ConnectWall onConnect={connect} />
          ) : myVote ? (
            <p style={{ fontSize: 13, color: T.mu }}>You&apos;ve already voted on this proposal.</p>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              {([
                ['Yes',     1 as VoteChoice, T.g  ],
                ['No',      2 as VoteChoice, T.red ],
                ['Abstain', 3 as VoteChoice, T.mu  ],
              ] as const).map(([label, choice, color]) => (
                <VoteButton
                  key={choice}
                  label={label}
                  color={color}
                  disabled={busy}
                  onClick={() => handleVote(choice)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Finalize ─────────────────────────────────────── */}
      {canFinalize && (
        <div className="card" style={{
          padding: '20px 24px', marginBottom: 16,
          textAlign: 'center', borderColor: T.bdh,
        }}>
          <p style={{ fontSize: 14, color: T.mu, marginBottom: 14 }}>
            Voting window has closed. Anyone can finalize this proposal to record the result on-chain.
          </p>
          <Btn onClick={handleFinalize} disabled={busy}>
            {busy ? 'Finalizing…' : 'Finalize Proposal'}
          </Btn>
        </div>
      )}

      {/* ── On-chain metadata ────────────────────────────── */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <h3 style={{
          fontSize: 13, color: T.mu, letterSpacing: '.06em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: 16,
        }}>
          On-chain Info
        </h3>
        {([
          ['Contract',    'clarityvote.clar'                                             ],
          ['Proposal ID', `#${p.id}`                                                     ],
          ['Start Block', `#${p.startBlock}`                                             ],
          ['End Block',   `#${p.endBlock}`                                               ],
          ['Duration',    `${p.endBlock - p.startBlock} blocks (~${t2blocks(p.endBlock - p.startBlock)})`],
          ['Quorum',      `${toSTX(p.quorum)} STX`                                      ],
          ['State',       p.state.charAt(0).toUpperCase() + p.state.slice(1)            ],
        ] as const).map(([k, v]) => (
          <div key={k} style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '8px 0', borderBottom: `1px solid ${T.bdr}`, fontSize: 13,
          }}>
            <span style={{ color: T.mu }}>{k}</span>
            <span className="mono" style={{ color: T.tx, fontSize: 12 }}>{v}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

/* ── Inline VoteButton to avoid prop-drilling color hover logic ── */
function VoteButton({
  label, color, disabled, onClick,
}: {
  label:    string;
  color:    string;
  disabled: boolean;
  onClick:  () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex:         1,
        padding:      '12px 10px',
        background:   hov ? `${color}11` : 'transparent',
        border:       `1px solid ${hov ? color : T.bdr}`,
        borderRadius: 8,
        cursor:       disabled ? 'wait' : 'pointer',
        color:        hov ? color : T.mu,
        fontWeight:   700,
        fontSize:     15,
        fontFamily:   "'DM Sans', sans-serif",
        opacity:      disabled ? 0.5 : 1,
        transition:   'all .15s',
      }}
    >
      {label}
    </button>
  );
}
