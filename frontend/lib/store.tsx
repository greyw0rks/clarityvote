'use client';

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';
import {
  CONTRACT_ID, NETWORK_NAME, PAGE_SIZE, decodeError, explorerUrl,
  buildCastVote, buildCreateProposal, buildFinalizeProposal, buildCancelProposal,
  fetchProposalCount, fetchProposalPage, fetchVote,
  type ContractCall,
} from './contract';
import type { Proposal, VoteChoice, CreateProposalInput } from './types';

/**
 * @stacks/connect reads window and localStorage the moment it loads, so it is
 * imported lazily. Pulling it into the module graph statically breaks the
 * prerender pass with "module factory is not available".
 */
const wallet = () => import('@stacks/connect');

interface PendingTx { label: string; txid: string }

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
  cancelProposal: (proposalId: number) => Promise<void>;
  createProposal: (input: CreateProposalInput) => Promise<string | null>;
  /** Generic contract-call submit, used by the delegation & timelock views. */
  submit: (call: ContractCall, label: string) => Promise<string | null>;
}

const AppContext = createContext<AppState | null>(null);

async function storedAddress(): Promise<string> {
  const { getLocalStorage } = await wallet();
  return getLocalStorage()?.addresses?.stx?.[0]?.address ?? '';
}

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
      toast.success('WALLET CONNECTED', { description: addr });
      await loadVotes(proposals, addr);
    } catch (e) {
      const message = (e as Error).message ?? '';
      // User dismissing the wallet picker is not an error worth surfacing.
      if (/cancel|reject|closed/i.test(message)) return;
      // A wallet extension that is installed but not set up (e.g. Talisman
      // before onboarding) rejects here. Without a toast the click looks dead,
      // because `error` is not rendered anywhere else in the UI.
      const hint = /configured|onboard/i.test(message)
        ? 'A wallet extension is installed but not set up. Finish its onboarding, disable it, or use Leather / Xverse.'
        : message;
      setError(hint || 'Wallet connection failed');
      toast.error('WALLET CONNECTION FAILED', { description: hint || 'Could not open a wallet.' });
    }
  }, [loadVotes, proposals]);

  const doDisconnect = useCallback(() => {
    wallet().then(({ disconnect }) => disconnect());
    setConnected(false);
    setAddress('');
    setVotes({});
  }, []);

  /** Hand a contract call to the wallet, toast the result, record the txid. */
  const submit = useCallback(async (call: ContractCall, label: string): Promise<string | null> => {
    setError(null);
    try {
      const { request } = await wallet();
      const res = await request('stx_callContract', {
        contract: call.contractId as `${string}.${string}`,
        functionName: call.functionName,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        functionArgs: call.functionArgs as any,
        network: NETWORK_NAME as 'mainnet' | 'testnet',
      });
      const txid = res?.txid ?? null;
      if (txid) {
        setPending((p) => [...p, { label, txid }]);
        toast.success(`${label} SUBMITTED`, {
          description: 'Broadcast to mempool',
          action: { label: 'EXPLORER', onClick: () => window.open(explorerUrl(txid), '_blank') },
        });
      }
      return txid;
    } catch (e) {
      const message = (e as Error).message ?? '';
      if (!/cancel|reject|closed/i.test(message)) {
        const msg = decodeError(message) || `${label} failed`;
        setError(msg);
        toast.error(`${label} FAILED`, { description: msg });
      }
      return null;
    }
  }, []);

  const castVote = useCallback(async (proposalId: number, choice: VoteChoice) => {
    if (votes[proposalId]) return;
    await submit(buildCastVote(proposalId, choice), 'VOTE');
  }, [submit, votes]);

  const finalizeProposal = useCallback(async (proposalId: number) => {
    await submit(buildFinalizeProposal(proposalId), 'FINALIZE');
  }, [submit]);

  const cancelProposal = useCallback(async (proposalId: number) => {
    await submit(buildCancelProposal(proposalId), 'CANCEL');
  }, [submit]);

  const createProposal = useCallback(async (input: CreateProposalInput) => {
    return submit(
      buildCreateProposal(input.title, input.description, input.durationBlocks, input.quorum),
      'CREATE PROPOSAL',
    );
  }, [submit]);

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
    castVote, finalizeProposal, cancelProposal, createProposal, submit,
  }), [
    connected, address, proposals, votes, loading, error, pending, total,
    doConnect, doDisconnect, refresh, loadMore, castVote, finalizeProposal,
    cancelProposal, createProposal, submit,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
