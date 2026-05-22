import {
  fetchCallReadOnlyFunction,
  makeContractCall,
  uintCV,
  stringAsciiCV,
  stringUtf8CV,
  cvToValue,
} from '@stacks/transactions';
import { STACKS_MAINNET, STACKS_TESTNET, type StacksNetwork } from '@stacks/network';

const IS_MAINNET = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';
export const NETWORK: StacksNetwork = IS_MAINNET ? STACKS_MAINNET : STACKS_TESTNET;export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
export const CONTRACT_NAME    = 'clarityvote';

// ── Types ─────────────────────────────────────────────────────────────────────
export type ProposalState = 'active' | 'passed' | 'rejected' | 'tied';

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
}

export interface VoteRecord {
  choice:      1 | 2 | 3;
  votingPower: bigint;
  block:       number;
}

export interface Results {
  yes:     bigint;
  no:      bigint;
  abstain: bigint;
  total:   bigint;
  quorum:  bigint;
  passed:  boolean;
}

const STATES: ProposalState[] = ['active', 'passed', 'rejected', 'tied'];
export const CHOICE_LABELS = { 1: 'Yes', 2: 'No', 3: 'Abstain' } as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
export function microToSTX(micro: bigint): string {
  return (Number(micro) / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function blocksToTime(blocks: number): string {
  const minutes = blocks * 10;
  if (minutes < 60) return `~${minutes}m`;
  if (minutes < 1440) return `~${Math.round(minutes / 60)}h`;
  return `~${Math.round(minutes / 1440)}d`;
}

export function pct(part: bigint, total: bigint): number {
  if (total === 0n) return 0;
  return Math.round((Number(part) / Number(total)) * 100);
}

export function truncate(p: string, n = 6): string {
  return `${p.slice(0, n)}…${p.slice(-4)}`;
}

// ── Read-only ─────────────────────────────────────────────────────────────────
async function ro(fn: string, args: any[]) {
  return fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName:    CONTRACT_NAME,
    functionName:    fn,
    functionArgs:    args,
    network:         NETWORK,
    senderAddress:   CONTRACT_ADDRESS,
  });
}

export async function fetchProposal(id: number): Promise<Proposal | null> {
  const res = await ro('get-proposal', [uintCV(id)]);
  const val = cvToValue(res);
  if (!val) return null;
  return {
    id,
    title:        val.title,
    description:  val.description,
    proposer:     val.proposer,
    startBlock:   Number(val['start-block']),
    endBlock:     Number(val['end-block']),
    yesVotes:     BigInt(val['yes-votes']),
    noVotes:      BigInt(val['no-votes']),
    abstainVotes: BigInt(val['abstain-votes']),
    totalPower:   BigInt(val['total-power']),
    quorum:       BigInt(val.quorum),
    state:        STATES[Number(val.state)],
    finalized:    val.finalized,
  };
}

export async function fetchManyProposals(count: number): Promise<Proposal[]> {
  const ids = Array.from({ length: count }, (_, i) => i + 1);
  const results = await Promise.all(ids.map(fetchProposal));
  return results.filter(Boolean) as Proposal[];
}

export async function fetchVote(proposalId: number, voter: string): Promise<VoteRecord | null> {
  const res = await ro('get-vote', [uintCV(proposalId), { type: 'principal', value: voter } as any]);
  const val = cvToValue(res);
  if (!val) return null;
  return {
    choice:      Number(val.choice) as 1 | 2 | 3,
    votingPower: BigInt(val['voting-power']),
    block:       Number(val.block),
  };
}

export async function fetchResults(proposalId: number): Promise<Results | null> {
  const res = await ro('get-results', [uintCV(proposalId)]);
  const val = cvToValue(res);
  if (!val) return null;
  return {
    yes:     BigInt(val.yes),
    no:      BigInt(val.no),
    abstain: BigInt(val.abstain),
    total:   BigInt(val.total),
    quorum:  BigInt(val.quorum),
    passed:  val.passed,
  };
}

export async function fetchNextId(): Promise<number> {
  const res = await ro('get-next-id', []);
  return Number(cvToValue(res));
}

// ── Tx builders ───────────────────────────────────────────────────────────────
export function buildCreateProposal(
  title: string,
  description: string,
  durationBlocks: number,
  quorumMicro: bigint,
) {
  return {
    contractAddress: CONTRACT_ADDRESS,
    contractName:    CONTRACT_NAME,
    functionName:    'create-proposal',
    functionArgs:    [
      stringAsciiCV(title),
      stringUtf8CV(description),
      uintCV(durationBlocks),
      uintCV(quorumMicro),
    ],
    network: NETWORK,
  };
}

export function buildCastVote(proposalId: number, choice: 1 | 2 | 3) {
  return {
    contractAddress: CONTRACT_ADDRESS,
    contractName:    CONTRACT_NAME,
    functionName:    'cast-vote',
    functionArgs:    [uintCV(proposalId), uintCV(choice)],
    network:         NETWORK,
  };
}

export function buildFinalizeProposal(proposalId: number) {
  return {
    contractAddress: CONTRACT_ADDRESS,
    contractName:    CONTRACT_NAME,
    functionName:    'finalize-proposal',
    functionArgs:    [uintCV(proposalId)],
    network:         NETWORK,
  };
}
/** Build a finalize-proposal transaction payload. */
export function buildFinalizeProposalDoc(proposalId: number) {
  // alias kept for documentation purposes — use buildFinalizeProposal in production
  return buildFinalizeProposal(proposalId);
}
