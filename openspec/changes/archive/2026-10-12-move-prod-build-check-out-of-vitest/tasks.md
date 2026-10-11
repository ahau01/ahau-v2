# Tasks

See design.md for why each decision below is what it is. No open questions
to resolve first.

## 1. The check script

- [x] 1.1 Create `scripts/check-app-build.mjs`: set
  `process.env.NODE_ENV = 'production'` before importing Vite, call
  `build({ logLevel: 'silent', build: { write: false } })` with no
  `configFile`, and collect every key of `chunk.modules` across all chunks
  of type `chunk`. Verify `node scripts/check-app-build.mjs` exits 0 against
  the current tree.
- [x] 1.2 Add the positive control from design.md decision 4: fail if there
  is no chunk, if `modules` is empty, or if `src/app/main.ts` is not among
  the ids, with a message saying the check itself is broken rather than that
  the bundle is clean. Verify by temporarily pointing the expected-present
  path at a module that does not exist and confirming a non-zero exit with
  that message, then restoring it.
- [x] 1.3 Express the forbidden modules as an array with the single entry
  `src/profile/pretend-client.ts`, resolved against the repo root and
  compared as a whole normalised path rather than a substring (design.md
  decision 2). Verify a substring-only path such as
  `profile/pretend-client` is not treated as a match.
- [x] 1.4 On a violation, exit non-zero naming the forbidden module, the
  chunk it appeared in, and a lost `import.meta.env.DEV` guard in
  `src/app/main.ts` as the likely cause. Never print the bundle. For the
  negative control, temporarily bypass the script's production `NODE_ENV`
  assignment, run `NODE_ENV=development node scripts/check-app-build.mjs`,
  confirm it fails and names `src/profile/pretend-client.ts`, then restore
  the production assignment.

## 2. Wire it up and retire the vitest test

- [x] 2.1 Add `"check:app-build": "node scripts/check-app-build.mjs"` to
  `package.json` scripts. Verify `npm run check:app-build` exits 0. Do not
  add it to `npm test`.
- [x] 2.2 Delete `src/app/production-build.test.ts`. Verify `npm run test:app`
  passes and its output no longer shows a Vite production build, and that
  `App.test.ts` and `Avatar.test.ts` still run.
- [x] 2.3 Verify `npm test` completes without performing a production app
  build. Compare and record elapsed time with and without the removed Vitest
  build test; report the observed result without requiring a speedup.
- [x] 2.4 Add `npm run check:app-build` to the "Other commands" table in
  README.md's Setup section, worded as checking that the production build
  leaves the pretend client out. Verify the command in the table runs as
  written.

## 3. Verification

Integration checks spanning the script, the npm wiring and the source guard.

- [x] 3.1 Negative control on the detector: temporarily bypass the script's
  production `NODE_ENV` assignment, then confirm
  `NODE_ENV=development node scripts/check-app-build.mjs` fails, proving the
  module graph reports `pretend-client.ts` when it is genuinely reachable
  and that a pass is not vacuous. Restore the production assignment.
- [x] 3.2 Negative control on the guard (#53's first acceptance criterion):
  remove `import.meta.env.DEV &&` from `profileClient()` in
  `src/app/main.ts`, confirm `npm run check:app-build` fails, then revert the
  edit and confirm it passes again. Leave no change to `main.ts` in the
  commit.
- [x] 3.3 Confirm the check leaves the working tree clean — `git status`
  shows nothing new, and `dist-app/` is neither created nor modified — so it
  can run alongside a real `build:app` in CI.

## Workflow follow-up

- `add-ci-pipeline` (#35, #36, #37) adds `npm run check:app-build` to the
  fast job, replacing `npm run build:app`. That carries #53's third
  acceptance criterion, "the check runs on every PR", and is deliberately
  not part of this change.
- Archive this change once the project's review requirements are satisfied,
  then verify the archived result.
