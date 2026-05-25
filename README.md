# ClarityVote 🗳️

**On-chain governance for Stacks communities**

---

ClarityVote lets any Stacks community create proposals and vote on them fully on-chain. Voting power is weighted by live STX balance — no token to deploy, no snapshot service, no admin key. One contract, one source of truth.

---

## How it works

```
create-proposal(title, description, duration, quorum)
        │
  [voting window open]
        │
   cast-vote(YES=1 / NO=2 / ABSTAIN=3)
   power = tx-sender's STX balance at vote time
        │
  [window closes at end-block]
        │
   finalize-proposal()   ← anyone can call
        │
        ├─ PASSED    yes > no  AND  total ≥ quorum
        ├─ REJECTED  no ≥ yes  OR   quorum not met
        └─ TIED      yes == no AND  quorum met
```

---

## Contract functions

| Function | Caller | Description |
|---|---|---|
| `create-proposal` | Anyone | Opens a new voting window |
| `cast-vote` | Any STX holder | Votes YES / NO / ABSTAIN (once per wallet) |
| `finalize-proposal` | Anyone | Records result after window closes |
| `cancel-proposal` | Proposer | Cancels before any votes are cast |
| `get-proposal` | Read-only | Fetch full proposal data |
| `get-vote` | Read-only | Fetch a specific voter's record |
| `get-results` | Read-only | Live tally with quorum status |
| `has-voted` | Read-only | Check if a principal has voted |

---

## Error codes

| Code | Meaning |
|---|---|
| `u100` | Not authorized |
| `u101` | Proposal not found |
| `u102` | Invalid state |
| `u103` | Already voted |
| `u104` | Window closed |
| `u105` | Window still open |
| `u106` | Zero amount or empty title |
| `u107` | Invalid vote choice |
| `u108` | Title too long (max 80 chars) |

---

## Block timing

Stacks produces ~144 blocks per day (~10 min/block).

| Duration | Blocks |
|---|---|
| 1 day | 144 |
| 3 days | 432 |
| 1 week | 1,008 |
| 2 weeks | 2,016 |

---

## Setup

### Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) — contract testing
- Node.js 18+ — frontend

### Contract tests

```bash
clarinet test
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
# fill in NEXT_PUBLIC_CONTRACT_ADDRESS and NEXT_PUBLIC_NETWORK
npm install
npm run dev
```

### Environment variables

```env
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=ST...
```

### Deploy to mainnet

```bash
# Encrypt your mnemonic first — never commit plaintext seed phrases
clarinet deployments encrypt

# Then deploy
clarinet deployments apply --mainnet
```

---

## Frontend stack

- **Next.js 16** — app router
- **@stacks/connect** — wallet auth
- **@stacks/transactions** — contract calls
- **TypeScript** — end to end

Pages:

| Route | Description |
|---|---|
| `/` | Hero, stats, active proposals |
| `/proposals` | Full list with filter + search |
| `/proposals/[id]` | Detail, vote buttons, results |
| `/proposals/new` | Create proposal form |

---

## Project structure

```
Clarityvote/
├── contracts/
│   └── clarityvote.clar       # Clarity smart contract
├── tests/
│   └── clarityvote.test.ts    # Vitest + clarinet-sdk tests
├── frontend/
│   ├── app/                   # Next.js app router pages
│   ├── components/            # Badge, VoteBar, ProposalCard…
│   ├── lib/
│   │   ├── contract.ts        # Read-only + tx builders
│   │   ├── store.tsx          # React context (global state)
│   │   ├── types.ts           # Shared TypeScript interfaces
│   │   ├── tokens.ts          # Design tokens
│   │   ├── utils.ts           # toSTX, pct, t2blocks…
│   │   └── mockData.ts        # Seed proposals for dev
│   └── .env.example
├── Mainnet.toml
├── vitest.config.ts
└── README.md
```

---

## Roadmap

- [ ] Real wallet integration (`@stacks/connect` → `store.tsx`)
- [ ] Delegation — assign voting power to another address
- [ ] BNS-gated proposals — only `.btc` names can create
- [ ] Proposal categories and tags
- [ ] Webhook / email notifications on finalization
- [ ] Multi-choice voting beyond YES / NO / ABSTAIN

---

## License

MIT © [greyw0rks](https://github.com/greyw0rks)

<!-- last updated by commit script -->

<!-- batch 8 -->

<!-- batch 9 -->

<!-- batch 10 -->

<!-- batch 11 -->

<!-- batch 12 -->

<!-- batch 13 -->

<!-- batch 14 -->

<!-- batch 15 -->

<!-- batch 16 -->

<!-- batch 17 -->

<!-- batch 8 -->

<!-- batch 10 -->

<!-- batch 11 -->

<!-- batch 12 -->

<!-- batch 13 -->
