'use client';

import {
  createContext, useContext, useState,
  type ReactNode,
} from 'react';
import { SEED, MOCK_WALLET, VOTER_POWER } from './mockData';
import type { Proposal, VoteChoice, CreateProposalInput } from './types';

interface AppState {
  connected:        boolean;
  address:          string;
  proposals:        Proposal[];
  votes:            Record<number, VoteChoice>;
  connect:          () => void;
  disconnect:       () => void;
  castVote:         (proposalId: number, choice: VoteChoice) => void;
  finalizeProposal: (proposalId: number) => void;
  createProposal:   (input: CreateProposalInput) => number;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected]   = useState(false);
  const [address,   setAddress]     = useState('');
  const [proposals, setProposals]   = useState<Proposal[]>(SEED);
  const [votes,     setVotes]       = useState<Record<number, VoteChoice>>({});

  const connect = () => {
    setConnected(true);
    setAddress(MOCK_WALLET);
  };

  const disconnect = () => {
    setConnected(false);
    setAddress('');
    // intentionally keep votes — they're on-chain, not session-bound
  };

  const castVote = (proposalId: number, choice: VoteChoice) => {
    if (votes[proposalId]) return;
    setVotes(v => ({ ...v, [proposalId]: choice }));
    setProposals(ps => ps.map(p => {
      if (p.id !== proposalId) return p;
      return {
        ...p,
        yesVotes:     choice === 1 ? p.yesVotes     + VOTER_POWER : p.yesVotes,
        noVotes:      choice === 2 ? p.noVotes      + VOTER_POWER : p.noVotes,
        abstainVotes: choice === 3 ? p.abstainVotes + VOTER_POWER : p.abstainVotes,
        totalPower:   p.totalPower + VOTER_POWER,
      };
    }));
  };

  const finalizeProposal = (proposalId: number) => {
    setProposals(ps => ps.map(p => {
      if (p.id !== proposalId) return p;
      const metQ   = p.totalPower >= p.quorum;
      const passed = p.yesVotes > p.noVotes && metQ;
      const tied   = p.yesVotes === p.noVotes && metQ;
      return {
        ...p,
        state:      passed ? 'passed' : tied ? 'tied' : 'rejected',
        finalized:  true,
        blocksLeft: 0,
      };
    }));
  };

  const createProposal = ({ title, description, durationBlocks, quorum }: CreateProposalInput): number => {
    const newId = Math.max(...proposals.map(p => p.id)) + 1;
    const newP: Proposal = {
      id: newId,
      title,
      description,
      proposer:     address,
      startBlock:   145500,
      endBlock:     145500 + durationBlocks,
      yesVotes:     0n,
      noVotes:      0n,
      abstainVotes: 0n,
      totalPower:   0n,
      quorum,
      state:        'active',
      finalized:    false,
      blocksLeft:   durationBlocks,
    };
    setProposals(ps => [newP, ...ps]);
    return newId;
  };

  return (
    <AppContext.Provider value={{
      connected, address, proposals, votes,
      connect, disconnect, castVote, finalizeProposal, createProposal,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
