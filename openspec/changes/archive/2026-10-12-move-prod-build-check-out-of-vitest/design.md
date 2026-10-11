# Design

## Context

See proposal.md — Why. The relevant current state:

- `vite.config.ts` sets `build.outDir: 'dist-app'`, and its `devConductor()`
  plugin is `apply: 'serve'`, so it is absent from builds already.
- `src/app/main.ts` guards only the pretend client behind
  `import.meta.env.DEV`. Vite substitutes that from `NODE_ENV`, not from
  `--mode`.
- `tsconfig.json` sets `rootDir: src` and `include: ["src/**/*.ts"]`, so
  `scripts/` is outside typechecking. `scripts/issue-app-token.mjs` is the
  existing precedent.
- `vitest.config.ts` includes `src/app/**/*.test.ts` with a `jsdom`
  environment.

Verified against the current tree with an in-memory production build:
`vite build` produces **one** chunk, whose `modules` is an object of **344**
keys, each an **absolute** module path. `src/profile/pretend-client.ts` is
absent; `src/profile/dev-connection.ts` is present. Rebuilding with
`NODE_ENV=development` makes `pretend-client.ts` appear. So the signal the
design depends on exists, and it moves when it should.

None of the project's design rules on merge-sensitive mutations, offline
conflict, or permission revocation bear on this change — it adds a build
check and touches no entry, link or capability grant.

## Goals / Non-Goals

**Goals:**

- Assert the property that matters — `src/profile/pretend-client.ts` was
  tree-shaken out of the production bundle — rather than a proxy for it.
- Fail loudly rather than vacuously. A check that silently stops checking is
  worse than no check, because it manufactures confidence.
- Be cheap to extend to a second forbidden module when #41 is decided.

**Non-Goals:**

- Asserting anything about `dev-connection.ts`. That is #41's decision; see
  proposal.md — Flagged, not done.
- Byte-level assertions about the shipped bundle (minifier output, chunk
  names, hashes). The invariant is about reachability, not bytes.
- Running the check during `npm test`.

## Decisions

### 1. Assert on Rollup's module graph, not on bundle text

`build({ write: false })` returns a `RollupOutput` whose chunks each carry a
`modules` map keyed by absolute module id. The check walks those keys.

Why not the two alternatives:

| Approach | Defeated by |
| --- | --- |
| Grep for string literals (status quo) | rewording either string |
| Grep for the exported identifier `createPretendProfileClient` | minification — esbuild mangles it to a single letter |
| **Module graph** | nothing short of Rollup changing its output shape, which decision 4 catches |

The identifier variant is what #53 sketched ("one marker the pretend client
exports"). It cannot work as written: an exported *identifier* does not
survive a minified build, which is precisely why the status quo greps
strings. Making the marker a string literal to survive minification puts it
straight back in the first row of the table. The module graph sidesteps the
dilemma — it is a structural fact recorded before minification runs, and
tree-shaking is what the check is actually about.

No marker export is added to `pretend-client.ts`. Its module id *is* the
marker, and it cannot be reworded without the import in `main.ts` failing.

### 2. Match module ids by path suffix, not substring

Ids are absolute (`/home/taiaok/projects/ahau-v2/src/profile/pretend-client.ts`).
A substring test for `pretend-client` would also match any dependency path
containing that text. The check resolves the forbidden path relative to the
repo root and compares full ids, normalising path separators first.

### 3. `write: false`, so the check cannot disturb `dist-app`

The build runs entirely in memory. `npm run build:app` writes `dist-app`;
this check must not clobber or half-write it, especially once it runs in CI
next to a real build step. Confirmed: running it leaves the working tree
clean.

### 4. A positive control inside the check

This is the decision that keeps the check honest. "No chunk contains module
X" is trivially true of an empty module graph. If a future Vite or Rollup
stops populating `chunk.modules`, or populates it under another key, a naive
implementation reads zero modules, finds no violation, and reports success
forever.

So before testing for the forbidden module, the check asserts the graph is
usable: at least one chunk, a non-empty `modules` map, and
`src/app/main.ts` present in it. If those fail, the check fails with a
message saying the *check itself* is broken, not that the bundle is clean.

The deleted test had this instinct — `expect(code.includes('ahau'))`,
commented "the build produced the app". Decision 4 is that instinct carried
over to the module graph, where it is load-bearing rather than incidental.

### 5. A list of forbidden modules, not a single hard-coded path

One array, one entry today. #41 adds a line rather than restructuring the
script.

### 6. `NODE_ENV=production` set by the script, not mutated around a call

The script is its own process, so it sets `process.env.NODE_ENV` once at the
top before importing Vite. No save-and-restore, and no effect on any other
test. This is the whole reason the check does not belong in vitest: there,
`NODE_ENV` is `test` and shared with every other test file in the run.

### 7. Failure output

Non-zero exit, and a message naming the forbidden module, the chunk it
appeared in, and the likely cause (a lost `import.meta.env.DEV` guard in
`src/app/main.ts`). Never print the bundle.

## Risks / Trade-offs

- **`chunk.modules` is Rollup output detail, not a stability contract** →
  Decision 4. A shape change turns the check red with a message about the
  check, which is the correct failure direction.
- **The check no longer runs on `npm test`, so a regression reaches a PR
  before anyone sees it** → it runs as its own step in the fast CI job, and
  the `main` ruleset requires a pull request, so nothing lands on `main`
  without it. Accepted deliberately; see proposal.md — What Changes.
- **The check proves the module was dropped, not that `?pretend` is inert**
  → those are the same thing only because `main.ts` is the sole importer. If
  a second importer appears outside the `DEV` guard, the module stays and
  the check goes red, which is again the right direction.
- **Removing the build test may not measurably reduce end-to-end local test
  time** → in a controlled comparison, `npm test` took 21.42s with the test
  restored and 21.27s without it; the remaining Vitest work dominates the
  overall run. CI gains no net time because the dedicated check replaces
  `npm run build:app` rather than joining it.
- **Vite config loading is implicit** → the script calls `build()` with no
  explicit `configFile`, so it picks up `vite.config.ts` the same way
  `npm run build:app` does. Keeping that implicit is intentional: the check
  must build what the app ships, not a build configured separately.

## Migration Plan

One commit, no runtime surface, no deployment. Rollback is reverting it. The
only coupling outward is the `add-ci-pipeline` change expecting
`check:app-build` to exist; that change lands after this one.
