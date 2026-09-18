# Handoff: PR #3, #6, #7 (group creation + ssb-db2 migration)

Written 2026-09-17 to hand this work off from an ECC-based session to a fresh
agent workflow. All three PRs are **open drafts** on GitHub, no CI configured
(`statusCheckRollup` empty on all three), no review decision yet.

Read `/CLAUDE.md` first — this work sits squarely in the "high-risk areas"
(sync/conflict resolution, relationship storage) it describes. Rules 1–3 in
particular (no canonical relationship data, assertions not edges, no central
authority) apply directly to Milestone 3 below.

---

## Repo state

- Branch stack: `master` → `ahau-65-enable-group-creation` (PR #3, independent)
  and `master` → `ahau-db2-migration` (PR #6) → `ahau-db2-migration-milestone-2`
  (PR #7, stacked on #6).
- PR #6 must land before PR #7 — #7's base branch is `ahau-db2-migration`, not
  `master`.
- PR #3 is independent of #6/#7 but its own Milestone 3 (remove group member)
  is *blocked by* the db2 migration — that's why #6/#7 exist at all.
- Governing docs: `.claude/prds/enable-group-creation.prd.md`,
  `.claude/plans/enable-group-creation*.plan.md`,
  `.claude/prds/apps-ahau-db2-migration.prd.md`,
  `.claude/plans/apps-ahau-db2-migration-milestone-1.plan.md`,
  `.claude/plans/start-on-milestone-2-swift-squid.md`.

---

## PR #3 — Enable group creation
`ahau-65-enable-group-creation` → `master` | draft | label: `blocked`
https://github.com/ahau01/ahau-monorepo/pull/3

Re-enables a group-creation feature that was built in 2021 and shipped
disabled behind a "coming soon" tooltip.

**Done (Milestones 1, 2, 4):**
- Re-enabled the "Add Group" button; fixed `loadSubGroups()` never being
  defined, so the group list silently never refreshed after create/update/
  delete.
- Added `addGroupMembers` GraphQL mutation (wraps `ssb.tribes.invite` +
  `listGroupAuthors`); fixed `SubGroup.vue`'s member list, which was reading
  fields (`profile.kaitiaki`/`profile.members`) that don't exist on the
  `Community` type; wired up a working `MembersPicker`.
- Added console logging on group create/update/delete; added tests for
  add-member and `saveCommunity` (covers create/update/delete).
- Side-fix, not app code: `apps/ahau/ui/test-alias-loader.mjs` — the tape
  suite was silently reporting `total:0` whenever a test touched a module
  imported via the `@/` Vite alias (plain Node ESM can't resolve it). Fixed
  at the test-loader level only; documented in
  `docs/learnings/ui-tape-tests-and-vite-aliases.md`.

**Not done — Milestone 3 (remove group member), why it's `blocked`:**
`ssb.tribes.excludeMembers` doesn't exist in `ssb-tribes@3.1.3`, which is what
`apps/ahau/desktop` and `apps/ahau/mobile` actually have installed. It only
exists in `ssb-tribes@^4.0.0+`. That version needs `ssb-db2`/`ssb-box2`, not
just a version bump — hence PRs #6 and #7. Full analysis, including the
recovered 2024 GitLab MR (`!953`) that attempted this migration and stalled,
is in `.claude/plans/enable-group-creation-milestone-3.plan.md` and
`docs/learnings/apps-ahau-db2-migration-mr953.md`.

**Test status:** backend 68/68 (`ssb-graphql-tribes`), frontend 829/829
(`apps/ahau/ui`), lint passes. **Not done:** manual click-through in the
running app — `dev:ahau` currently crashes on startup for an unrelated
`ssb-atala-prism` reason (noted in repo setup notes; also see PR #6/#7 which
fix this exact crash on their branch).

**Next agent should:** treat Milestone 3 as not-startable until #6 (and
ideally #7) merge. Don't attempt to reintroduce remove-member on ssb-tribes v3
— that path is a dead end, already investigated.

---

## PR #6 — db2 migration Milestone 1 (plugin/config swap)
`ahau-db2-migration` → `master` | draft
https://github.com/ahau01/ahau-monorepo/pull/6

Replaces the desktop app's SSB backend from `ssb-db` (v1) to `ssb-db2` (v2).
**Scope: desktop app only** — mobile and the Pātaka server are untouched.
Grounded in the recovered GitLab MR `!953`, which was verified against
current code rather than copied — several of its proposed changes were
outdated or wrong (see PR body for the 11-dependency-by-dependency check).

**Done:**
- `ssb.plugins.js` / `ssb.config.js` rewritten for db2 + box2. Two things MR
  `!953` missed, found by reading `ssb-db2` source directly:
  `ssb-db2/migrate` (needed to actually migrate existing v1 data) and
  `ssb-db2/compat/publish` (needed or `ssb-crut`'s `.publish()` throws on
  every domain plugin).
- Removed the deliberate `ssb-friends+4.4.10` patch that crashed the app the
  moment `sbot.db` existed — a tripwire to stop db2 shipping before this
  migration was done. Migration's done now, tripwire removed.
- `ssb-atala-prism` isn't db2-compatible yet. Guarded rather than fixed: it
  now detects missing config and logs + skips instead of crashing
  (`apps/ahau/desktop/atala-prism.js`).
- That guard broke `credentialPresentations` on the group-applications
  screen — GraphQL's default error policy failed the *entire* query on that
  one broken field, so **the whole join-request list could disappear**.
  Fixed in `tribes-application-helpers.mjs` and
  `store/modules/notifications/*` (real bug fix, not cleanup — flagged as
  the most important UI change in the PR).
- Verified indexing/hook code (`ssb.db.reindexEncrypted.hook`) still works
  under db2 empirically, after static reading suggested it might not.
- **Real Electron boot fixes** (added after Milestone 1 was first thought
  "done" — first actual `dev:ahau` boot on a machine with a display caught
  these; sandboxed sessions can't):
  - `main.js`'s `checkAhauRunning()` had a TOCTOU race (opens tribes/keystore
    to probe, closes it, lets two launches proceed). Replaced with
    `app.requestSingleInstanceLock()`.
  - Stale shadow copies of `ssb-tribes@3.1.3` / `ssb-keyring@1.1.1` sitting in
    `apps/ahau/desktop/node_modules` (baked into the committed
    `package-lock.json`) were winning Node's resolution over the bumped
    root-hoisted versions — silently running the old pre-migration API. This
    is the kind of bug that only shows up when you actually boot the app.
  - `ssb-ahau` (this monorepo's own plugin) bumped `^16.4.1` → `^17.0.0`
    (still called the removed `ssb.backlinks` API at the old version).

**Verified:** `npm run dev:ahau` boots clean, no console errors.
`ssb.tribes.excludeMembers` — the actual PRD success metric — is confirmed
callable on the booted sbot. `apps/ahau/ui` 823/823, `ssb-graphql-tribes`
tests passing, all 30 plugin modules `require()` cleanly under Node.

**Still open per the PR's own checklist:**
- Confirm group members can actually be *removed* end-to-end (not just that
  the API is callable).
- Migration tested against a real account with existing data (only a
  synthetic seeded log has been tested — see PR #7).
- Confirm `dangerouslyKillFlumeWhenMigrated` doesn't delete data before it's
  verified copied — **this is exactly what PR #7 builds a safety net for.**
- Two-devices-offline-then-reconnect data-loss check — not yet run. Per
  `CLAUDE.md`, this is not optional polish; it's the load-bearing test for
  this kind of change.

**Next agent should:** not treat "boots clean" as "safe to ship." The
destructive-delete and multi-device paths are unverified. Read PR #7 before
touching anything migration-related — it's the safety net for exactly the
biggest risk in this PR (`dangerouslyKillFlumeWhenMigrated`).

---

## PR #7 — db2 migration Milestone 2 (verification harness + safety net)
`ahau-db2-migration-milestone-2` → `ahau-db2-migration` (**not** `master`) |
draft | explicitly "not ready to merge, stacked on #6"
https://github.com/ahau01/ahau-monorepo/pull/7

**Done:**
- `migration-guard.js` (new): backs up `flume/` before migration runs, then
  independently counts messages in the backup vs. the new db2 log once
  `sbot.db2migrate.synchronized` fires true, and flags a stall via timeout.
  This exists because `ssb-db2`'s own `automigrate` deletes the entire
  pre-migration `flume/` directory unconditionally with **no count/hash
  check, no backup, and no durability guarantee** — confirmed by reading
  `node_modules/ssb-db2/migrate.js` directly. Backups are never
  auto-cleaned — deliberate, documented, not an oversight.
- Migration test harness (`scripts/db2-migration-verify/`,
  `scripts/verify-migration.js`, `scripts/migrate-once.js`): boots a
  disposable, isolated v1 testbot pinned to real pre-migration versions
  (`ssb-db@20.4.1`, `ssb-tribes@3.1.3`, etc.), publishes a realistic batch of
  messages **including a deliberately contested relationship** (two
  co-existing assertions for the same `{parent, child}` pair — exercising
  this repo's no-canonical-relationship-data model per `CLAUDE.md` rule 1/2),
  then runs it through real migration-guard logic: dry run, real destructive
  run, and an interrupt/resume test that SIGKILLs mid-copy to simulate a
  crash.
- Separate bug fix found while building the harness: `ssb.plugins.js` loaded
  `ssb-box2` but never `ssb-box` (the box1 decryption-compat plugin) — older
  non-group private messages would have become **unreadable** after
  migrating to db2. Fixed by loading `ssb-box` too.
- Found and root-caused a test-harness bug (not a production bug): the
  verification scripts booted testbots without `noDefaultUse: true`, so
  `scuttle-testbot` silently prepended its own bundled `ssb-db2`, which
  nested a stale `ssb-box2@3.0.1` that won the plugin-name race over the
  real root-hoisted `ssb-box2@7.5.0`. That stale version could never recover
  the pre-migration group key, which is what made content look permanently
  undecryptable in earlier testing. **Production boots via `ssb-ahoy`
  directly, never through `scuttle-testbot`, so real users were never
  affected** — but this cost significant investigation time before being
  correctly identified as a harness bug.

**Results as of last commit:**
- Message-count integrity: passes in both dry-run and real (destructive)
  migration.
- Interrupt/resume: reaches correct final state but exposed a likely
  off-by-one in `ssb-db2/migrate.js`'s own resume logic (one duplicate
  message on resume). Non-blocking — `migration-guard.js`'s count check
  catches it — but not fixed upstream.
- **New, untriaged risk (Finding #3, not yet fixed):** fixing the harness's
  stale-box2 bug exposed a real crash in `ssb-box2`'s `decrypt()` — it isn't
  gated on keyring readiness the way its sibling methods are. Reproduces
  only on a *resumed* migration (kill mid-copy, then restart). Production
  uses the identical `ssb-box2` version/config as the harness, so **this is
  flagged as a genuine production risk, not a harness artifact.** PR stays
  in draft specifically because of this.

**Before this can leave draft (per the PR's own checklist):**
1. Triage and fix (or explicitly accept) the `ssb-box2.decrypt()` crash on
   resumed migration (Finding #3).
2. Re-run `node apps/ahau/desktop/scripts/verify-migration.js`.
3. Confirm migrated content matches the original byte-for-byte in the
   resume-after-crash case, not just the clean-run case.

**Next agent should:** start here — Finding #3 is the single open blocking
item across all three PRs. Read `.claude/plans/start-on-milestone-2-swift-squid.md`
and the "Milestone 2 Findings" section of
`.claude/prds/apps-ahau-db2-migration.prd.md` for the full trace before
touching `ssb-box2` or the guard.

---

## Cross-cutting open items (apply across all three)

- **Two-device offline-then-sync test is missing everywhere.** Every PR's
  own checklist calls this out as untested. Per `CLAUDE.md`, this is the
  actual bar for "correct," not passing unit tests — do not treat green CI
  or a clean single-device boot as sign-off.
- **`dangerouslyKillFlumeWhenMigrated`** is real and unconditional deletion
  of local pre-migration data once migration completes. `migration-guard.js`
  (PR #7) is the only thing standing between that config flag and silent
  data loss on an interrupted/buggy migration — and it currently has one
  known unresolved crash path feeding into it (Finding #3).
- **Merge order matters**: #6 → #7 → (unblocks) → #3's Milestone 3. Don't
  parallelize Milestone 3 work against `master` while #6/#7 are still open;
  it'll be based on the pre-migration API.
- Nothing here has a CI pipeline attached yet (`statusCheckRollup` is empty
  on all three PRs) — test results quoted above are all from local runs
  pasted into PR bodies, not from an automated gate.
