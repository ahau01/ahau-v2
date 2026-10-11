# Proposal

Closes [#53](https://github.com/ahau01/ahau-v2/issues/53).

## Why

PR #51 added `src/app/production-build.test.ts`, which builds the app for
production and checks the pretend profile client isn't in the bundle. The
check is worth having. Its current home is wrong on four counts, and one of
them makes the check weaker than it looks.

`vitest.config.ts` is for "Svelte component tests, in a DOM"; its `include`
is `src/app/**/*.test.ts`, which this file matches only because it sits in
`src/app/`, and it then opts out of the DOM with `// @vitest-environment
node`. It puts a real `vite build` (about 4s, 60s timeout) on every `npm
test` and `npm run test:app`. It mutates the global `process.env.NODE_ENV`
while it runs, because Vite reads `import.meta.env.DEV` from `NODE_ENV` and
vitest sets that to `test`.

The fourth is the substantive one. The test greps the bundle for the string
literals `'ahau:pretend-profile'` and `'Pretend Holochain'`. Those are a
*proxy* for the property that matters — did tree-shaking drop
`src/profile/pretend-client.ts`? — and nothing ties the proxy to the
property. Reword either string and the check passes while proving nothing.
It stays green, so no one finds out.

Now is the right time because [#35](https://github.com/ahau01/ahau-v2/issues/35)
is about to turn this into a step that runs on every PR. Fixing it first
means the CI workflow's step list is written once rather than amended.

## What Changes

- **New** `scripts/check-app-build.mjs`: builds the app for production and
  fails if `src/profile/pretend-client.ts` is in the bundle. It asserts on
  Rollup's module graph (`chunk.modules`) rather than on bundle text, so the
  check holds when identifiers are mangled by minification and when strings
  are reworded. Joins the existing `scripts/issue-app-token.mjs`; `.mjs`
  because `tsconfig.json` sets `rootDir: src`, so `scripts/` is outside
  typechecking by design and needs no build step to run.
- **New** `check:app-build` npm script running that file.
- **Removed** `src/app/production-build.test.ts`. `vitest run` goes back to
  Svelte component tests in a DOM only, and stops carrying a production
  build.
- `npm test` does **not** gain the check. It runs as its own step in the
  fast CI job instead, where it *replaces* `npm run build:app` rather than
  joining it — `build:app` exists in that job to catch Vite breakage, and a
  build that must succeed before its assertion runs catches the same
  breakage at the same cost. Net effect: `npm test` gets about 4s faster, CI
  gains no time, and all four problems above are resolved rather than three.

The trade accepted here: the check no longer runs on a developer's machine
during `npm test`, so a regression surfaces in CI rather than locally. The
`main` ruleset requires a pull request, so nothing reaches `main` without
that job having run.

## Capabilities

### New Capabilities

None. This changes how an existing invariant is checked, not what the system
does.

### Modified Capabilities

None. No requirement in `launch`, `navigation` or `own-profile` changes:
`?pretend` is already specified as dev-only, and this change alters only the
mechanism that verifies it. `.openspec.yaml` sets `skip_specs: true`
accordingly.

## Impact

| Path | Change |
| --- | --- |
| `scripts/check-app-build.mjs` | new |
| `package.json` | new `check:app-build` script |
| `src/app/production-build.test.ts` | deleted |
| `src/profile/pretend-client.ts` | none — the module id is the assertion target, so no marker export is added |
| `src/app/main.ts` | none — the `import.meta.env.DEV` guard is what the check verifies |

No zome, client-module or Svelte component code changes. Nothing here
touches relationship or identity data, sync, or access control.

## Flagged, not done

- **The CI workflow.** There is no `.github/` directory in this repo yet.
  Wiring `check:app-build` into a job belongs to the `add-ci-pipeline`
  change (#35, #36, #37), which also carries #53's third acceptance
  criterion, "the check runs on every PR". This change makes the script
  exist and be correct; it does not make it run on a PR.
- **`createDevProfileClient` ships in production.** In
  `src/app/main.ts`, `profileClient()` guards the pretend client behind
  `import.meta.env.DEV` but falls through to `createDevProfileClient()`
  unguarded, so `src/profile/dev-connection.ts` *is* in the production
  bundle. That may well also be wrong, but it is
  [#41](https://github.com/ahau01/ahau-v2/issues/41)'s open question — what
  a production build does to reach Holochain — and answering it here would
  be deciding #41 by implication. The check is deliberately scoped to the
  pretend client, and the script should be written so a second asserted
  module is a one-line addition once #41 lands.
- **Other `src/app/**/*.test.ts` files.** `App.test.ts` and `Avatar.test.ts`
  are genuine Svelte DOM tests and stay where they are.
