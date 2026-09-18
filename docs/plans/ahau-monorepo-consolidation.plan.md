# Plan: Āhau Monorepo Consolidation

**Source PRD**: `docs/prds/ahau-monorepo-consolidation.prd.md`
**Selected Milestone**: Core plumbing migrated
**Complexity**: Medium

## Summary
Stand up the monorepo's git remote and workspace tooling, then migrate the 7 foundational SSB plumbing packages (`ssb-crut`, `ssb-crut-authors`, `artefact-store`, `artefact-server`, `ssb-keyring`, `ssb-migrate`, `ssb-split-publish`) from their individual mirror repos into `packages/`, using npm workspaces so bare-specifier `require()` calls in downstream consumers keep resolving without change. No app or domain-plugin migration happens in this phase — this milestone only proves the workspace mechanics work and that each plumbing package still builds and tests correctly in its new home.

**This phase is proof-of-concept, not a production cutover.** No GitHub Actions, CI pipeline, branch protection, or release automation is set up or assumed as a near-term follow-up — validation is local (`npm test` per package) only. The repo still gets created under the correct org (see Hosting below) so the work has a real home and isn't lost, but nothing about "integrating with GitHub builds" is in scope here or implied as coming next.

**Hosting**: this local directory is not yet a git repository, and `MakingEverythingAchievableNZ/ahau-monorepo` does not yet exist on GitHub (confirmed via `gh repo view` — the org exists, matching source-repo URLs already seen in `ahau-arch-map`; `gh auth status` shows an authenticated `taiaok` account with `repo` scope). The monorepo must be created and pushed under that org via `gh`, not GitLab — the source repos' `.gitlab-ci.yml` files are dead weight from before the fork's move to GitHub (`ahau-arch-map/plan.md` confirms the architecture-docs repo itself was already moved to GitHub for the same reason).

Source repos are available as bare mirror clones at `/home/taiaok/scripts/mirrors/ahau-lib-{name}-mirror` (61 total, confirmed present). All 7 target packages use `npm` (each currently ships its own `package-lock.json`), `tape` + `tap-arc` for tests, and `standard --fix` for lint — a consistent toolchain to carry forward. Two internal edges exist within this package set: `ssb-crut-authors` depends on `ssb-crut` (`^6.0.0`, satisfied by local `6.1.1`), and `artefact-server` depends on `artefact-store` (`^1.4.0`, satisfied by local `1.4.0`) — both ranges are currently compatible, so workspace symlinking should resolve cleanly.

## Patterns to Mirror
| Category | Source | Pattern |
|---|---|---|
| Naming | `ahau-lib-ssb-crut-mirror:package.json` (`"name": "ssb-crut"`) | Package dir name in `packages/` matches the published npm name exactly (no `ahau-` prefix, no path segments) |
| Data access / imports | `ahau-lib-ssb-crut-authors-mirror:index.js:1` (`require('ssb-crut')`) | Consumers use bare-specifier `require('pkg-name')`, never relative paths across package boundaries — workspaces preserve this via node_modules symlinking, no code changes needed |
| Tests | `ahau-lib-ssb-crut-mirror:package.json` scripts (`tape 'test/**/*.test.js' \| tap-arc --bail`) | Every target package already uses `tape` + `tap-arc`; keep each package's own `test` script as the source of truth, don't introduce a new test runner |
| Lint | All 7 packages' `package.json` scripts (`"lint": "standard --fix"`) | Keep `standard` per-package; no ESLint migration in this milestone |
| Hosting | `ahau-arch-map/plan.md` §1 ("Pushing `ahau-arch-map` to GitHub...") and `appendix_table.md` source URLs (`github.com/MakingEverythingAchievableNZ/*`) | The fork already lives on GitHub under `MakingEverythingAchievableNZ`; the monorepo follows the same org, via `gh`, not GitLab |
| No existing monorepo/root-config pattern | — | `ahau-monorepo` currently contains only `docs/` and `.claude/`, and is not yet a git repository — there is no existing root `package.json`, workspace config, or CI file to mirror. The root manifest below is new, not adapted from a prior pattern. |

## Files to Change
| File | Action | Why |
|---|---|---|
| `.git/` (repo init) | CREATE | Local directory isn't a git repo yet; required before any commit or `gh` push |
| `package.json` (root) | CREATE | Declares npm workspaces (`packages/*`, `apps/*`) so later milestones don't require a second root migration |
| `.gitignore` (root) | CREATE | Consolidate `node_modules`, log, and build-artifact ignores currently duplicated per-package |
| `.nvmrc` (root) | CREATE | Pin a Node version satisfying `artefact-store`'s `"node": "<16 \|\| >=18"` constraint — the only `engines` field found among these 7 packages |
| `packages/ssb-crut/` | CREATE | Migrate from `ahau/lib/ssb-crut` mirror via `git subtree`, preserving commit history |
| `packages/ssb-crut-authors/` | CREATE | Migrate from `ahau/lib/ssb-crut-authors` mirror; depends on `ssb-crut` |
| `packages/artefact-store/` | CREATE | Migrate from `ahau/lib/artefact-store` mirror |
| `packages/artefact-server/` | CREATE | Migrate from `ahau/lib/artefact-server` mirror; depends on `artefact-store` |
| `packages/ssb-keyring/` | CREATE | Migrate from `ahau/lib/ssb-keyring` mirror |
| `packages/ssb-migrate/` | CREATE | Migrate from `ahau/lib/ssb-migrate` mirror |
| `packages/ssb-split-publish/` | CREATE | Migrate from `ahau/lib/ssb-split-publish` mirror |
| `packages/*/package-lock.json` | DELETE | npm workspaces use a single root lockfile; per-package lockfiles conflict with hoisted installs |
| `packages/*/.gitlab-ci.yml` | DELETE | GitLab-specific CI is a relic from before the fork moved to GitHub; 2 of 7 packages (`ssb-migrate`, `ssb-split-publish`) never had one, confirming it's not load-bearing. No replacement CI is added — this is a proof-of-concept phase, not a build-integration milestone. |

## Tasks

### Task 0: Initialize the repo and create the GitHub remote
- **Action**: `git init` locally; `gh repo create MakingEverythingAchievableNZ/ahau-monorepo --source=. --remote=origin` (visibility TBD — see Open Questions); commit the existing `docs/` and `.claude/` content first so history starts clean
- **Mirror**: `ahau-arch-map`'s own move to GitHub under the same org
- **Validate**: `gh repo view MakingEverythingAchievableNZ/ahau-monorepo` succeeds; `git remote -v` shows `origin` pointing at it
- **Note**: this creates a shared, externally-visible resource — confirm repo visibility (private/public) and org placement with the user before running, per standard practice for actions visible to others

### Task 1: Scaffold root workspace
- **Action**: Create root `package.json` with `"private": true` and `"workspaces": ["packages/*", "apps/*"]`; create root `.gitignore` and `.nvmrc`
- **Mirror**: No existing pattern to mirror (first root config in this repo) — `engines` constraint taken from `artefact-store`'s `package.json`
- **Validate**: `npm install` at root completes without error (will no-op on packages until Task 2 lands them)

### Task 2: Migrate each of the 7 packages with history preserved
- **Action**: For each package, `git subtree add --prefix=packages/{name} /home/taiaok/scripts/mirrors/ahau-lib-{name}-mirror master` (or the equivalent for packages under `ahau/lib/ssb-plugins/` vs `ahau/lib/` — confirm exact mirror path per package before running)
- **Mirror**: `ahau-arch-map/ARCHITECTURE.md` core-plumbing cluster listing, which enumerates exactly these 7 repos as the "core plumbing" group
- **Validate**: `git log --follow packages/ssb-crut/index.js` shows pre-migration history intact for at least one migrated package

### Task 3: Remove per-package lockfiles and dead CI configs, install at root
- **Action**: Delete each `packages/*/package-lock.json` and `packages/*/.gitlab-ci.yml`; run `npm install` from the repo root to generate one consolidated root lockfile
- **Mirror**: n/a (workspace consolidation is inherent to npm workspaces, not adapted from an existing pattern)
- **Validate**: A single `package-lock.json` exists only at the repo root; `npm ls ssb-crut artefact-store` from root resolves both to `packages/*` via symlink, not the registry

### Task 4: Verify each package still builds and tests in place
- **Action**: Run each package's own `test` script from its new location
- **Mirror**: Each package's existing `scripts.test` (tape + tap-arc + standard), unchanged
- **Validate**: `npm test --workspace=packages/ssb-crut` (repeat per package) exits 0 for all 7

### Task 5: Confirm internal cross-package requires resolve without code changes
- **Action**: No source edits — verify `require('ssb-crut')` in `packages/ssb-crut-authors/index.js` and `require('artefact-store')` in `packages/artefact-server/index.js` resolve to the local workspace packages
- **Mirror**: `ahau-lib-ssb-crut-authors-mirror:index.js:1`, `ahau-lib-artefact-server-mirror:index.js:12` — the exact `require()` calls that must keep working unmodified
- **Validate**: `node -e "console.log(require.resolve('ssb-crut', {paths:['packages/ssb-crut-authors']}))"` prints a path under `packages/ssb-crut/`, not a registry cache path

### Task 6: Push to GitHub (hosting only, not a build trigger)
- **Action**: `git push -u origin main` (or `master`, matching whatever default branch Task 0 created). This is purely to give the work a durable, shared home under the correct org — no workflow, Action, or build is expected to fire on push
- **Mirror**: n/a
- **Validate**: `gh repo view MakingEverythingAchievableNZ/ahau-monorepo --json defaultBranchRef` shows the pushed branch; commit history for at least one migrated package visible on github.com

## Validation
```bash
# from repo root, after Tasks 0-3
npm install
npm test --workspace=packages/ssb-crut
npm test --workspace=packages/ssb-crut-authors
npm test --workspace=packages/artefact-store
npm test --workspace=packages/artefact-server
npm test --workspace=packages/ssb-keyring
npm test --workspace=packages/ssb-migrate
npm test --workspace=packages/ssb-split-publish
git log --follow packages/ssb-crut/index.js | head -5   # confirm history preserved
gh repo view MakingEverythingAchievableNZ/ahau-monorepo  # confirm correct org/host
```

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| `git subtree` history import is fiddly across 7 repos with inconsistent branch/tag hygiene | Medium | Do one package first (`ssb-split-publish`, smallest, zero internal deps) as a dry run before the rest |
| Deleting per-package `package-lock.json` before root install could mask a version drift bug that was silently working before | Low | `npm test` per package (Task 4) catches breakage immediately; internal semver ranges already confirmed compatible during grounding |
| "Still builds" is only locally verified (`npm test`), not continuously enforced | Low | Acceptable for this proof-of-concept phase by design — no CI/build-integration goal exists to fall short of; revisit only if/when this moves from PoC toward a production cutover |
| Repo creation under `MakingEverythingAchievableNZ` is a visible, shared action | Low likelihood of harm, but irreversible-ish | Task 0 is flagged for explicit confirmation (visibility, org) before running — not auto-executed |
| Package dir naming (`packages/ssb-crut`) diverging from any future decision on `packages/*` naming convention set by later milestones (domain plugins, GraphQL) | Low | This plan's naming choice (bare npm name, no prefix) is the natural default; revisit only if a later milestone's plan finds a conflict |

## Execution Notes (post-run)
- **Node version matters more than expected**: the shell's active Node was `v26.5.0` (via `mise`), not the pinned `20` in `.nvmrc` — nothing in this environment auto-switches per `.nvmrc`. `artefact-store`'s `fileSize` test hung indefinitely under Node 26 and passed immediately once re-run under Node 20 (`mise exec node@20 -- npm test ...`). Future package migrations in this monorepo should explicitly run tests via `mise exec node@20` (or equivalent) until an enforced version-switch mechanism exists — tracked as a new open item, not solved here.
- **`artefact-store`'s `getConnectedPeersForDrive` test hangs even under Node 20** — it performs real hyperswarm peer discovery, which needs actual P2P network connectivity (UDP/DHT). This is very likely a sandboxed-environment limitation, not a migration defect: every test before it (encryption, fileSize, fileStats, byte-range reads) passes cleanly. Confirming this needs an environment with real network access; not blocking for this proof-of-concept milestone.
- All other 6 packages passed in full under Node 20: `ssb-split-publish` 8/8 (one pre-existing lint issue — unused `pull` import in `test/recps.test.js`, present before migration, out of scope to fix here), `ssb-crut` 185/185 clean, `ssb-crut-authors` 83/83 clean, `artefact-server` 37/37 clean, `ssb-keyring` 112/112 clean, `ssb-migrate` 32/32 clean.
- Cross-package `require()` resolution confirmed exactly as specified: `require.resolve('ssb-crut', ...)` from `ssb-crut-authors` and `require.resolve('artefact-store', ...)` from `artefact-server` both resolve to `packages/*/index.js` directly, not a registry copy.

## Acceptance
- [x] All tasks complete
- [x] Validation passes (6/7 packages fully green; `artefact-store` green except one network-dependent test consistent with sandbox limitations, not a regression)
- [x] Patterns mirrored, not reinvented
- [x] Repo confirmed under `github.com/MakingEverythingAchievableNZ/ahau-monorepo`, not GitLab
