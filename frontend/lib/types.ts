export type ProposalState = 'active' | 'passed' | 'rejected' | 'tied';
export type VoteChoice = 1 | 2 | 3;
export type TxStatus = 'idle' | 'pending' | 'success' | 'error';

export interface Proposal {
  id: number;
  title: string;
  description: string;
  proposer: string;
  startBlock: number;
  endBlock: number;
  yesVotes: bigint;
  noVotes: bigint;
  abstainVotes: bigint;
  totalPower: bigint;
  quorum: bigint;
  state: ProposalState;
  finalized: boolean;
  /** Derived from the chain tip at read time, not stored on chain. */
  blocksLeft: number;
}

export interface VoteRecord {
  choice: VoteChoice;
  votingPower: bigint;
  block: number;
}

export interface CreateProposalInput {
  title: string;
  description: string;
  durationBlocks: number;
  quorum: bigint;
}

export interface DurationOption {
  label: string;
  blocks: number;
}

export interface QuorumOption {
  label: string;
  micro: bigint;
}

/** clarityvote-delegation snapshot for the connected wallet. */
export interface DelegationInfo {
  /** Who this account currently delegates to, or null. */
  delegatee: string | null;
  /** Weight (µSTX) delegated *to* this account by others. */
  delegatedWeight: bigint;
  /** Number of accounts delegating to this account. */
  delegatorCount: number;
  /** Own STX balance + delegated weight. */
  effectiveWeight: bigint;
  totalDelegations: number;
}

export type TimelockState = 'queued' | 'ready' | 'executed' | 'cancelled' | 'expired';

/** clarityvote-timelock queued entry. */
export interface QueuedProposal {
  proposalId: number;
  proposer: string;
  description: string;
  eta: number;
  queuedAt: number;
  executed: boolean;
  cancelled: boolean;
  ready: boolean;
  expired: boolean;
  blocksUntilEta: number;
  state: TimelockState;
}
