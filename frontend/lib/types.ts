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

/** Pagination cursor for fetching proposal lists. */
export interface ProposalPage {
  proposals: Proposal[];
  total:     number;
  page:      number;
  pageSize:  number;
}

/** Possible tx broadcast states for optimistic UI updates. */
export type TxStatus = 'idle' | 'pending' | 'success' | 'error';

/** Shape of a Stacks explorer transaction link. */
export interface ExplorerLink {
  txId:    string;
  network: 'mainnet' | 'testnet';
  url:     string;
}

/** Notification shown after a successful or failed contract call. */
export interface ToastPayload {
  id:      string;
  type:    'success' | 'error' | 'info';
  message: string;
  txId?:   string;
}

/** Shape for a voter leaderboard entry. */
export interface VoterEntry {
  address:    string;
  votesCast:  number;
  totalPower: bigint;
}

/** Notification queue item for toast system. */
export interface Notification {
  id:        string;
  type:      'success' | 'error' | 'info' | 'warning';
  title:     string;
  body?:     string;
  duration?: number;
}

/** Generic async operation state wrapper. */
export interface AsyncState<T> {
  data:    T | null;
  loading: boolean;
  error:   string | null;
}

export interface ProposalAnalytics {
  proposalId:       number;
  uniqueVoters:     number;
  avgPower:         bigint;
  participationPct: number;
}

export interface DelegationRecord {
  delegator:  string;
  delegate:   string;
  power:      bigint;
  sinceBlock: number;
}

export interface ConnectConfig {
  appName:    string;
  appIconUrl: string;
  network:    StacksNetwork;
  onSuccess?: (address: string) => void;
  onCancel?:  () => void;
}

/** Generic async state wrapper. (batch 10) */
export interface AsyncState10<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/** Paginated list wrapper. (batch 10) */
export interface Paged10<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Breadcrumb nav item. (batch 10) */
export interface Crumb10 {
  label: string;
  href?: string;
  active?: boolean;
}

/** Generic async state wrapper. (batch 11) */
export interface AsyncState11<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/** Paginated list wrapper. (batch 11) */
export interface Paged11<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Breadcrumb nav item. (batch 11) */
export interface Crumb11 {
  label: string;
  href?: string;
  active?: boolean;
}
