export type ProposalState = 'active' | 'passed' | 'rejected' | 'tied';
export type VoteChoice   = 1 | 2 | 3;

export interface Proposal {
  id:           number;
  title:        string;
  description:  string;
  proposer:     string;
  startBlock:   number;
  endBlock:     number;
  yesVotes:     bigint;
  noVotes:      bigint;
  abstainVotes: bigint;
  totalPower:   bigint;
  quorum:       bigint;
  state:        ProposalState;
  finalized:    boolean;
  blocksLeft:   number;
}

export interface CreateProposalInput {
  title:          string;
  description:    string;
  durationBlocks: number;
  quorum:         bigint;
}

export interface DurationOption {
  label:  string;
  blocks: number;
}

export interface QuorumOption {
  label: string;
  micro: bigint;
}

export interface CreateResult {
  proposalId: number;
  txId:       string;
  status:     'pending' | 'confirmed' | 'failed';
}

export interface FinalizeResult {
  proposalId: number;
  state:      ProposalState;
  txId:       string;
}

export interface CreateResult {
  proposalId: number;
  txId:       string;
  status:     'pending' | 'confirmed' | 'failed';
}

export interface FinalizeResult {
  proposalId: number;
  state:      ProposalState;
  txId:       string;
}

export interface VoteRecord {
  choice:      VoteChoice;
  votingPower: bigint;
  block:       number;
}

export interface ProposalResults {
  yes:    bigint;
  no:     bigint;
  abstain: bigint;
  total:  bigint;
  quorum: bigint;
  passed: boolean;
}
