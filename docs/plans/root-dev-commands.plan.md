# Plan: Root-Level Dev Commands for Āhau and Pātaka

**Source PRD**: `docs/prds/root-dev-commands.prd.md`
**Selected Milestone**: Root dev commands added
**Complexity**: Small

## Summary
Add two root-level npm scripts — `dev:ahau` and `dev:pataka` — that each start their app's full dev environment (ui + backend/desktop together) from the repo root. `apps/ahau` already has a working `concurrently`-based `dev` script combining `ui`+`desktop`; the root script for it is a thin delegator. `apps/pataka` has no equivalent — its `dev` (electron only) and `serve` (ui only) are separate — so this plan adds a matching `concurrently`-based script to `apps/pataka`, mirroring `ahau`'s exact structure and naming, before the root delegator can point at it.

`concurrently` (`^9.2.1`) is currently a private devDependency of `apps/ahau` only — not hoisted to root, not available to `apps/pataka`. It needs adding as `apps/pataka`'s own devDependency too.

## Patterns to Mirror
| Category | Source | Pattern |
|---|---|---|
| Concurrent dev script structure | `apps/ahau/package.json:5` — `"dev": "concurrently --kill-others --names ui,desktop --prefix-colors cyan,green \"npm:dev:ui\" \"npm:dev:desktop\""` | Same `concurrently` flags (`--kill-others`, named/colored output) applied to `apps/pataka`, renamed `desktop`→`backend` to match its actual role |
| Startup race handling | `apps/ahau/package.json:7` — `"dev:desktop": "wait-on tcp:3000 --timeout 30000 && npm --prefix desktop run dev"` | `ahau`'s desktop step waits for `ui`'s dev server (port 3000) before launching Electron. `pataka`'s ui dev server runs on port 8081 (`apps/pataka/ui/package.json`'s `dev` script: `DEV_SERVER_PORT=8081 vue-cli-service serve`) — the equivalent `wait-on tcp:8081` should gate `pataka`'s backend step the same way, since nothing currently enforces that ordering when run manually |
| Naming | `apps/ahau/package.json` scripts: `dev`, `dev:ui`, `dev:desktop` | Mirrored for `pataka` as `dev`, `dev:ui` (renamed from `serve`), `dev:backend` (renamed from the current `dev`) |
| Root-level scripts | None exist yet — root `package.json` has no `scripts` field | First one added here; kept minimal (2 entries), not a broader root script library |

## Files to Change
| File | Action | Why |
|---|---|---|
| `apps/pataka/package.json` | UPDATE | Add `concurrently` devDependency; rename `dev`→`dev:backend`, `serve`→`dev:ui`; add new `dev` combining both via `concurrently`, gated by `wait-on tcp:8081` |
| `package.json` (root) | UPDATE | Add `scripts.dev:ahau` and `scripts.dev:pataka`, each delegating to `npm run dev --workspace=apps/{name}` |

## Tasks

### Task 1: Restructure `apps/pataka`'s dev scripts to mirror `apps/ahau`'s pattern
- **Action**: In `apps/pataka/package.json`: add `"concurrently": "^9.2.1"` and `"wait-on": "^9.0.5"` to `devDependencies` (matching `ahau`'s exact versions, not a new choice); rename the existing `"dev"` script to `"dev:backend"`; rename the existing `"serve"` script to `"dev:ui"`; add a new `"dev": "concurrently --kill-others --names ui,backend --prefix-colors cyan,green \"npm:dev:ui\" \"npm:dev:backend\""`; change `"dev:backend"` to lead with `wait-on tcp:8081 --timeout 30000 &&` before the existing `electron main.js` invocation
- **Mirror**: `apps/ahau/package.json`'s `dev`/`dev:ui`/`dev:desktop` trio, exactly
- **Validate**: `grep -A1 '"dev"' apps/pataka/package.json` shows the new concurrently-based script; no other script names changed

### Task 2: Add root-level delegator scripts
- **Action**: Add to root `package.json`: `"scripts": { "dev:ahau": "npm run dev --workspace=apps/ahau", "dev:pataka": "npm run dev --workspace=apps/pataka" }`
- **Mirror**: n/a — first root-level scripts field, deliberately minimal (only the 2 this PRD asks for, not a broader command library)
- **Validate**: `npm run dev:ahau` and `npm run dev:pataka` are both listed when running `npm run` from root

### Task 3: Install and verify both commands actually start their dev environments
- **Action**: `mise exec node@20 -- npm install` (picks up pataka's new devDependencies); run `npm run dev:ahau` from root, confirm both `ui` (vite) and `desktop` (electron) start and the desktop window loads the ui without a race-condition failure; kill it; run `npm run dev:pataka` from root, confirm the same for `ui` (vite) and `backend` (electron)
- **Mirror**: n/a — this is the actual acceptance test for the PRD's hypothesis
- **Validate**: Both commands start their full environment from root with no manual `cd` or second terminal; `Ctrl+C` cleanly kills both concurrent processes (via `--kill-others`)

## Validation
```bash
# from repo root, after Tasks 1-2
mise exec node@20 -- npm install
npm run dev:ahau     # confirm ui + desktop both start, desktop window loads ui successfully, then Ctrl+C
npm run dev:pataka   # confirm ui + backend both start, electron window loads ui successfully, then Ctrl+C
```

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| `pataka`'s Electron entrypoint (`main.js`) may not actually read `DEV_SERVER_PORT`/wait correctly once `wait-on` is added — the original scripts were never run concurrently before, so this exact combination is untested | Medium | Task 3 is a real, manual start-and-observe check, not just a script-exists check — a startup failure will surface immediately and visibly |
| Renaming `apps/pataka`'s existing `dev`/`serve` scripts could break a habit or an external reference (e.g. a README, a teammate's muscle memory) | Low | Two-person team, both consulted via this PRD; the new `dev` becoming "the whole thing" matches `ahau`'s existing convention, which is the more consistent outcome, not a surprising one |
| `apps/ahau/ui`'s dev port (3000) and `apps/pataka/ui`'s dev port (8081) are hardcoded assumptions read from each app's own existing scripts, not verified against a running instance | Low | Directly sourced from each `package.json`'s own script definitions, not guessed |

## Execution Notes (post-run)
- **Tasks 1-2 executed as planned**, no surprises: `apps/pataka`'s `dev`/`dev:ui`/`dev:backend` trio mirrors `apps/ahau`'s exactly, root `dev:ahau`/`dev:pataka` delegate via `--workspace`.
- **The known `fix:sass`/hoisting issue from Milestone 4 recurred** on `npm install` (same root cause: `apps/ahau/ui`'s postinstall assumes non-hoisted `node_modules`) — resolved the same way: `--ignore-scripts` install, then manually replay `patch-package` (per-app) and `sass-migrator`.
- **A near-miss from Milestone 4 recurred and was caught again**: replaying `apps/ahau/desktop`'s patches from the repo root hit `packages/ssb-graphql-whakapapa`'s real symlinked source again. This time an attempt to avoid it by passing package names directly to `patch-package` (e.g. `patch-package chloride ssb-ahoy ...`) turned out to be the wrong invocation — that syntax *regenerates* patches from a live diff, not *applies* them, and briefly overwrote `ssb-ahoy`'s patch file (caught immediately via `git diff`, confirmed byte-identical in substance — just git-hash-format and context-line formatting differences from a different diff-tool version — reverted regardless since it wasn't an intended change). Corrected to the right invocation (`--patch-dir`, no package names) and reverted the `typeDefs.js` near-miss the same way as before, re-verified via `git status`.
- **New finding, found and fixed (not merely documented) during Task 3's real verification — a genuine migration-caused regression, distinct from the known hoisting issues**: starting `dev:ahau` failed on a Vite/esbuild syntax error in `edtf`'s `locale-data/index.js` (`import ... with { type: 'json' }`, modern import-assertion syntax). Root-caused precisely: `apps/ahau/ui` declares `edtf: ^4.4.2`; the *original* repo's own (now-deleted) lockfile had it pinned to exactly `4.4.2`; this monorepo's fresh, lockfile-free resolution picked the newest satisfying version instead (`4.11.1`), which introduced the syntax Vite's older config can't parse. **Fixed narrowly**: changed `apps/ahau/ui/package.json`'s `edtf` range from `^4.4.2` to an exact `4.4.2` — a single-file, single-workspace pin, not a root-level `overrides` entry (the earlier `lru-cache` incident already proved that approach's blast radius is unacceptable for this repo). Verified via a sentinel check (`ssb-crut`, still 183+185/183+185) that nothing else shifted.
- **Electron's binary was never downloaded** — a direct, unavoidable consequence of the `--ignore-scripts` workaround (Electron's own `postinstall` normally fetches the actual binary). Fixed by manually running `node node_modules/electron/install.js` once after the ignore-scripts install. This is now a known step for future full reinstalls in this repo, not something to keep discovering fresh each time.
- **Task 3 verification results, both observed directly (not just "script exists")**:
  - **`npm run dev:ahau`**: mechanically fully correct — `ui` compiles and serves on port 3000, `wait-on` correctly gates `desktop`'s launch until `ui` is ready, Electron launches. The **app itself** then crashes at startup on the same broken `@atala/prism-wallet-sdk` dependency already found and documented in Milestone 3 (`ssb-ahau` → `ssb-atala-prism` → the broken SDK) — confirmed pre-existing via that milestone's investigation, not caused by this work, and out of scope to fix here. This is a more severe manifestation of that known issue than Milestone 3 found (it breaks the real running app, not just that plugin's own test suite), worth flagging prominently even though it's not new.
  - **`npm run dev:pataka`**: fully successful end-to-end — `ui` compiles and serves on port 8081, `wait-on` correctly gates `backend`'s launch, Electron launches and the app runs real SSB session code (observed genuine runtime activity: an invite-creation trace, a non-fatal port-forwarding check). No crash.
- **A leftover process from an earlier verification attempt caused a false alarm**: the first `dev:ahau` run logged "Port 3000 is in use, trying another one" — investigated and found it was a stray `vite` process from this session's own prior attempt, not a real port-conflict bug. Killed by PID, confirmed port 3000 was genuinely free before the successful rerun.

## Post-verification finding: Vite doesn't pre-bundle CJS workspace symlinks (found and fixed)
After Task 3's initial verification, the user reported `ahau/ui` failing to load in-browser at all: `Uncaught SyntaxError: The requested module '.../packages/ahau-env/index.js' doesn't provide an export named: 'default'`. Root-caused: Vite's dependency pre-bundler (`optimizeDeps`) synthesizes a `default` export for CommonJS dependencies automatically — but only for packages it treats as real dependencies (flat `node_modules` copies). Packages resolved via a symlink — which is exactly what every migrated `packages/*` workspace package now is — are treated as source code and served through Vite's plain ESM transform instead, which has no CJS interop step. `ahau-env` (`module.exports = function (env) {...}`) and `ahau-graphql-client` (`module.exports = class {...}`) are both plain CJS, both imported via `import X from '...'` default-import syntax in `apps/ahau/ui/src/`, and both hit this exact failure. `ssb-hyper-blobs` (imported via a subpath, `ssb-hyper-blobs/lib/defaults`) is the same category of risk, added preemptively.

**Fix**: added the three package names to `apps/ahau/ui/vite.config.js`'s existing `optimizeDeps.include` array (previously only `['buffer', 'process']`) — this is Vite's own documented mechanism for exactly this situation, not a workaround. Verified directly: `ahau-env.js`/`ahau-graphql-client.js` now appear correctly pre-bundled in `node_modules/.vite/deps/` with proper export synthesis, confirmed via `curl` against a running dev server with no console errors.

This is a **new class of finding**, distinct from every prior npm-hoisting/postinstall issue this session — it's specifically about Vite's browser-side dependency optimizer, not npm's own install/hoisting behavior. Worth checking for in any other Vite-based workspace app (`apps/pataka/ui` uses webpack via `vue-cli-service`, not Vite, so it isn't exposed to this specific failure mode).

## Acceptance
- [x] All tasks complete
- [x] Validation passes — `dev:pataka` fully verified working end-to-end. `dev:ahau` verified mechanically correct (ui + wait-on + electron launch all succeed); the app itself hits the pre-existing, already-documented `@atala/prism-wallet-sdk` crash from Milestone 3, unrelated to and unfixed by this PRD. A separate, real regression (Vite not pre-bundling migrated CJS workspace packages) was found and fixed during post-verification real-world use.
- [x] Patterns mirrored (pataka's script trio matches ahau's naming/structure), not reinvented
