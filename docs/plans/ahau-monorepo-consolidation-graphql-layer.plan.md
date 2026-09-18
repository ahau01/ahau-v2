# Plan: Āhau Monorepo Consolidation — GraphQL Layer

**Source PRD**: `docs/prds/ahau-monorepo-consolidation.prd.md`
**Selected Milestone**: GraphQL layer migrated
**Complexity**: Medium-Large

## Summary
Migrate the 15 GraphQL-layer packages (`ahau-graphql-client`, `ahau-graphql-server`, `graphql-custom-field`, `graphql-edtf`, `graphql-stats`/`@ssb-graphql/stats`, and the 10 `@ssb-graphql/*` resolver packages — `artefact`, `invite`, `main`, `pataka`, `profile`, `settings`, `story`, `submissions`, `tribes`, `whakapapa`) into `packages/`. 13 of the 15 are confirmed live dependencies — not of `ahau/desktop` or `pataka` directly (they declare none), but of `ssb-ahau` and `ssb-pataka`, the two domain plugins migrated in Milestone 2. The other 2 (`graphql-custom-field`, `graphql-edtf`) are confirmed live via internal edges from within this same batch (`ssb-graphql-profile`, `ssb-graphql-tribes` → `graphql-custom-field`; `ssb-graphql-main` → `graphql-edtf`).

Client-side: `ahau/ui` and `pataka/ui` depend directly only on `ahau-graphql-client` plus external `graphql`/`graphql-tag` — the server-side resolver packages are wired in at the plugin layer (`ssb-ahau`, `ssb-pataka`), not the UI layer. This matters for later milestones (apps) but not this one.

**Version compatibility checked, all clean this time** — no repeat of Milestone 2's `ssb-keyring` mismatch: `ssb-graphql-main` requires `ssb-hyper-blobs@^4.1.0` (local `4.1.0`, exact match), `ssb-graphql-profile` requires `ssb-profile@^7.0.2` (local `7.0.2`, exact match), `ssb-graphql-submissions` requires `ssb-profile@^7.0.2` and `ssb-submissions@^2.0.0` (both exact matches).

**Branch-name gotcha applied proactively this time**: Milestone 2 hit a failed `git subtree add` because `ssb-submissions`'s mirror defaulted to `main`, not `master`. Checked all 15 mirrors' default branches upfront — 3 use `main` (`ahau-graphql-client`, `graphql-custom-field`, `ssb-graphql-submissions`), the other 12 use `master`. Task 1 uses the correct branch per package from the start.

**External/upstream dependencies** (new to this milestone, standard GraphQL ecosystem tooling, none of the 61 repos): `graphql`, `graphql-tag`, `graphql-upload`, `graphql-yoga`, `graphql-date`. Plus previously-identified externals still in play: `ssb-ref`, `ssb-tribes`, `ssb-serve-blobs`.

This remains proof-of-concept work per the PRD/ADR-0001 — no CI, no build-pipeline integration, local validation only.

## Patterns to Mirror
| Category | Source | Pattern |
|---|---|---|
| Naming | Established in Milestones 1-2 | Directory name matches the mirror repo's hyphenated name (e.g. `packages/ssb-graphql-main`), even where the published npm name is scoped (`@ssb-graphql/main` in `package.json`'s `name` field) — npm workspaces resolve by the `name` field, not the directory name, so this is safe and consistent with existing mirror-naming convention |
| Data access / imports | Confirmed edges: `ssb-graphql-profile` → `ssb-profile`, `ssb-graphql-main` → `ssb-hyper-blobs`, `ssb-graphql-profile`/`ssb-graphql-tribes` → `graphql-custom-field` | Same bare-specifier `require()` pattern validated in Milestones 1-2 |
| Tests | 15 packages' `package.json` scripts — mostly `npm run test:raw \| tap-arc` or `tape 'test/**/*.test.js' \| tap-arc`, a couple use `tape -r esm` for ESM interop | Same tape/tap-arc/standard toolchain; the `-r esm` variant needs no special handling, just run each package's own `test` script as-is |
| Cleanup | Milestones 1-2's established commits removing per-package `package-lock.json`/`.gitlab-ci.yml` | Repeat identically |
| Branch handling | Milestone 2's `ssb-submissions` (`main`) lesson | Verified all 15 branches upfront this time (see Summary) instead of discovering failures mid-batch |

## Files to Change
| File | Action | Why |
|---|---|---|
| `packages/ahau-graphql-client/` | CREATE | `git subtree` from mirror, branch `main`; depended on by `ahau-graphql-server` and both apps' `ui/` |
| `packages/ahau-graphql-server/` | CREATE | Branch `master`; depends on `ahau-graphql-client` |
| `packages/graphql-custom-field/` | CREATE | Branch `main`; depended on by `ssb-graphql-profile`, `ssb-graphql-tribes` |
| `packages/graphql-edtf/` | CREATE | Branch `master`; depended on by `ssb-graphql-main` |
| `packages/graphql-stats/` | CREATE | Branch `master`; npm name `@ssb-graphql/stats` |
| `packages/ssb-graphql-artefact/` | CREATE | Branch `master`; npm name `@ssb-graphql/artefact` |
| `packages/ssb-graphql-invite/` | CREATE | Branch `master`; npm name `@ssb-graphql/invite` |
| `packages/ssb-graphql-main/` | CREATE | Branch `master`; npm name `@ssb-graphql/main`; depends on `graphql-edtf`, `ssb-hyper-blobs` (Milestone 2) |
| `packages/ssb-graphql-pataka/` | CREATE | Branch `master`; npm name `@ssb-graphql/pataka` |
| `packages/ssb-graphql-profile/` | CREATE | Branch `master`; npm name `@ssb-graphql/profile`; depends on `graphql-custom-field`, `ssb-profile` (Milestone 2) |
| `packages/ssb-graphql-settings/` | CREATE | Branch `master`; npm name `@ssb-graphql/settings` |
| `packages/ssb-graphql-story/` | CREATE | Branch `master`; npm name `@ssb-graphql/story` |
| `packages/ssb-graphql-submissions/` | CREATE | Branch `main`; npm name `@ssb-graphql/submissions`; depends on `ssb-profile`, `ssb-submissions` (Milestone 2) |
| `packages/ssb-graphql-tribes/` | CREATE | Branch `master`; npm name `@ssb-graphql/tribes`; depends on `graphql-custom-field` |
| `packages/ssb-graphql-whakapapa/` | CREATE | Branch `master`; npm name `@ssb-graphql/whakapapa` |
| `packages/*/package-lock.json` (15 files) | DELETE | Same reasoning as Milestones 1-2 |
| `packages/*/.gitlab-ci.yml` (12 files — `ahau-graphql-client`, `ahau-graphql-server`, `graphql-edtf` never had one) | DELETE | Same reasoning as Milestones 1-2 |

## Tasks

### Task 1: Migrate all 15 packages via git subtree, using each mirror's actual default branch
- **Action**: For each package, `git subtree add --prefix=packages/{name} /home/taiaok/scripts/mirrors/ahau-lib-graphql-{name}-mirror {branch} -m "Migrate {name} into packages/ (history preserved via git subtree)"`, using `main` for `ahau-graphql-client`, `graphql-custom-field`, `ssb-graphql-submissions` and `master` for the other 12
- **Mirror**: Milestones 1-2's Task 1/2, with the branch-per-package lookup done upfront this time
- **Validate**: `ls packages/` shows 33 packages (18 from Milestones 1-2 + 15 new); no `git subtree add` failures

### Task 2: Remove per-package lockfiles and dead CI configs, reinstall at root
- **Action**: Delete each new package's `package-lock.json` (15) and `.gitlab-ci.yml` (12 of 15); run `mise exec node@20 -- npm install` from repo root
- **Mirror**: Milestones 1-2's Task 2/3, executed identically
- **Validate**: No `package-lock.json` exists anywhere except the repo root

### Task 3: Verify each of the 15 packages builds and tests in place
- **Action**: `mise exec node@20 -- npm test --workspace=packages/{name}` for each, individually, with bounded timeouts and full output capture (established Milestone 1-2 practice — piping through `tail` can swallow output on a hang, so redirect to a file instead)
- **Mirror**: Milestones 1-2's Task 3/4
- **Validate**: Exit 0 for all 15, or a clearly-isolated, explained exception — not a silent skip

### Task 4: Confirm the new Milestone 2/3 edges resolve locally
- **Action**: Spot-check `require.resolve()`: `ssb-graphql-profile` → `ssb-profile`, `ssb-graphql-main` → `ssb-hyper-blobs`, `ssb-graphql-profile` → `graphql-custom-field`
- **Mirror**: Milestones 1-2's Task 4/5
- **Validate**: Each resolves to `packages/*/index.js`, not a registry copy

## Validation
```bash
# from repo root, after Tasks 1-2
mise exec node@20 -- npm install
for pkg in ahau-graphql-client ahau-graphql-server graphql-custom-field graphql-edtf graphql-stats ssb-graphql-artefact ssb-graphql-invite ssb-graphql-main ssb-graphql-pataka ssb-graphql-profile ssb-graphql-settings ssb-graphql-story ssb-graphql-submissions ssb-graphql-tribes ssb-graphql-whakapapa; do
  mise exec node@20 -- npm test --workspace=packages/$pkg
done
```

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| `ssb-graphql-main` touches blob-serving (`ssb-hyper-blobs`, `ssb-serve-blobs`) — could hit the same network-dependent test hang seen with `artefact-store` (Milestone 1) and `ssb-hyper-blobs` (Milestone 2) | Medium | Isolate and bound any hang exactly as done previously; not a migration defect if it recurs |
| Scoped package names (`@ssb-graphql/*`) living in unscoped directory names could confuse a future contributor expecting directory-name-matches-package-name | Low | Documented explicitly in Patterns to Mirror; matches the pre-existing mirror-repo naming convention, not a new inconsistency introduced here |
| `graphql-custom-field` and `graphql-edtf` have no direct app-level consumer — only used transitively | Low | Confirmed via dependency grep, not a guess; still correctly in scope since `ssb-graphql-profile`, `ssb-graphql-tribes`, `ssb-graphql-main` genuinely need them |

## Execution Notes (post-run)
- **Branch-lookup lesson from Milestone 2 paid off**: all 15 `git subtree add` calls succeeded on the first pass using the pre-checked branch per package (3 `main`, 12 `master`) — no failed attempts this time.
- **Task 1 initially failed entirely** with "working tree has modifications. Cannot add." — the drafted plan and PRD update from earlier in the session were never committed before starting execution. Fixed by committing them first, then retrying; all 15 subtree adds succeeded cleanly afterward.
- **5/15 fully clean**: `ahau-graphql-client` (lint-only, no test suite), `ahau-graphql-server` 4/4, `graphql-custom-field` 138/138, `graphql-stats` 18/18, `ssb-graphql-pataka` 7/7.
- **1/15 pre-existing, unrelated lint-only issue**: `graphql-edtf` — 118/118 functional tests pass; lint fails on a number-literal-precision warning in test code, same category as Milestone 1's `ssb-split-publish` finding.
- **9/15 blocked by a genuine, non-trivial finding**: `ssb-graphql-artefact`, `ssb-graphql-invite`, `ssb-graphql-main`, `ssb-graphql-profile`, `ssb-graphql-settings`, `ssb-graphql-story`, `ssb-graphql-submissions`, `ssb-graphql-tribes`, `ssb-graphql-whakapapa` all fail (0 tests run, or a hang) because their test runner uses the `esm` package (an npm package for CJS/ESM interop, unmaintained since ~2019) via `tape -r esm`. `esm`'s bundled parser can't handle modern JS syntax (`?.()` optional chaining) in `lru-cache@10.4.3`, which is now reachable transitively (`artefact-store` → `rimraf` → `glob` → `path-scurry` → `lru-cache@10.4.3`) because all 33 packages now share one hoisted `node_modules` tree. In the original isolated repos, each had its own lockfile pinning `lru-cache@^6.0.0`/`^7.14.1`, which never triggered this. **This is a real, migration-caused (hoisting) regression in test tooling, not a pre-existing bug** — unlike the `artefact-store` network-test or `ssb-atala-prism`'s broken SDK findings from earlier milestones, which were both confirmed pre-existing.
- **One fix attempt was tried and reverted after it caused a worse regression.** Pinning `lru-cache` via root `package.json` `overrides` required a full `rm -rf node_modules && npm install` to take effect. That clean reinstall — independent of the override itself — resolved the *entire* 33-package tree differently than the incremental installs built up across Milestones 1-3, and broke 3 packages that were genuinely passing before: `ssb-crut` (was 185/185), `ssb-profile` (was 438/438), plus 2 of this milestone's own passing packages (`ahau-graphql-server`, `graphql-custom-field`). The override was reverted immediately.
- **`npm dedupe` (a lighter-touch alternative) fully recovered the regression** without another full re-resolution — all 5 affected packages (`ssb-crut`, `ssb-profile`, `ssb-graphql-pataka`, `ahau-graphql-server`, `graphql-custom-field`) re-verified back to their original passing counts. It did **not** fix the original 9-package `esm`/`lru-cache` issue (confirmed via re-test on `ssb-graphql-artefact`) — `dedupe` only collapses duplicates where safe under existing semver ranges, and can't force the whole tree onto one `lru-cache` version the way `overrides` tried to (and broke things doing it).
- **Decision, made explicitly with the user rather than assumed**: document the 9-package `esm`/hoisting issue as a known, unresolved finding rather than attempt another fix. The demonstrated blast radius of dependency-resolution changes in this 33-package shared tree is real, and not worth re-risking for a devDependency-only (test tooling) issue that doesn't touch any package's actual production code.
- **A secondary, narrower finding surfaced during the override investigation** (not fixed, not re-verified after revert, but worth recording): `ssb-graphql-artefact` also hits a missing transitive devDependency (`tap-arc@1.3.2`'s own `tap-reader@^0.2.1` requirement isn't installed, despite being present in the original repo's lockfile and available on the registry) — a separate, narrower gap from the main `esm`/`lru-cache` issue, affecting test tooling only.
- **Summary**: 5/15 clean, 1/15 confirmed pre-existing/unrelated, 9/15 blocked by a genuine hoisting-caused test-tooling regression (documented, not fixed, per explicit user decision). No production/resolver source code was affected by any of this — only test-runner tooling compatibility.

## Acceptance
- [x] All tasks complete
- [x] Validation passes (5/15 fully clean, 1/15 pre-existing/unrelated, 9/15 blocked by a documented hoisting-caused esm/lru-cache issue — see Execution Notes; a regression introduced while investigating a fix was found and fully reverted)
- [x] Patterns mirrored, not reinvented
- [x] Milestone 2 ↔ Milestone 3 dependency edges confirmed resolving locally, not from the registry
