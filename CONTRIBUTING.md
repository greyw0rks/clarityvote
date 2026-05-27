
## Type checking

```bash
cd frontend && npx tsc --noEmit
```

## ESLint

```bash
cd frontend && npx eslint . --ext .ts,.tsx
```

<!-- batch 10 pass -->

<!-- batch 11 pass -->

<!-- batch 12 pass -->

<!-- batch 13 pass -->

<!-- batch 14 pass -->

<!-- batch 15 pass -->

<!-- batch 16 pass -->

<!-- batch 17 pass -->

## Type checking

```bash
cd frontend && npx tsc --noEmit
```

<!-- batch 10 pass -->

<!-- batch 11 pass -->

<!-- batch 12 pass -->

<!-- batch 13 pass -->

<!-- batch 14 pass -->

<!-- batch 15 pass -->

<!-- batch 16 pass -->

<!-- batch 17 pass -->

## Sharing a proposal

Each proposal page at `/proposals/:id` is shareable. Use the share strip
to post directly to Twitter/X or Warpcast.

## Supported wallets

| Wallet  | Status      |
|---------|-------------|
| Leather | ✅ Supported |
| Xverse  | ✅ Supported |
| Asigna  | 🔜 Planned  |

## Clarity type reference

| Field       | Clarity type     | Notes                    |
|-------------|------------------|--------------------------|
| title       | string-ascii 80  | max 80 ASCII chars       |
| description | string-utf8      | supports emoji/Unicode   |
| duration    | uint             | blocks from current height |
| quorum      | uint             | minimum microSTX turnout |
