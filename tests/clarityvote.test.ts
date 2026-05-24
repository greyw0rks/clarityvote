import { describe, it, expect } from "vitest";
import { initSimnet } from "@stacks/clarinet-sdk";
import { Cl } from "@stacks/transactions";

const simnet = await initSimnet();
const accounts = simnet.getAccounts();
const w1 = accounts.get("wallet_1")!;
const w2 = accounts.get("wallet_2")!;
const w3 = accounts.get("wallet_3")!;
const C = "clarityvote";
const DUR = 144;
const QUORUM = 1;

describe("clarityvote", () => {
  it("create-proposal returns ID 1", () => {
    const { result } = simnet.callPublicFn(C, "create-proposal",
      [Cl.stringAscii("Should we upgrade?"), Cl.stringUtf8("Details."),
       Cl.uint(DUR), Cl.uint(QUORUM)], w1);
    expect(result).toBeOk(Cl.uint(1));
  });

  it("cast-vote YES succeeds", () => {
    simnet.callPublicFn(C, "create-proposal",
      [Cl.stringAscii("Vote test"), Cl.stringUtf8("x"), Cl.uint(DUR), Cl.uint(QUORUM)], w1);
    const { result } = simnet.callPublicFn(C, "cast-vote",
      [Cl.uint(1), Cl.uint(1)], w2);
    expect(result).toBeOk(Cl.bool(true));
  });

  it("double vote returns 103", () => {
    simnet.callPublicFn(C, "create-proposal",
      [Cl.stringAscii("Double vote"), Cl.stringUtf8("x"), Cl.uint(DUR), Cl.uint(QUORUM)], w1);
    simnet.callPublicFn(C, "cast-vote", [Cl.uint(1), Cl.uint(1)], w2);
    const { result } = simnet.callPublicFn(C, "cast-vote", [Cl.uint(1), Cl.uint(2)], w2);
    expect(result).toBeErr(Cl.uint(103));
  });

  it("finalize while open returns 105", () => {
    simnet.callPublicFn(C, "create-proposal",
      [Cl.stringAscii("Open proposal"), Cl.stringUtf8("x"), Cl.uint(DUR), Cl.uint(QUORUM)], w1);
    const { result } = simnet.callPublicFn(C, "finalize-proposal", [Cl.uint(1)], w1);
    expect(result).toBeErr(Cl.uint(105));
  });

  it("finalize passes when yes > no and quorum met", () => {
    simnet.callPublicFn(C, "create-proposal",
      [Cl.stringAscii("Quick vote"), Cl.stringUtf8("x"), Cl.uint(2), Cl.uint(1)], w1);
    simnet.callPublicFn(C, "cast-vote", [Cl.uint(1), Cl.uint(1)], w2);
    simnet.callPublicFn(C, "cast-vote", [Cl.uint(1), Cl.uint(1)], w3);
    simnet.mineEmptyBlocks(10);
    const { result } = simnet.callPublicFn(C, "finalize-proposal", [Cl.uint(1)], w1);
    expect(result).toBeOk(Cl.uint(1));
  });

  it("finalize rejected when quorum not met", () => {
    simnet.callPublicFn(C, "create-proposal",
      [Cl.stringAscii("No quorum"), Cl.stringUtf8("x"), Cl.uint(2), Cl.uint(999_999_999_999)], w1);
    simnet.mineEmptyBlocks(10);
    const { result } = simnet.callPublicFn(C, "finalize-proposal", [Cl.uint(1)], w1);
    expect(result).toBeOk(Cl.uint(2));
  });
});

// Edge case: proposal with duration=1 should accept votes in the same block
// and reject finalize until block-height > start-block + 1.

// Edge case: zero-balance voter (stx-get-balance = 0) should still be
// allowed to vote — their power is 0 and contributes nothing to totals.

// Coverage target: all eight error codes should have at least one
// negative test asserting the exact uint error value.

// Integration path: once deployed to testnet, run the same test suite
// against the live contract using @stacks/transactions callReadOnly helpers.

// Performance note: each simnet.callPublicFn mines one block.
// For proposals with duration > 100 blocks, prefer mineEmptyBlocks(n).

// recommend test: proposal created and finalized in same block edge case

// recommend using wallet_9 and wallet_10 for broader voter coverage
