'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { T } from '@/lib/tokens';
import { useApp } from '@/lib/store';
import { DURATION_OPTS, QUORUM_OPTS } from '@/lib/mockData';
import { Btn } from '@/components/Btn';
import { ConnectWall } from '@/components/ConnectWall';

export default function NewProposalPage() {
  const router = useRouter();
  const { connected, connect, createProposal } = useApp();

  const [title,   setTitle]   = useState('');
  const [desc,    setDesc]    = useState('');
  const [durIdx,  setDurIdx]  = useState(1);
  const [quorIdx, setQuorIdx] = useState(1);
  const [busy,    setBusy]    = useState(false);
  const [error,   setError]   = useState('');

  const dur  = DURATION_OPTS[durIdx];
  const quor = QUORUM_OPTS[quorIdx];

  const validate = (): string => {
    if (!title.trim())     return 'Title is required.';
    if (title.length > 80) return 'Title must be 80 characters or fewer.';
    if (!desc.trim())      return 'Description is required.';
    return '';
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setBusy(true);
    await new Promise(r => setTimeout(r, 700)); // simulate tx
    const newId = createProposal({
      title:          title.trim(),
      description:    desc.trim(),
      durationBlocks: dur.blocks,
      quorum:         quor.micro,
    });
    setBusy(false);
    router.push(`/proposals/${newId}`);
  };

  return (
    <div className="fade" style={{ maxWidth: 680, margin: '0 auto', padding: '48px 28px 80px' }}>

      <button
        onClick={() => router.back()}
        style={{
          background: 'none', border: 'none', color: T.mu,
          fontSize: 13, fontFamily: "'DM Sans', sans-serif",
          cursor: 'pointer', marginBottom: 28,
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        ← Back
      </button>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 6 }}>New Proposal</h1>
      <p style={{ color: T.mu, fontSize: 14, marginBottom: 32 }}>
        Anyone can create a proposal. Voting power = live STX balance.
      </p>

      {!connected ? (
        <ConnectWall onConnect={connect} />
      ) : (
        <div className="card" style={{ padding: '28px' }}>

          {/* Title */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              fontSize: 13, fontWeight: 600, color: T.mu,
              display: 'block', marginBottom: 6,
            }}>
              Title <span style={{ fontWeight: 400 }}>({title.length}/80)</span>
            </label>
            <input
              placeholder="Short, descriptive title…"
              value={title}
              maxLength={80}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              fontSize: 13, fontWeight: 600, color: T.mu,
              display: 'block', marginBottom: 6,
            }}>
              Description
            </label>
            <textarea
              placeholder="Explain the proposal in detail — context, rationale, expected outcomes…"
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>

          {/* Duration */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              fontSize: 13, fontWeight: 600, color: T.mu,
              display: 'block', marginBottom: 10,
            }}>
              Voting Duration
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {DURATION_OPTS.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setDurIdx(i)}
                  style={{
                    padding:      '8px 16px',
                    borderRadius: 8,
                    cursor:       'pointer',
                    background:   durIdx === i ? T.gg : T.s2,
                    border:       `1px solid ${durIdx === i ? T.bdh : T.bdr}`,
                    color:        durIdx === i ? T.g  : T.mu,
                    fontSize:     13, fontWeight: 600,
                    fontFamily:   "'DM Sans', sans-serif",
                    transition:   'all .12s',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quorum */}
          <div style={{ marginBottom: 28 }}>
            <label style={{
              fontSize: 13, fontWeight: 600, color: T.mu,
              display: 'block', marginBottom: 10,
            }}>
              Quorum
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {QUORUM_OPTS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setQuorIdx(i)}
                  style={{
                    padding:      '8px 16px',
                    borderRadius: 8,
                    cursor:       'pointer',
                    background:   quorIdx === i ? T.gg : T.s2,
                    border:       `1px solid ${quorIdx === i ? T.bdh : T.bdr}`,
                    color:        quorIdx === i ? T.g  : T.mu,
                    fontSize:     13, fontWeight: 600,
                    fontFamily:   "'DM Sans', sans-serif",
                    transition:   'all .12s',
                  }}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={{
            background: T.s2, border: `1px solid ${T.bdr}`,
            borderRadius: 8, padding: '14px 16px', marginBottom: 24,
          }}>
            <p style={{
              fontSize: 12, color: T.mu, marginBottom: 8,
              fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase',
            }}>
              Preview
            </p>
            {([
              ['Duration', `${dur.blocks} blocks · ${dur.label}`       ],
              ['Quorum',   quor.label                                   ],
              ['Finalize', 'Anyone can call after window closes'        ],
              ['Power',    'Live STX balance at vote time'              ],
            ] as const).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0' }}>
                <span style={{ color: T.mu }}>{k}</span>
                <span className="mono" style={{ color: T.tx, fontSize: 12 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(240,96,96,.08)', border: `1px solid #3A1E1E`,
              borderRadius: 6, padding: '10px 14px', marginBottom: 16,
              fontSize: 13, color: T.red,
            }}>
              {error}
            </div>
          )}

          <Btn
            onClick={handleSubmit}
            disabled={busy || !title.trim() || !desc.trim()}
            full
          >
            {busy ? 'Submitting…' : 'Create Proposal →'}
          </Btn>

        </div>
      )}
    </div>
  );
}
