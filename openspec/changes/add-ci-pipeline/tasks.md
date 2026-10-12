# Tasks

**Prerequisites, both now merged:** `move-prod-build-check-out-of-vitest`
(#53, `b6ddafb`) for `npm run check:app-build`, and #86 (`c49e3b7`) for
`npm run test:sweettest`. See design.md decisions 5 and 9.

Groups 1, 2 and 6 are complete and verified. Group 7 is the conformance pass
after #86: five previously-verified tasks were proven against Tryorama and no
longer hold, so they are reopened below rather than left ticked against a
pipeline that no longer exists. See design.md — Migration Plan.

## 1. The fast job

- [x] 1.1 Create `.github/workflows/ci.yml` (the `.github/` directory does
  not exist yet) with `pull_request` and `push` to `main` triggers,
  workflow-level `permissions: contents: read`, the `concurrency` block from
  design.md decision 2, and a `fast` job at `timeout-minutes: 10` running
  `actions/setup-node` with `node-version-file: .nvmrc`, then `npm ci`,
  `npm test`, `npm run check:app`, `npm run check:app-build`. Verify the
  `fast` job runs and passes on a PR from a clean runner.
- [x] 1.2 Pin every action in the file to a full commit SHA with a `# vX`
  comment, each SHA looked up against that action's repository rather than
  written from memory (design.md decision 12). Verify no `uses:` line in
  `.github/` references a tag or branch.
- [x] 1.3 Verify the `fast` job installs no Nix and needs none — the job log
  shows no `nix` invocation — which is what makes it a test of the README's
  no-Nix claim.
- [x] 1.4 Verify the concurrency rule both ways: a second push to the same PR
  cancels the first run, and a push to `main` is not cancelled by a
  subsequent one.

## 2. Supply chain

- [x] 2.1 Add `.github/dependabot.yml` for the `github-actions` ecosystem
  only, with no npm or cargo entry. Verify GitHub accepts it — the
  repository's Dependabot settings list the `github-actions` ecosystem with
  no configuration error.

## 3. The holochain job

- [x] 3.1 Add a `holochain` job to the same workflow at
  `timeout-minutes: 60` — raised from 30, because #86's cold Sweettest run
  measured 43m40s and would have timed out — with
  `cachix/install-nix-action` configured per
  design.md decision 8 — `experimental-features = nix-command flakes`,
  Holochain's `extra-substituters` and `extra-trusted-public-keys`, no
  secret. Verify `nix develop --command true` succeeds in the job, proving
  flakes are enabled and the shell evaluates.

  `timeout-minutes` is 60. The `Check Nix development shell` step
  (`nix develop --command true`) passed on run
  [38202857090](https://github.com/ahau01/ahau-v2/actions/runs/38202857090).
- [x] 3.2 Add `actions/setup-node` with `node-version-file: .nvmrc` **before**
  any `nix develop` step, then `npm ci` (design.md decisions 3 and 4).
  Verify `nix develop --command node --version` reports the `.nvmrc` version,
  confirming the Holonix shell inherits Node from `PATH`.
- [x] 3.3 Add `Swatinem/rust-cache` with a `prefix-key` that includes a hash
  of `flake.lock`, per design.md decision 6. Verify the key changes when
  `flake.lock` changes by inspecting the key the action logs on two runs,
  one with a touched `flake.lock`.
- [x] 3.4 Add `nix develop --command npm run test:zomes` as its own step.
  Verify it passes and that `rogue_profiles` is among the crates tested,
  since `Cargo.toml`'s workspace covers `dnas/*/test/zomes/*`. Also record
  its duration: #86 added `holochain`/`test_utils` to the `profiles` crate's
  `dev-dependencies`, which may no longer be cheap (design.md, third risk).
  It was 12s warm under Tryorama.
- [ ] 3.5 Add `nix develop --command npm run test:sweettest` as its own,
  separate step. Verify it passes, and that a failure in it is reported
  against this step and not the zome step.
- [x] 3.6 Record free disk space on the runner during the first green run
  (design.md decision 7, given `target/` is 3.1 GB locally). Verify there is
  headroom; if not, add a disk-reclaiming step and note it.

## 4. Docs and norms

- [x] 4.1 Add a CI section to `README.md` describing both jobs, what runs
  where, and that the `fast` job deliberately runs without Nix. The existing
  section says the `holochain` job runs "the conductor tests against a real
  Holochain conductor"; reword it for the Sweettest step. Verify the
  section's description of each job matches `ci.yml` step for step.

  Rewritten. Checking it step for step turned up that the old wording also
  omitted the `holochain` job's three diagnostic steps (`df -h /`,
  `nix develop --command true`, `nix develop --command node --version`), so
  those are now described too. The section also says plainly that nothing
  named a conductor runs in the job any more and that the name is kept
  because branch protection matches on it — otherwise a reader hits a job
  called `holochain` containing no conductor and no explanation.

  **Beyond what the task asked, flagged for a reviewer to strike:** the
  section had been inserted between `## Setup` and Setup's own
  `### Holochain` subsection, which left the Holochain install instructions
  and the first-launch demo sitting under a heading about CI. It is moved to
  before `## Where to start reading`. This is a defect in this change's own
  diff rather than adjacent cleanup, which is why it was fixed rather than
  only flagged.
- [x] 4.2 Add the working norm to `CLAUDE.md` — don't merge red; CI runs the
  Sweettest cases against a real conductor — without softening the existing
  statement that passing tests confirm code works rather than that it is
  right for this data model (design.md, last risk). The norm currently at
  line 120 says "CI runs the conductor tests", which no longer names anything
  that exists. Verify by re-reading the Working norms section as a whole for
  consistency.

  The norm now names the `holochain` job and the Sweettest cases. The
  adjacent statement that passing tests confirm code works rather than that
  it is right for this data model is untouched; the norm points at it
  instead, so green CI reads as a floor and not as sign-off.

  Found while re-reading, **not fixed, needs an issue**: the High-risk areas
  section still offers "(Tryorama or Sweettest)" as the choice of framework
  for two-devices-offline-then-sync coverage. Tryorama was removed in #86,
  so that is #86's residue rather than this change's, and editing it is
  outside this task.

## 5. Proving it catches what it is for

- [ ] 5.1 Open a throwaway PR that deliberately breaks a profile validation
  rule in the `profiles` integrity zome. Verify the `holochain` job turns
  red **at the Sweettest step**, link the failed run on #36, then close the
  PR without merging. A green run here means the job is not exercising
  validation and the job is wrong, not the test.

  Done once for Tryorama and reopened for Sweettest: PR #83 weakened
  profile-name validation in wasm builds only, `Test zomes` stayed green on
  native compilation, and `Test conductor` failed on
  `a profile with invalid fields is refused, even bypassing the app`
  ([run 38186080248](https://github.com/ahau01/ahau-v2/actions/runs/38186080248)).
  The 16 Sweettest cases carry the same assertions, but "this step goes red
  when validation weakens" is a property of the step, not of the assertions.
  Reuse #83's wasm-only approach: it is what kept the two layers
  distinguishable.
- [x] 5.2 Record the exact check-run names both jobs report, taken from a
  real run rather than assumed from the job ids (design.md decision 10).

## 6. Enforcement

Last, and only once tasks 1–5 are green. See design.md decision 10.

- [x] 6.1 `GET` ruleset `24758236`, add one `required_status_checks` element
  for the names recorded in 5.2 to its existing `rules` array, and `PUT` the
  modified ruleset back. Do not assemble the body by hand — a `PUT` replaces
  `rules` wholesale and would drop `pull_request`,
  `required_linear_history` and `non_fast_forward`.
- [x] 6.2 Re-read the ruleset and diff it against the pre-change copy.
  Verify the only difference is the added rule, and that `deletion`,
  `non_fast_forward`, `creation`, `update`, `required_linear_history` and
  `pull_request` are all still present with their previous parameters.
- [x] 6.3 Verify a PR with a failing check is blocked from merging for a
  non-bypass actor, and confirm the owner's `exempt` bypass still permits an
  override. Both are the intended behaviour — see proposal.md, On
  enforcement and the bypass.
- [x] 6.4 Reword #37's acceptance criterion "a PR with a failing check can't
  be merged" on the issue to state what is actually enforced and for whom,
  then close #35, #36 and #37. Verify #34 shows all three sub-issues
  complete.

## 7. Conforming to #86

Added after #86 merged as `c49e3b7`. Do 7.1 before the reopened tasks above,
since `test:sweettest` does not exist on this branch's base until the rebase.

- [x] 7.1 Rebase `chore/35-ci-pipeline` onto the post-#86 `main`. Expect a
  conflict in `README.md`, which both #86 and task 4.1 edit; resolve by
  keeping #86's content and reapplying the CI section on top. Verify
  `git log origin/main..HEAD` contains only this change's commits, and that
  `npm run test:sweettest` is present in `package.json` afterwards.

  **The predicted conflict did not happen.** The rebase onto `c49e3b7` was
  clean. #86's only `README.md` edit was one table row in the Holochain
  commands table — `test:conductor` → `test:sweettest` — about 30 lines below
  where this change inserted its CI section, so the hunks never overlapped.
  Both verifications pass: `git log origin/main..HEAD` is this change's six
  commits and nothing else, and `test:sweettest` is in `package.json`.
- [x] 7.2 Delete `.github/workflows/sweettest.yml`, folding its job into
  `ci.yml` as the `holochain` job's Sweettest step (design.md decision 9).
  Verify `.github/workflows/` contains only `ci.yml`, and that the deleted
  file's configuration — the flake feature flags, the Cachix substituter and
  key, and `prefix-key: holonix-${{ hashFiles('flake.lock') }}` — is all
  present in `ci.yml`, since #86 reproduced those from this change's design.

  `.github/workflows/` contains only `ci.yml`. All three named items carried
  over, and all four action SHAs were byte-identical between the two files.
  One piece of config the task list did **not** name also carried over:
  `cache-on-failure: true` on `rust-cache`, which #86 added in its own
  commit "ci: allow the cold Sweettest job to seed its cache". It is
  load-bearing precisely because of task 5.1 — the probe deliberately makes
  this job go red, and without the flag a 43-minute cold Nix and cargo build
  is discarded on every red run.
- [x] 7.3 Verify the `holochain` check still reports under that exact name
  after the rebase, so ruleset `24758236` needs no second `PUT`
  (design.md decision 9a). Confirm from a real run on the PR, not from the
  job id in the file.

  Confirmed from the check-runs API on PR #81's head commit `4909b74`, not
  from `ci.yml`: the two check runs report as `fast` and `holochain`. The
  ruleset's `required_status_checks` contexts, read back without modifying
  it, are `fast` and `holochain`. They match, so no second `PUT`. Neither
  job carries a `name:` key, which is what keeps the check-run name equal to
  the job id — adding one would silently break the required check.
- [ ] 7.4 Confirm on the PR that both `fast` and `holochain` report and pass,
  and record the warm `holochain` duration. Expect roughly 16 minutes against
  Tryorama's 9m07s; the point of recording it is that this change makes CI
  slower, and the archived record should say so (design.md, second risk).

## Workflow follow-up

- Merging this change is what finally puts `ci.yml` on `main`. Until then
  the `required_status_checks` rule added in 6.1 requires `fast` and
  `holochain` while `main` has neither, so PRs that do not carry `ci.yml`
  cannot report those checks and need the owner's bypass to merge.
- #86's two coverage gaps — the #54 gender TS/Rust parity regression and the
  15 deleted client-boundary tests — are flagged in proposal.md and are
  deliberately not fixed here. They need issues of their own.
- Archive the change once the project's review requirements are satisfied,
  then verify the archived result.
