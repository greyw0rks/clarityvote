import {
  fetchCallReadOnlyFunction,
  uintCV,
  principalCV,
  stringAsciiCV,
  stringUtf8CV,
  type ClarityValue,
} from '@stacks/transactions';
import { STACKS_MAINNET, STACKS_TESTNET, type StacksNetwork } from '@stacks/network';
import type { Proposal, ProposalState, VoteChoice, VoteRecord } from './types';

const IS_MAINNET = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';

export const NETWORK: StacksNetwork = IS_MAINNET ? STACKS_MAINNET : STACKS_TESTNET;
export const NETWORK_NAME = IS_MAINNET ? 'mainnet' : 'testnet';
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '';
export const CONTRACT_NAME = 'clarityvote';
export const CONTRACT_ID = `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;

const API_BASE = IS_MAINNET ? 'https://api.hiro.so' : 'https://api.testnet.hiro.so';

/** Contract state enum order — index into this with the `state` uint. */
const STATES: ProposalState[] = ['active', 'passed', 'rejected', 'tied'];

export const CHOICE_LABELS = { 1: 'Yes', 2: 'No', 3: 'Abstain' } as const;

// ── Clarity value decoding ────────────────────────────────────────────────────
// Raw ClarityValues are used rather than cvToValue(): on this contract
// get-proposal returns (optional (tuple ...)), and cvToValue only unwraps the
// optional — the tuple fields stay as {type, value} pairs, so reading
// `val.title` yields undefined. Booleans are the subtle one: they encode in the
// type (`true` / `false`) and carry no value at all.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawCV = any;

const unwrapOptional = (cv: RawCV): RawCV | null =>
  cv?.type === 'some' ? cv.value : cv?.type === 'none' ? null : cv;

const fields = (cv: RawCV): Record<string, RawCV> => cv?.value ?? {};
const asBigInt = (cv: RawCV): bigint => BigInt(cv?.value ?? 0);
const asNumber = (cv: RawCV): number => Number(cv?.value ?? 0);
const asString = (cv: RawCV): string => String(cv?.value ?? '');
const asBool = (cv: RawCV): boolean => cv?.type === 'true';

// ── Read-only ─────────────────────────────────────────────────────────────────

async function ro(fn: string, args: ClarityValue[]) {
  if (!CONTRACT_ADDRESS) throw new Error('NEXT_PUBLIC_CONTRACT_ADDRESS is not set');
  return fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: fn,
    functionArgs: args,
    network: NETWORK,
    senderAddress: CONTRACT_ADDRESS,
  });
}

/** Current Stacks tip, used to turn end-block into "time remaining". */
export async function fetchBlockHeight(): Promise<number> {
  const res = await fetch(`${API_BASE}/v2/info`);
  if (!res.ok) throw new Error(`Hiro /v2/info returned ${res.status}`);
  const info = await res.json();
  return Number(info.stacks_tip_height ?? 0);
}

/** Highest proposal id that exists. get-next-id is one past the last. */
export async function fetchProposalCount(): Promise<number> {
  return Math.max(0, asNumber(await ro('get-next-id', [])) - 1);
}

export async function fetchProposal(id: number, tip: number): Promise<Proposal | null> {
  const tuple = unwrapOptional(await ro('get-proposal', [uintCV(id)]));
  if (!tuple) return null;
  const f = fields(tuple);
  const endBlock = asNumber(f['end-block']);
  return {
    id,
    title: asString(f.title),
    description: asString(f.description),
    proposer: asString(f.proposer),
    startBlock: asNumber(f['start-block']),
    endBlock,
    yesVotes: asBigInt(f['yes-votes']),
    noVotes: asBigInt(f['no-votes']),
    abstainVotes: asBigInt(f['abstain-votes']),
    totalPower: asBigInt(f['total-power']),
    quorum: asBigInt(f.quorum),
    state: STATES[asNumber(f.state)] ?? 'active',
    finalized: asBool(f.finalized),
    blocksLeft: Math.max(0, endBlock - tip),
  };
}

export const PAGE_SIZE = 24;

/**
 * One page of proposals, newest first. Paged deliberately: this contract has
 * thousands of proposals on mainnet, and fetching them all would mean thousands
 * of parallel read-only calls per page load.
 */
export async function fetchProposalPage(
  highestId: number,
  offset = 0,
  limit = PAGE_SIZE,
): Promise<Proposal[]> {
  if (highestId < 1) return [];
  const tip = await fetchBlockHeight().catch(() => 0);
  const start = highestId - offset;
  const ids: number[] = [];
  for (let id = start; id > start - limit && id >= 1; id--) ids.push(id);
  const results = await Promise.all(ids.map((id) => fetchProposal(id, tip).catch(() => null)));
  return results.filter(Boolean) as Proposal[];
}

export async function fetchVote(proposalId: number, voter: string): Promise<VoteRecord | null> {
  const tuple = unwrapOptional(await ro('get-vote', [uintCV(proposalId), principalCV(voter)]));
  if (!tuple) return null;
  const f = fields(tuple);
  return {
    choice: asNumber(f.choice) as VoteChoice,
    votingPower: asBigInt(f['voting-power']),
    block: asNumber(f.block),
  };
}

// ── Write payloads ────────────────────────────────────────────────────────────

export function buildCreateProposal(
  title: string,
  description: string,
  durationBlocks: number,
  quorumMicro: bigint,
) {
  return {
    functionName: 'create-proposal',
    functionArgs: [
      stringAsciiCV(title),
      stringUtf8CV(description),
      uintCV(durationBlocks),
      uintCV(quorumMicro),
    ],
  };
}

export function buildCastVote(proposalId: number, choice: VoteChoice) {
  return { functionName: 'cast-vote', functionArgs: [uintCV(proposalId), uintCV(choice)] };
}

export function buildFinalizeProposal(proposalId: number) {
  return { functionName: 'finalize-proposal', functionArgs: [uintCV(proposalId)] };
}

// ── Explorer links ────────────────────────────────────────────────────────────
// The chain goes in the query string, so it has to come after the path segment.

export function explorerUrl(txId: string): string {
  const id = txId.startsWith('0x') ? txId : `0x${txId}`;
  return IS_MAINNET
    ? `https://explorer.hiro.so/txid/${id}`
    : `https://explorer.hiro.so/txid/${id}?chain=testnet`;
}

export function explorerAddressUrl(address: string): string {
  return IS_MAINNET
    ? `https://explorer.hiro.so/address/${address}`
    : `https://explorer.hiro.so/address/${address}?chain=testnet`;
}

export function explorerContractUrl(): string {
  return explorerAddressUrl(CONTRACT_ID);
}
