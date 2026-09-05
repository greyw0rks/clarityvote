'use client';

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from 'react';
import {
  CONTRACT_ID, NETWORK_NAME, PAGE_SIZE,
  buildCastVote, buildCreateProposal, buildFinalizeProposal,
  fetchProposalCount, fetchProposalPage, fetchVote,
} from './contract';
import type { Proposal, VoteChoice, CreateProposalInput } from './types';

/**
 * @stacks/connect reads window and localStorage the moment it loads, so it is
 * imported lazily. Pulling it into the module graph statically breaks the
 * prerender pass with "module factory is not available".
 */
const wallet = () => import('@stacks/connect');

type TxKind = 'vote' | 'create' | 'finalize';

interface PendingTx { kind: TxKind; txid: string; proposalId?: number }

interface AppState {
  connected: boolean;
  address: string;
  proposals: Proposal[];
  votes: Record<number, VoteChoice>;
  loading: boolean;
  error: string | null;
  pending: PendingTx[];
  total: number;
  hasMore: boolean;
  network: string;
  contractId: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  castVote: (proposalId: number, choice: VoteChoice) => Promise<void>;
  finalizeProposal: (proposalId: number) => Promise<void>;
  createProposal: (input: CreateProposalInput) => Promise<string | null>;
}

const AppContext = createContext<AppState | null>(null);

async function storedAddress(): Promise<string> {
  const { getLocalStorage } = await wallet();
  return getLocalStorage()?.addresses?.stx?.[0]?.address ?? '';
}

/**
 * Everything here reads from and writes to the deployed clarityvote contract.
 * Reads go through Hiro's read-only endpoint; writes are handed to the wallet,
 * which returns a txid. Chain state only changes once that transaction is mined,
 * so a write records a pending entry and re-reads rather than guessing the
 * outcome locally.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [votes, setVotes] = useState<Record<number, VoteChoice>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingTx[]>([]);
  const [total, setTotal] = useState(0);

  const loadVotes = useCallback(async (list: Proposal[], voter: string) => {
    if (!voter) { setVotes({}); return; }
    const entries = await Promise.all(list.map(async (p) => {
      const v = await fetchVote(p.id, voter).catch(() => null);
      return v ? ([p.id, v.choice] as const) : null;
    }));
    setVotes(Object.fromEntries(entries.filter(Boolean) as [number, VoteChoice][]));
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const highest = await fetchProposalCount();
      setTotal(highest);
      const list = await fetchProposalPage(highest, 0, PAGE_SIZE);
      setProposals(list);
      setError(null);
      await loadVotes(list, await storedAddress());
    } catch (e) {
      setError(`Could not read ${CONTRACT_ID} on ${NETWORK_NAME}: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [loadVotes]);

  /** Append the next page. The contract holds thousands of proposals. */
  const loadMore = useCallback(async () => {
    if (loading || proposals.length >= total) return;
    setLoading(true);
    try {
      const next = await fetchProposalPage(total, proposals.length, PAGE_SIZE);
      setProposals((prev) => [...prev, ...next]);
      const addr = await storedAddress();
      if (addr) {
        const extra = await Promise.all(next.map(async (p) => {
          const v = await fetchVote(p.id, addr).catch(() => null);
          return v ? ([p.id, v.choice] as const) : null;
        }));
        setVotes((prev) => ({
          ...prev,
          ...Object.fromEntries(extra.filter(Boolean) as [number, VoteChoice][]),
        }));
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [loading, proposals.length, total]);

  useEffect(() => {
    (async () => {
      const { isConnected } = await wallet();
      const already = isConnected();
      setConnected(already);
      setAddress(already ? await storedAddress() : '');
    })();
    refresh();
  }, [refresh]);

  const doConnect = useCallback(async () => {
    setError(null);
    try {
      const { connect } = await wallet();
      await connect();
      const addr = await storedAddress();
      setConnected(true);
      setAddress(addr);
      await loadVotes(proposals, addr);
    } catch (e) {
      // Closing the wallet popup rejects; that is a cancel, not a failure.
      const message = (e as Error).message ?? '';
      if (!/cancel|reject|closed/i.test(message)) setError(message || 'Wallet connection failed');
    }
  }, [loadVotes, proposals]);

  const doDisconnect = useCallback(() => {
    wallet().then(({ disconnect }) => disconnect());
    setConnected(false);
    setAddress('');
    setVotes({});
  }, []);

  /** Hand a contract call to the wallet and record the txid it returns. */
  const send = useCallback(async (
    kind: TxKind,
    call: { functionName: string; functionArgs: unknown[] },
    proposalId?: number,
  ): Promise<string | null> => {
    setError(null);
    try {
      const { request } = await wallet();
      const res = await request('stx_callContract', {
        contract: CONTRACT_ID as `${string}.${string}`,
        functionName: call.functionName,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        functionArgs: call.functionArgs as any,
        network: NETWORK_NAME as 'mainnet' | 'testnet',
      });
      const txid = res?.txid ?? null;
      if (txid) setPending((p) => [...p, { kind, txid, proposalId }]);
      return txid;
    } catch (e) {
      const message = (e as Error).message ?? '';
      if (!/cancel|reject|closed/i.test(message)) setError(message || `${kind} failed`);
      return null;
    }
  }, []);

  const castVote = useCallback(async (proposalId: number, choice: VoteChoice) => {
    if (votes[proposalId]) return;
    await send('vote', buildCastVote(proposalId, choice), proposalId);
  }, [send, votes]);

  const finalizeProposal = useCallback(async (proposalId: number) => {
    await send('finalize', buildFinalizeProposal(proposalId), proposalId);
  }, [send]);

  const createProposal = useCallback(async (input: CreateProposalInput) => {
    return send('create', buildCreateProposal(
      input.title, input.description, input.durationBlocks, input.quorum,
    ));
  }, [send]);

  // While a write is in flight, poll until the chain reflects it.
  useEffect(() => {
    if (pending.length === 0) return;
    const t = setInterval(() => { refresh(); }, 15_000);
    return () => clearInterval(t);
  }, [pending.length, refresh]);

  const value = useMemo<AppState>(() => ({
    connected, address, proposals, votes, loading, error, pending,
    total, hasMore: proposals.length < total,
    network: NETWORK_NAME, contractId: CONTRACT_ID,
    connect: doConnect, disconnect: doDisconnect, refresh, loadMore,
    castVote, finalizeProposal, createProposal,
  }), [
    connected, address, proposals, votes, loading, error, pending, total,
    doConnect, doDisconnect, refresh, loadMore, castVote, finalizeProposal, createProposal,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
