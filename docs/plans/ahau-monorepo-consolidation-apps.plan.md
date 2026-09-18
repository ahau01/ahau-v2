# Plan: Āhau Monorepo Consolidation — Apps Consolidated

**Source PRD**: `docs/prds/ahau-monorepo-consolidation.prd.md`
**Selected Milestone**: Apps consolidated
**Complexity**: Large (first milestone touching real application code, not just plugins)

## Summary
Migrate `ahau/ahau` and `ahau/pataka` into `apps/ahau` and `apps/pataka`. Unlike Milestones 1-3, these are not single-package repos — `ahau/ahau` contains `desktop/`, `mobile/`, and `ui/` as independently-managed subdirectories (no internal npm workspace of its own; the root `package.json` is a lightweight orchestrator using `npm --prefix`/`cd`), and `ahau/pataka` has its own root-level Electron app plus a `ui/` subdirectory. This structural difference drives three real decisions, each grounded in actual dependency data rather than assumed:

**1. Workspace glob must go one level deeper than `apps/*`.** `apps/ahau`'s own `package.json` only declares one dependency (`env-paths`) — all the real `ssb-*`/`ahau-*` plugin dependencies (25 of them, confirmed via `desktop/package.json`) live in `apps/ahau/desktop`. Similarly, `apps/ahau/ui` and `apps/pataka/ui` each declare `ahau-graphql-client`, `ssb-hyper-blobs`/`ahau-env` directly. For these subdirectories' `require()` calls to resolve against our already-migrated `packages/*` (the entire point of this consolidation), they must themselves be npm workspace members. `apps/pataka`'s root, unlike `ahau`'s, *is* where its real dependencies live (confirmed: `ssb-ahoy`, `ssb-artefact`, `ssb-pataka`, etc. — all already migrated), so `apps/*` alone already covers it. The root `package.json` workspace glob needs `apps/*/desktop` and `apps/*/ui` added alongside the existing `apps/*`.

**2. `apps/ahau/mobile` stays outside the workspace entirely.** Its dependencies (`cordova`, `cordova-android`, `nodejs-mobile-cordova`, etc.) contain zero overlap with anything in `packages/*` — confirmed via its full dependency list. It keeps its own independent `package-lock.json` and install process exactly as before; nothing about this migration changes how it's built. This isn't an oversight, it's deliberate — Cordova's native build tooling is cleaner kept isolated, and there's no actual coupling to unify.

**3. `ahau-env` must be migrated as a prerequisite, and it retroactively fixes a Milestone 2 gap.** Both `apps/ahau/ui` and `apps/pataka/ui` need it directly, and — discovered only now, not anticipated in Milestone 2's plan — `ssb-ahau` and `ssb-pataka` (both already migrated, both already declaring `ahau-env: ^3.0.0`) have been silently resolving it from the npm registry this whole time, since we never migrated it. Confirmed via `npm ls ahau-env`. It's a trivial package (one `index.js`), version `3.0.0` (exact match to what's already declared everywhere). The other packages in the same architecture-map cluster (`ahau-cli`, `pataka-cli`, `ahau-copy`, `ahau-csv`, `ahau-icons`, `ahau-fixtures`) all have zero real dependents (confirmed via the dependency graph) and aren't part of the PRD's MVP scope (they're standalone CLI/dev tools, not part of "Āhau desktop/mobile and Pataka") — left out deliberately, not overlooked.

**Validation approach differs from Milestones 1-3.** `desktop` and `pataka`'s root have **no test suite at all** — they're Electron apps with only build/dist/electron-builder scripts. `ui` (both apps) has a real tape-based test suite and can be validated the same way as before. For `desktop`/`pataka` backend, validation is a lighter build-only check (`build:main`/`build:backend`, the bundler step) rather than a full `electron-builder dist`/`pack`, which produces installers and isn't necessary to prove module resolution works — consistent with this being proof-of-concept work, not a release build.

This remains proof-of-concept per the PRD/ADR-0001 — no CI, no build-pipeline integration, no installer artifacts produced.

## Patterns to Mirror
| Category | Source | Pattern |
|---|---|---|
| Workspace glob depth | `ahau/desktop`, `ahau/ui`, `pataka/ui`'s actual dependency declarations | Extend `workspaces` to `["packages/*", "apps/*", "apps/*/desktop", "apps/*/ui"]` — grounded in exactly which subdirectories need packages/* linking, not a guess |
| Exclusion | `mobile`'s full dependency list (zero overlap with packages/*) | Leave `apps/ahau/mobile` outside the workspace glob entirely — same reasoning as ADR-0001's "genuine external deps stay external," applied to build tooling instead of npm packages |
| Cleanup | Milestones 1-3's established lockfile/CI removal | Delete `package-lock.json` for every subdir that becomes a workspace member (root, desktop, ui for ahau; root, ui for pataka); **do not** delete `mobile`'s lockfile, since it stays independently managed |
| Prerequisite package | Milestones 1-3's own package migration pattern | `ahau-env` migrates via `git subtree` exactly like the 33 packages already done — same mechanism, just triggered by app-layer grounding instead of plugin-layer |

## Files to Change
| File | Action | Why |
|---|---|---|
| `package.json` (root) | UPDATE | Add `apps/*/desktop` and `apps/*/ui` to `workspaces` |
| `packages/ahau-env/` | CREATE | Prerequisite package; `git subtree` from `ahau/lib/ahau-env`; fixes a silent registry-fallback gap in already-migrated `ssb-ahau`/`ssb-pataka` |
| `apps/ahau/` (root + `desktop/`, `mobile/`, `ui/`) | CREATE | `git subtree` from `ahau/ahau` mirror (single operation brings the whole tree, subdirs included) |
| `apps/pataka/` (root + `ui/`) | CREATE | `git subtree` from `ahau/pataka` mirror |
| `packages/ahau-env/package-lock.json` | DELETE | Same reasoning as Milestones 1-3 |
| `apps/ahau/package-lock.json` | DELETE | Root becomes a workspace member |
| `apps/ahau/desktop/package-lock.json` | DELETE | Becomes a workspace member |
| `apps/ahau/ui/package-lock.json` | DELETE | Becomes a workspace member |
| `apps/ahau/mobile/package-lock.json` | KEEP | Deliberately not a workspace member — stays independently managed |
| `apps/ahau/.gitlab-ci.yml`, `apps/ahau/.gitlab/` | DELETE | Same GitLab-relic reasoning as every prior milestone |
| `apps/pataka/package-lock.json` | DELETE | Root becomes a workspace member |
| `apps/pataka/ui/package-lock.json` | DELETE | Becomes a workspace member |

## Tasks

### Task 1: Migrate `ahau-env` first (prerequisite)
- **Action**: `git subtree add --prefix=packages/ahau-env /home/taiaok/scripts/mirrors/ahau-lib-ahau-env-mirror master -m "Migrate ahau-env into packages/ (history preserved via git subtree)"`
- **Mirror**: Milestones 1-3's own package-migration task
- **Validate**: `npm ls ahau-env` after root reinstall shows it resolving to `./packages/ahau-env`, not the registry, for both `ssb-ahau` and `ssb-pataka`

### Task 2: Extend the root workspace glob
- **Action**: Update root `package.json`'s `workspaces` array to `["packages/*", "apps/*", "apps/*/desktop", "apps/*/ui"]`
- **Mirror**: n/a — first time this specific glob depth is needed, grounded in Task 0's dependency findings, not copied from elsewhere
- **Validate**: After Tasks 3-4 land the actual app directories, `npm ls` shows `apps/ahau/desktop`, `apps/ahau/ui`, `apps/pataka`, `apps/pataka/ui` all as recognized workspace members

### Task 3: Migrate `ahau/ahau` into `apps/ahau`
- **Action**: `git subtree add --prefix=apps/ahau /home/taiaok/scripts/mirrors/ahau-ahau-mirror master -m "Migrate ahau (desktop/mobile/ui) into apps/ (history preserved via git subtree)"` — single operation, brings `desktop/`, `mobile/`, `ui/` along as part of the same tree
- **Mirror**: Same `git subtree` mechanism as every prior package migration
- **Validate**: `ls apps/ahau/` shows `desktop/`, `mobile/`, `ui/`, plus root files; `git log --oneline | wc -l` grows substantially (this is `ahau/ahau`'s full history — the single largest repo in the ecosystem, 975 MRs)

### Task 4: Migrate `ahau/pataka` into `apps/pataka`
- **Action**: `git subtree add --prefix=apps/pataka /home/taiaok/scripts/mirrors/ahau-pataka-mirror master -m "Migrate pataka into apps/ (history preserved via git subtree)"`
- **Mirror**: Same mechanism
- **Validate**: `ls apps/pataka/` shows `ui/` plus root files (`main.js`, `bundle.mjs`, `ssb.config.js`)

### Task 5: Remove lockfiles/CI configs for workspace-member subdirs only
- **Action**: Delete `package-lock.json` from `apps/ahau/`, `apps/ahau/desktop/`, `apps/ahau/ui/`, `apps/pataka/`, `apps/pataka/ui/`, `packages/ahau-env/`. Delete `apps/ahau/.gitlab-ci.yml` and `apps/ahau/.gitlab/`. **Explicitly do not touch** `apps/ahau/mobile/package-lock.json`
- **Mirror**: Milestones 1-3's cleanup pattern, with the one deliberate mobile exception documented inline
- **Validate**: `find apps packages -name package-lock.json` shows only `apps/ahau/mobile/package-lock.json` remaining outside the root

### Task 6: Root install and dependency-resolution verification
- **Action**: `mise exec node@20 -- npm install` from repo root
- **Mirror**: Milestones 1-3's install step
- **Validate**: `require.resolve('ssb-ahau', {paths:['apps/ahau/desktop']})`, `require.resolve('ahau-graphql-client', {paths:['apps/ahau/ui']})`, `require.resolve('ssb-pataka', {paths:['apps/pataka']})` all resolve to `packages/*`, not a registry copy or `node_modules` cache

### Task 7: Validate what can actually be validated
- **Action**: Run `ui`'s and `pataka/ui`'s real test suites (`npm test --workspace=apps/ahau/ui`, `npm test --workspace=apps/pataka/ui`). For `desktop` and `pataka` root (no test suite exists), run the lighter bundler-only build step (`npm run build:main --workspace=apps/ahau/desktop`, `npm run build:backend --workspace=apps/pataka`) rather than a full `electron-builder dist`/`pack` — proportionate to proving module resolution works, not producing a release artifact
- **Mirror**: Milestones 1-3's "run the actual validation the package already has," adapted since these two apps don't have one in the same shape
- **Validate**: `ui` test suites pass or fail with clearly-understood reasons (same rigor as prior milestones); `desktop`/`pataka` bundler steps complete without module-resolution errors

## Validation
```bash
# from repo root, after Tasks 1-5
mise exec node@20 -- npm install
npm ls ahau-env   # confirm local resolution, not registry, for ssb-ahau/ssb-pataka
node -e "console.log(require.resolve('ssb-ahau', {paths:['apps/ahau/desktop']}))"
node -e "console.log(require.resolve('ahau-graphql-client', {paths:['apps/ahau/ui']}))"
node -e "console.log(require.resolve('ssb-pataka', {paths:['apps/pataka']}))"
mise exec node@20 -- npm test --workspace=apps/ahau/ui
mise exec node@20 -- npm test --workspace=apps/pataka/ui
mise exec node@20 -- npm run build:main --workspace=apps/ahau/desktop
mise exec node@20 -- npm run build:backend --workspace=apps/pataka
find apps packages -name package-lock.json   # only apps/ahau/mobile should remain
```

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| `desktop`/`pataka`'s Electron-specific native module rebuilds (`electron-builder install-app-deps` in `postinstall`) may not run correctly under plain `npm install` — Electron uses a different ABI than plain Node | Medium | Not attempting a full Electron runtime launch in this milestone; the bundler-only build step (Task 7) doesn't require native modules to be Electron-ABI-correct, only Node-resolvable. A full `electron-builder dist` is explicitly out of scope for this PoC pass |
| `patch-package` is used by both `desktop` and `pataka` (`postinstall: "patch-package && ..."`) — patches may reference paths that assume the old repo-per-package layout | Medium | Check `patches/` directories in both repos as part of Task 6/7 execution; a patch that fails to apply will surface as a clear `postinstall` error, not a silent corruption |
| `ahau/ahau`'s history is the largest single migration in this project (975 MRs, the flagship app) — `git subtree add` could be slow or hit an edge case not seen in smaller repos | Low-Medium | No dry-run smaller substitute exists here (it's the whole point of this task); if it fails, the failure mode is the same "working tree has modifications" or branch-mismatch class already seen and understood from Milestones 1-3 |
| Workspace glob depth (`apps/*/desktop`, `apps/*/ui`) is somewhat ad-hoc, coupled to `ahau`'s specific internal layout — a future third app with a different internal structure would need its own glob entry | Low | Documented explicitly here as a known, deliberate coupling, not hidden; acceptable for a 2-app monorepo, revisit if a third app's layout differs |

## Execution Notes (post-run)
- **`ahau-env` migration confirmed to fix the Milestone 2 gap exactly as predicted**: `npm ls ahau-env` shows a single deduped local copy (`packages/ahau-env`) used everywhere, including through `ssb-ahau`'s own nested resolution — no more silent registry fallback.
- **New finding: postinstall scripts with hardcoded relative paths break under hoisting.** `apps/ahau/ui`'s `fix:sass` script (`sass-migrator division node_modules/vuetify/**/*.s*ss`) and all three apps' `patch-package` calls assume their own dependencies live at `<cwd>/node_modules/<pkg>` — but npm's workspace hoisting places many of them at the monorepo root instead. This caused the very first `npm install` to abort entirely (npm treats a failed lifecycle script as fatal by default). **Fix, applied without touching any source file**: installed with `npm install --ignore-scripts` first (guarantees every package is actually written to disk regardless of hoisting), then manually replayed each lifecycle step in the correct context — `patch-package` run twice per app (once from the app's own directory for privately-nested deps, once from the repo root with `--patch-dir` for hoisted ones — different packages needed different runs, confirmed by checking which ones failed each way), and `sass-migrator` invoked directly against the correct root-relative path. All patches and the sass migration applied successfully. This is a process workaround, not a code change — nothing in `apps/*` or `packages/*` was edited to make this work.
- **New finding, not fixed, flagged prominently**: `apps/ahau/desktop` declares `ssb-ahau: ^16.4.1`, but the migrated local package is `17.0.0` — confirmed via `require.resolve` that desktop falls back to a nested registry copy (`ssb-ahau@16.5.1`) for its single most important dependency. This is a more consequential instance of the stale-pin pattern than Milestone 2's `ssb-keyring` (unused) or Milestone 3's `ahau-graphql-client` (devDependency, verified safe via full test suites) — `desktop` has **no test suite at all**, so there's no way to verify a version bump wouldn't introduce a real behavioral break. Deliberately not touched. This is the most significant open finding from this milestone and is called out separately in the summary to the user, not just buried here.
- **Near-miss, caught before committing**: `desktop`'s `patch-package --patch-dir` run from the repo root doesn't distinguish a disposable third-party `node_modules` copy from our actual migrated source — `node_modules/@ssb-graphql/whakapapa` at root is a *symlink into `packages/ssb-graphql-whakapapa`*, not an extracted copy. Desktop's own runtime resolution correctly uses a private nested copy (confirmed genuinely `6.0.0`, matching the patch exactly, correctly patched by the *first* directory-context `patch-package` run) — the second, root-context run was unnecessary for this one package and instead wrote desktop's old-version patch directly into our real, shared source file (`typeDefs.js`, loosening a GraphQL enum type and adding two enum values that don't belong in the current schema). Caught via `git status` before any commit, reverted immediately (`git checkout -- packages/ssb-graphql-whakapapa/src/typeDefs.js`). The other 6 packages touched by the same root-context run (`chloride`, `esbuild-plugin-fileloc`, `pull-fs`, `ssb-ahoy`, `ssb-friends`, `@atala/prism-wallet-sdk`) are all confirmed external/upstream packages, not our own — safe. **Lesson for any future patch-package replay in this repo**: check whether a failing patch target is one of `packages/*`'s own names before running a root-context pass; if so, the app-directory-context run alone is almost certainly the correct (and only safe) one.
- **Test/build results**:
  - `apps/ahau/ui`: **820/820 passing**, exit 0.
  - `apps/pataka/ui`: genuinely has zero test files (confirmed via `find`) — "0 tests" is correct, not a failure. Lint reports pre-existing Vue component-naming violations (`Avatar`, `Dialog`, `Meter`, `Dashboard` — all single-word names violating a rule that requires multi-word names), unrelated to migration.
  - `apps/ahau/desktop`: bundler-only build (`build:main`) succeeds, produces a real 15MB `main.bundle.js`.
  - `apps/pataka`: bundler-only build (`build:backend`) succeeds, produces a real 11MB `main.bundle.js` — required using the exact package name (`--workspace=Pataka`) rather than the path (`--workspace=apps/pataka`), which ambiguously matched `apps/pataka/ui` too and produced a misleading failure on the first attempt despite the real build having already succeeded.
  - Full Electron installer builds (`electron-builder dist`/`pack`) were not attempted, as scoped — proportionate to proving module resolution and bundling work, not producing a release artifact.
- **Sentinel check caught a scare, resolved as flaky**: `ssb-crut`'s `test:js:db2` run failed one test ("returns the Māui B profile (forced merge)") after this milestone's large `npm install`. Re-ran immediately: 185/185 clean. This is a timing-sensitive merge-conflict-resolution test (two messages published within 1ms of each other, forced-merge tiebreak logic) — same category of flakiness already established with `ssb-whakapapa` in Milestone 2, not a Milestone 4 regression. The larger install may have shifted system timing enough to trip it once, but the underlying flakiness is pre-existing.

## Acceptance
- [x] All tasks complete
- [x] Validation passes (or failures are clearly characterized, same rigor as Milestones 1-3) — see results above
- [x] `apps/ahau/mobile` confirmed untouched/independent, not silently pulled into the workspace (not in the workspace glob, its lockfile deliberately preserved)
- [x] `ahau-env` migration confirmed to also fix the Milestone 2 registry-fallback gap for `ssb-ahau`/`ssb-pataka`
- [x] No electron-builder installer/dist artifacts produced (out of scope for this PoC pass)
