# ClarityVote

On-chain governance for the Stacks ecosystem. STX-balance-weighted voting with delegation, timelocked execution, and a fully transparent proposal lifecycle — all enforced by Clarity smart contracts.

---

## Overview

ClarityVote gives STX holders direct governance power. Every vote is weighted by real STX balance, every passed proposal is delayed before execution, and every delegation is revocable at any time. No trusted multisig, no off-chain coordination — governance lives entirely on-chain.

**Contracts:**

| Contract | Purpose |
|---|---|
| `clarityvote` | Core proposal and voting logic |
| `clarityvote-delegation` | Delegate voting weight to another principal |
| `clarityvote-timelock` | Enforce execution delay on passed proposals |

**Deployer:** `SP1SY1E599GN04XRD2DQBKV7E62HYBJR2CT9S5QKK`  
**Network:** Stacks Mainnet  
**Clarity Version:** v3 (Epoch 3.1)

---

## How It Works

### Voting Weight

Each voter's weight is their STX balance at time of vote. No snapshot oracle, no token wrapping — Clarity reads balances natively.

With delegation active, effective weight = own balance + delegated weight from all delegators.

### Proposal Lifecycle

```
CREATED → ACTIVE (voting open) → PASSED / FAILED → QUEUED (timelock) → EXECUTED
                                                                      ↘ CANCELLED
```

1. Any STX holder creates a proposal with a description and voting window
2. Voters cast yes/no during the active window
3. Proposal passes if yes-weight exceeds no-weight and meets quorum
4. Passed proposals are queued in the timelock contract
5. After the delay elapses, the proposal can be executed

### Delegation

STX holders can delegate their full voting weight to another principal.

- One active delegation per address at a time
- Delegation is revocable or transferable at any time
- Circular delegation is rejected on-chain
- Delegatee accumulates weight from all delegators automatically

### Timelock

Passed proposals cannot execute immediately. A mandatory delay (default: 144 burn blocks, ~1 Bitcoin day) must elapse.

- Configurable delay: 1 to 1008 burn blocks
- Grace period: 288 burn blocks after ETA before proposal expires
- Admin can cancel a queued proposal before execution

---

## Contract Reference

### `clarityvote-delegation`

```clarity
;; Delegate your voting weight
(delegate (delegatee principal))

;; Revoke your delegation
(revoke-delegation)

;; Move delegation to a new address atomically
(transfer-delegation (new-delegatee principal))

;; Read effective weight (own balance + delegated)
(get-effective-weight (voter principal))

;; Check if an address has delegated
(has-delegated (delegator principal))
```

### `clarityvote-timelock`

```clarity
;; Queue a passed proposal (admin/governance contract only)
(queue-proposal (proposal-id uint) (description (string-utf8 256)))
;; Returns: (ok eta-block)

;; Execute after delay
(execute-proposal (proposal-id uint))

;; Cancel before execution
(cancel-proposal (proposal-id uint))

;; Update delay (1–1008 burn blocks)
(set-delay (new-delay uint))

;; Check readiness
(is-ready (proposal-id uint))     ;; delay met, not expired
(is-expired (proposal-id uint))   ;; grace period passed
(blocks-until-eta (proposal-id uint))
```

---

## Error Codes

### Delegation

| Code | Meaning |
|---|---|
| `u100` | Not authorized |
| `u101` | Cannot delegate to self |
| `u102` | Already have an active delegation |
| `u103` | No delegation found to revoke |
| `u104` | Would create circular delegation |
| `u105` | Delegator has zero STX balance |

### Timelock

| Code | Meaning |
|---|---|
| `u100` | Not authorized |
| `u101` | Proposal already queued |
| `u102` | Proposal not found |
| `u103` | Delay not yet met |
| `u104` | Already executed |
| `u105` | Proposal expired (grace period elapsed) |
| `u106` | Invalid delay value |
| `u107` | Proposal was cancelled |

---

## Development

**Requirements:** [Clarinet](https://github.com/hirosystems/clarinet) ≥ 2.0

```bash
# Clone and install
git clone https://github.com/greyw0rks/clarityvote
cd clarityvote
clarinet check

# Run tests
clarinet test

# Deploy to testnet
clarinet deployments apply --devnet
```

**Project structure:**
```
contracts/
  clarityvote.clar
  clarityvote-delegation.clar
  clarityvote-timelock.clar
tests/
  clarityvote_test.ts
  delegation_test.ts
  timelock_test.ts
Clarinet.toml
```

---

## Security

- All state transitions validated on-chain; no off-chain reliance
- `burn-block-height` used throughout for Bitcoin-anchored timing
- Delegation weight is based on live STX balance — no gaming via balance snapshots
- Timelock delay prevents governance attacks requiring instant execution
- Circular delegation rejected at the contract level

---

## License

MIT
