import {
  fetchCallReadOnlyFunction,
  uintCV,
  principalCV,
  stringAsciiCV,
  stringUtf8CV,
  type ClarityValue,
} from '@stacks/transactions';
import { STACKS_MAINNET, STACKS_TESTNET, type StacksNetwork } from '@stacks/network';
import type {
  Proposal, ProposalState, VoteChoice, VoteRecord, DelegationInfo, QueuedProposal, TimelockState,
} from './types';

const IS_MAINNET = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';

export const NETWORK: StacksNetwork = IS_MAINNET ? STACKS_MAINNET : STACKS_TESTNET;
export const NETWORK_NAME = IS_MAINNET ? 'mainnet' : 'testnet';
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '';

/** Contract names are env-overridable so a rename/redeploy never hard-codes. */
export const CORE_NAME = process.env.NEXT_PUBLIC_CORE_CONTRACT ?? 'clarityvote';
export const DELEGATION_NAME = process.env.NEXT_PUBLIC_DELEGATION_CONTRACT ?? 'clarityvote-delegation';
export const TIMELOCK_NAME = process.env.NEXT_PUBLIC_TIMELOCK_CONTRACT ?? 'clarityvote-timelock';

export const CONTRACT_ID = `${CONTRACT_ADDRESS}.${CORE_NAME}`;
export const DELEGATION_ID = `${CONTRACT_ADDRESS}.${DELEGATION_NAME}`;
export const TIMELOCK_ID = `${CONTRACT_ADDRESS}.${TIMELOCK_NAME}`;

const API_BASE = IS_MAINNET ? 'https://api.hiro.so' : 'https://api.testnet.hiro.so';

/** State enum order — index into this with the `state` uint from the contract. */
const STATES: ProposalState[] = ['active', 'passed', 'rejected', 'tied'];

export const CHOICE_LABELS = { 1: 'YES', 2: 'NO', 3: 'ABSTAIN' } as const;

/** Human messages for the shared u100+ error codes across the three contracts. */
export function decodeError(raw: string): string {
  const m = raw.match(/\bu(\d+)\b/);
  const code = m ? Number(m[1]) : NaN;
  const map: Record<number, string> = {
    100: 'Not authorized for this action.',
    101: 'Not found on chain.',
    102: 'Invalid state for this action.',
    103: 'You have already voted / already delegated / already queued.',
    104: 'Voting window is closed (or delegation is circular).',
    105: 'Voting window is still open (or no delegation exists).',
    106: 'Amount / duration must be greater than zero.',
    107: 'Invalid vote choice.',
    108: 'Title is too long.',
  };
  return Number.isNaN(code) ? raw : (map[code] ?? `Contract error u${code}.`);
}

// ── Clarity value decoding ────────────────────────────────────────────────────
// Raw ClarityValues rather than cvToValue(): get-proposal returns
// (optional (tuple ...)) and cvToValue only unwraps the optional, leaving each
// field as a {type, value} pair. Booleans are subtle — they encode in the type
// ('true' / 'false') and carry no value at all.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawCV = any;

const unwrapOptional = (cv: RawCV): RawCV | null =>
  cv?.type === 'some' ? cv.value : cv?.type === 'none' ? null : cv;

const fields = (cv: RawCV): Record<string, RawCV> => cv?.value ?? {};
const asBigInt = (cv: RawCV): bigint => BigInt(cv?.value ?? 0);
const asNumber = (cv: RawCV): number => Number(cv?.value ?? 0);
const asString = (cv: RawCV): string => String(cv?.value ?? '');
const asBool = (cv: RawCV): boolean => cv?.type === 'true';

// ── Read-only plumbing ──────────────────────────────────────────────────────

async function ro(contractName: string, fn: string, args: ClarityValue[]) {
  if (!CONTRACT_ADDRESS) throw new Error('NEXT_PUBLIC_CONTRACT_ADDRESS is not set');
  return fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName,
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

// ── Core: proposals & votes ──────────────────────────────────────────────────

/** Highest proposal id that exists. get-next-id is one past the last. */
export async function fetchProposalCount(): Promise<number> {
  return Math.max(0, asNumber(await ro(CORE_NAME, 'get-next-id', [])) - 1);
}

export async function fetchProposal(id: number, tip: number): Promise<Proposal | null> {
  const tuple = unwrapOptional(await ro(CORE_NAME, 'get-proposal', [uintCV(id)]));
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
 * One page of proposals, newest first. Paged deliberately: the contract can
 * hold thousands of proposals, and fetching all of them would fire thousands
 * of read-only calls per page load.
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
  const tuple = unwrapOptional(await ro(CORE_NAME, 'get-vote', [uintCV(proposalId), principalCV(voter)]));
  if (!tuple) return null;
  const f = fields(tuple);
  return {
    choice: asNumber(f.choice) as VoteChoice,
    votingPower: asBigInt(f['voting-power']),
    block: asNumber(f.block),
  };
}

// ── Delegation (clarityvote-delegation) ──────────────────────────────────────

export async function fetchDelegationInfo(account: string): Promise<DelegationInfo> {
  const [delegatee, delegatedWeight, delegatorCount, effectiveWeight, totalDelegations] =
    await Promise.all([
      ro(DELEGATION_NAME, 'get-delegation', [principalCV(account)]).catch(() => null),
      ro(DELEGATION_NAME, 'get-delegated-weight', [principalCV(account)]).catch(() => null),
      ro(DELEGATION_NAME, 'get-delegator-count', [principalCV(account)]).catch(() => null),
      ro(DELEGATION_NAME, 'get-effective-weight', [principalCV(account)]).catch(() => null),
      ro(DELEGATION_NAME, 'get-total-delegations', []).catch(() => null),
    ]);
  const target = unwrapOptional(delegatee);
  return {
    delegatee: target ? asString(target) : null,
    delegatedWeight: asBigInt(delegatedWeight),
    delegatorCount: asNumber(delegatorCount),
    effectiveWeight: asBigInt(effectiveWeight),
    totalDelegations: asNumber(totalDelegations),
  };
}

/** One-hop circular-delegation guard mirrored from the contract. */
export async function checkCircular(delegator: string, delegatee: string): Promise<boolean> {
  return asBool(await ro(DELEGATION_NAME, 'is-circular', [principalCV(delegator), principalCV(delegatee)]));
}

// ── Timelock (clarityvote-timelock) ──────────────────────────────────────────

function timelockState(q: {
  executed: boolean; cancelled: boolean; ready: boolean; expired: boolean;
}): TimelockState {
  if (q.cancelled) return 'cancelled';
  if (q.executed) return 'executed';
  if (q.expired) return 'expired';
  if (q.ready) return 'ready';
  return 'queued';
}

export async function fetchTimelockAdmin(): Promise<string> {
  return asString(await ro(TIMELOCK_NAME, 'get-admin', []));
}

export async function fetchTimelockDelay(): Promise<number> {
  return asNumber(await ro(TIMELOCK_NAME, 'get-delay', []));
}

export async function fetchTimelockCounts(): Promise<{ queued: number; executed: number }> {
  const [queued, executed] = await Promise.all([
    ro(TIMELOCK_NAME, 'get-queued-count', []).catch(() => null),
    ro(TIMELOCK_NAME, 'get-executed-count', []).catch(() => null),
  ]);
  return { queued: asNumber(queued), executed: asNumber(executed) };
}

export async function fetchQueued(proposalId: number): Promise<QueuedProposal | null> {
  const tuple = unwrapOptional(await ro(TIMELOCK_NAME, 'get-proposal', [uintCV(proposalId)]));
  if (!tuple) return null;
  const f = fields(tuple);
  const [ready, expired, blocksUntilEta] = await Promise.all([
    ro(TIMELOCK_NAME, 'is-ready', [uintCV(proposalId)]).catch(() => null),
    ro(TIMELOCK_NAME, 'is-expired', [uintCV(proposalId)]).catch(() => null),
    ro(TIMELOCK_NAME, 'blocks-until-eta', [uintCV(proposalId)]).catch(() => null),
  ]);
  const base = {
    executed: asBool(f.executed),
    cancelled: asBool(f.cancelled),
    ready: asBool(ready),
    expired: asBool(expired),
  };
  return {
    proposalId,
    proposer: asString(f.proposer),
    description: asString(f.description),
    eta: asNumber(f.eta),
    queuedAt: asNumber(f['queued-at']),
    blocksUntilEta: asNumber(blocksUntilEta),
    ...base,
    state: timelockState(base),
  };
}

/** Scan the id space for queued entries (timelock is keyed by proposal id). */
export async function fetchQueuedList(highestId: number, scanLimit = 60): Promise<QueuedProposal[]> {
  if (highestId < 1) return [];
  const ids: number[] = [];
  for (let id = highestId; id > highestId - scanLimit && id >= 1; id--) ids.push(id);
  const results = await Promise.all(ids.map((id) => fetchQueued(id).catch(() => null)));
  return results.filter(Boolean) as QueuedProposal[];
}

// ── Write payloads ────────────────────────────────────────────────────────────
// Shaped for @stacks/connect's request('stx_callContract', …). Each returns the
// target contract id alongside the call so the store can route to the right one.

export type ContractCall = { contractId: string; functionName: string; functionArgs: ClarityValue[] };

export function buildCreateProposal(
  title: string, description: string, durationBlocks: number, quorumMicro: bigint,
): ContractCall {
  return {
    contractId: CONTRACT_ID,
    functionName: 'create-proposal',
    functionArgs: [stringAsciiCV(title), stringUtf8CV(description), uintCV(durationBlocks), uintCV(quorumMicro)],
  };
}

export function buildCastVote(proposalId: number, choice: VoteChoice): ContractCall {
  return { contractId: CONTRACT_ID, functionName: 'cast-vote', functionArgs: [uintCV(proposalId), uintCV(choice)] };
}

export function buildFinalizeProposal(proposalId: number): ContractCall {
  return { contractId: CONTRACT_ID, functionName: 'finalize-proposal', functionArgs: [uintCV(proposalId)] };
}

export function buildCancelProposal(proposalId: number): ContractCall {
  return { contractId: CONTRACT_ID, functionName: 'cancel-proposal', functionArgs: [uintCV(proposalId)] };
}

export function buildDelegate(delegatee: string): ContractCall {
  return { contractId: DELEGATION_ID, functionName: 'delegate', functionArgs: [principalCV(delegatee)] };
}

export function buildRevokeDelegation(): ContractCall {
  return { contractId: DELEGATION_ID, functionName: 'revoke-delegation', functionArgs: [] };
}

export function buildTransferDelegation(newDelegatee: string): ContractCall {
  return { contractId: DELEGATION_ID, functionName: 'transfer-delegation', functionArgs: [principalCV(newDelegatee)] };
}

export function buildQueueProposal(proposalId: number, description: string): ContractCall {
  return {
    contractId: TIMELOCK_ID, functionName: 'queue-proposal',
    functionArgs: [uintCV(proposalId), stringUtf8CV(description)],
  };
}

export function buildExecuteProposal(proposalId: number): ContractCall {
  return { contractId: TIMELOCK_ID, functionName: 'execute-proposal', functionArgs: [uintCV(proposalId)] };
}

export function buildCancelQueued(proposalId: number): ContractCall {
  return { contractId: TIMELOCK_ID, functionName: 'cancel-proposal', functionArgs: [uintCV(proposalId)] };
}

// ── Explorer links ────────────────────────────────────────────────────────────
// The chain goes in the query string, so it has to come after the path segment.

const explorer = (kind: 'txid' | 'address', value: string) =>
  IS_MAINNET
    ? `https://explorer.hiro.so/${kind}/${value}`
    : `https://explorer.hiro.so/${kind}/${value}?chain=testnet`;

export const explorerUrl = (txId: string) => explorer('txid', txId.startsWith('0x') ? txId : `0x${txId}`);
export const explorerAddressUrl = (address: string) => explorer('address', address);
export const explorerContractUrl = () => explorer('address', CONTRACT_ID);
