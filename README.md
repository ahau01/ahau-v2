# Āhau v2

Backend-agnostic data-access contract for Āhau — the definition of what any
backend must provide for the whakapapa application, independent of protocol.

Status: **Leg 1 complete.** A typed backend-agnostic contract (69 operations
across 14 domains), an in-memory reference implementation, an executable
conformance suite, and a Svelte shell that consumes the contract. No protocol
adapter exists yet - that is Leg 2.

## Why this exists

Āhau's existing frontend reaches its backend through 77 exported accessors that
return Apollo operation descriptors. That layer works, but it is shaped by
GraphQL-over-Scuttlebutt, so changing protocol costs a frontend rewrite rather
than a backend swap.

Milestone 1 catalogued and triaged all 77 in the `ahau` repository. This repo
expresses the 68 that survived as a typed contract, so a Holochain or nostr
adapter can be developed and validated against a known target.

Requirements source: `plans/data-access-triage.json` in the `ahau` repository.

## Setup

Node 20 (see `.nvmrc`). One toolchain, one Node version — deliberately, since
the fragmentation in the original repo is part of what this rebuild exists to
leave behind.

```bash
npm install
npm run typecheck
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run typecheck` | `tsc --noEmit` — the contract's primary gate |
| `npm run build` | Compile to `dist/` |
| `npm test` | Build, then run the suite and both coverage gates |
| `npm run dev` | Serve the shell at :5173 |
| `npm run check:app` | Typecheck the Svelte app |
| `npm run check:coverage` | Verify the contract covers the triage, in both directions |
| `npm run check:manifest` | Fail if the derived manifest is stale |
| `npm run refresh:source` | Re-pull the triage and inventory from `ahau` |

## Licence

Unlicensed pending a decision. The `ahau` repository is AGPL-3.0 under Āhau
Ltd.; ownership and licensing of this rebuild are still open questions in
`.claude/prds/ahau-v2-repo-foundation.prd.md`. Creating this repository does
not settle them.
