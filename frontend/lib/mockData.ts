import type { Proposal, DurationOption, QuorumOption } from './types';

export const MOCK_WALLET = 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5';
export const VOTER_POWER = 100_000_000_000n; // 100K STX

export const SEED: Proposal[] = [
  {
    id: 1,
    title: 'Upgrade fee model to percentage-based',
    description:
      'Move from flat transaction fees (0.001 STX per vote) to a dynamic 0.1% of voting power model. This aligns incentives between large and small STX holders, reduces barriers for micro-STX participants, and creates a fee structure that scales proportionally with governance activity. All collected fees route to the protocol treasury.',
    proposer:     'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
    startBlock:   145000, endBlock: 145432,
    yesVotes:     2_450_000_000_000n,
    noVotes:        820_000_000_000n,
    abstainVotes:   180_000_000_000n,
    totalPower:   3_450_000_000_000n,
    quorum:       3_000_000_000_000n,
    state: 'active', finalized: false, blocksLeft: 287,
  },
  {
    id: 2,
    title: 'Enable sBTC staking rewards for governance participants',
    description:
      'Distribute 1% of protocol fees as sBTC to wallets that voted in at least 3 of the last 10 proposals. Rewards are calculated monthly and distributed via a Clarity contract. Creates a direct incentive loop between participation frequency and protocol revenue sharing.',
    proposer:     'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC',
    startBlock:   144500, endBlock: 144932,
    yesVotes:     5_100_000_000_000n,
    noVotes:      1_200_000_000_000n,
    abstainVotes:   300_000_000_000n,
    totalPower:   6_600_000_000_000n,
    quorum:       5_000_000_000_000n,
    state: 'passed', finalized: true, blocksLeft: 0,
  },
  {
    id: 3,
    title: 'BNS-gated proposal creation',
    description:
      'Restrict new proposal creation to wallets holding a .btc BNS name. Provides lightweight Sybil resistance without token deposits. BNS names cost ~2 STX and tie proposals to persistent on-chain identity. Multisig emergency proposals remain ungated.',
    proposer:     'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND',
    startBlock:   144800, endBlock: 144950,
    yesVotes:       890_000_000_000n,
    noVotes:      2_100_000_000_000n,
    abstainVotes:   450_000_000_000n,
    totalPower:   3_440_000_000_000n,
    quorum:       3_000_000_000_000n,
    state: 'rejected', finalized: true, blocksLeft: 0,
  },
  {
    id: 4,
    title: 'Ranked-choice voting for multi-candidate proposals',
    description:
      'Extend the system to support up to 5 choices with instant-runoff ranked-choice counting. The Clarity contract stores ranked ballots on-chain and runs IRV at finalization. Opt-in per proposal; standard YES/NO/ABSTAIN voting remains the default for all other proposals.',
    proposer:     'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0',
    startBlock:   145100, endBlock: 145244,
    yesVotes:     1_200_000_000_000n,
    noVotes:      1_200_000_000_000n,
    abstainVotes:   600_000_000_000n,
    totalPower:   3_000_000_000_000n,
    quorum:       3_000_000_000_000n,
    state: 'tied', finalized: true, blocksLeft: 0,
  },
  {
    id: 5,
    title: 'Minimum proposal duration raised to 3 days',
    description:
      'Raise the voting window floor from 144 blocks (1 day) to 432 blocks (3 days). Snap polls show most voters cast ballots in the final 6 hours; a longer window should improve turnout and reduce last-minute whale influence across global time zones.',
    proposer:     'ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ',
    startBlock:   145200, endBlock: 146208,
    yesVotes:       430_000_000_000n,
    noVotes:        120_000_000_000n,
    abstainVotes:    50_000_000_000n,
    totalPower:     600_000_000_000n,
    quorum:       2_000_000_000_000n,
    state: 'active', finalized: false, blocksLeft: 891,
  },
];

export const DURATION_OPTS: DurationOption[] = [
  { label: '1 day',   blocks: 144  },
  { label: '3 days',  blocks: 432  },
  { label: '1 week',  blocks: 1008 },
  { label: '2 weeks', blocks: 2016 },
];

export const QUORUM_OPTS: QuorumOption[] = [
  { label: 'Light · 1K STX',    micro: 1_000_000_000n      },
  { label: 'Standard · 1M STX', micro: 1_000_000_000_000n  },
  { label: 'Heavy · 5M STX',    micro: 5_000_000_000_000n  },
];

export const BLOCK_TIME_SECONDS = 600; // ~10 minutes per Stacks block
export const BLOCKS_PER_DAY     = 144;
export const BLOCKS_PER_WEEK    = 1008;

/** Minimum quorum for a lightweight community poll (1K STX). */
export const QUORUM_LIGHT    = 1_000_000_000n;
/** Standard quorum for protocol decisions (1M STX). */
export const QUORUM_STANDARD = 1_000_000_000_000n;
/** Heavy quorum for high-impact changes (5M STX). */
export const QUORUM_HEAVY    = 5_000_000_000_000n;

/** Hiro explorer base URLs per network. */
export const EXPLORER_BASE = {
  mainnet: 'https://explorer.hiro.so/txid',
  testnet: 'https://explorer.hiro.so/txid?chain=testnet',
} as const;

/** Stacks RPC endpoints used by @stacks/network. */
export const RPC = {
  mainnet: 'https://api.hiro.so',
  testnet: 'https://api.testnet.hiro.so',
} as const;

export const APP_NAME = 'ClarityVote';
export const APP_ICON = '/favicon.ico';

export const SHARE_BASE = 'https://clarityvote.vercel.app/proposals';
export const TESTNET_FAUCET = 'https://explorer.hiro.so/sandbox/faucet?chain=testnet';

/** Blocks per month estimate for batch 10. */
export const BLOCKS_PER_MONTH_10 = 4320;

/** Blocks per month estimate for batch 11. */
export const BLOCKS_PER_MONTH_11 = 4320;

/** Blocks per month estimate for batch 12. */
export const BLOCKS_PER_MONTH_12 = 4320;
