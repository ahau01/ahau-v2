# Leg 1 contract — frozen reference

Everything in this folder is frozen per
[ADR-0006](../../docs/adr/0006-capability-driven-redesign-not-behaviour-replication.md):
a record of what the old SSB-era app's data layer could do, kept so nothing
gets dropped while Āhau is rebuilt around user capabilities directly on
Holochain. It is a checklist against the capability inventory
([#13](https://github.com/ahau01/ahau-v2/issues/13)), not a spec new code
must implement — don't make Holochain code match it operation-for-operation.

- `contract/` — the typed contract: 69 operations derived from the old
  app's data-access review, plus cross-cutting semantics
  (`semantics.ts`) and their unit tests.
- `contract-source/` — the review of the old app's data functions the
  contract was derived from (`data-access-inventory.json`,
  `data-access-triage.json`, `data-access-leakage-triage.json`).
- `conformance/` — tests written against the contract, run against the
  in-memory fixture below. `cases/semantics.ts` holds the only two runnable
  kaupapa cases this repo has had (`retraction-hides-without-erasing`,
  `visibility-excludes-non-members`) — they proved little since they only
  ever ran against the fixture, but they're the starting point for the
  Holochain-backed versions ADR-0006 Decision 6 calls for.
- `fixtures/` — the in-memory backend the conformance suite ran against.
  No live code uses it.
- `scripts/` — `derive-manifest.mjs` (generates `contract/manifest.json`
  from `contract-source/`), `check-contract-coverage.mjs` and
  `check-conformance-coverage.mjs` (prove the contract/conformance suite
  match the triage in both directions).

## This folder is not part of the build

`npm test`, `npm run typecheck` and `npm run check:app` don't touch this
folder, and nothing under `src/` imports from it.

The two `check-*-coverage.mjs` scripts read compiled output (`.d.ts` and
`.js` files) that used to come from the repo-root `tsc` build, back when
`contract/`, `conformance/` and `fixtures/` lived under `src/`. They're kept
here as a record of how the contract's coverage was verified during Leg 1,
not as working tooling — running them again means compiling this folder
with its own `tsc` invocation first (e.g.
`npx tsc --outDir /tmp/leg1-dist reference/leg1-contract/contract/index.ts reference/leg1-contract/conformance/index.ts ...`
and pointing `DIST`/`DIST_OPS` in the scripts at that output). `derive-manifest.mjs`
only reads JSON, so it still runs as-is.
