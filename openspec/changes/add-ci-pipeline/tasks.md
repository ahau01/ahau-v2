# Tasks

**Prerequisite:** `move-prod-build-check-out-of-vitest` (#53) must be merged
first, so `npm run check:app-build` exists for task 1.1. See design.md
decision 5.

See design.md for why each choice below is what it is. The two open
questions there affect only a timeout number and an optional cache, so
neither blocks this list.

## 1. The fast job

- [ ] 1.1 Create `.github/workflows/ci.yml` (the `.github/` directory does
  not exist yet) with `pull_request` and `push` to `main` triggers,
  workflow-level `permissions: contents: read`, the `concurrency` block from
  design.md decision 2, and a `fast` job at `timeout-minutes: 10` running
  `actions/setup-node` with `node-version-file: .nvmrc`, then `npm ci`,
  `npm test`, `npm run check:app`, `npm run check:app-build`. Verify the
  `fast` job runs and passes on a PR from a clean runner.
- [ ] 1.2 Pin every action in the file to a full commit SHA with a `# vX`
  comment, each SHA looked up against that action's repository rather than
  written from memory (design.md decision 12). Verify no `uses:` line in
  `.github/` references a tag or branch.
- [ ] 1.3 Verify the `fast` job installs no Nix and needs none — the job log
  shows no `nix` invocation — which is what makes it a test of the README's
  no-Nix claim.
- [ ] 1.4 Verify the concurrency rule both ways: a second push to the same PR
  cancels the first run, and a push to `main` is not cancelled by a
  subsequent one.

## 2. Supply chain

- [ ] 2.1 Add `.github/dependabot.yml` for the `github-actions` ecosystem
  only, with no npm or cargo entry. Verify GitHub accepts it — the
  repository's Dependabot settings list the `github-actions` ecosystem with
  no configuration error.

## 3. The holochain job

- [ ] 3.1 Add a `holochain` job to the same workflow at
  `timeout-minutes: 30`, with `cachix/install-nix-action` configured per
  design.md decision 8 — `experimental-features = nix-command flakes`,
  Holochain's `extra-substituters` and `extra-trusted-public-keys`, no
  secret. Verify `nix develop --command true` succeeds in the job, proving
  flakes are enabled and the shell evaluates.
- [ ] 3.2 Add `actions/setup-node` with `node-version-file: .nvmrc` **before**
  any `nix develop` step, then `npm ci` (design.md decisions 3 and 4).
  Verify `nix develop --command node --version` reports the `.nvmrc` version,
  confirming the Holonix shell inherits Node from `PATH`.
- [ ] 3.3 Add `Swatinem/rust-cache` with a `prefix-key` that includes a hash
  of `flake.lock`, per design.md decision 6. Verify the key changes when
  `flake.lock` changes by inspecting the key the action logs on two runs,
  one with a touched `flake.lock`.
- [ ] 3.4 Add `nix develop --command npm run test:zomes` as its own step.
  Verify it passes and that `rogue_profiles` is among the crates tested,
  since `Cargo.toml`'s workspace covers `dnas/*/test/zomes/*`.
- [ ] 3.5 Add `nix develop --command npm run test:conductor` as its own,
  separate step. Verify it passes, and that a failure in it is reported
  against this step and not the zome step.
- [ ] 3.6 Record free disk space on the runner during the first green run
  (design.md decision 7, given `target/` is 3.1 GB locally). Verify there is
  headroom; if not, add a disk-reclaiming step and note it.

## 4. Docs and norms

- [ ] 4.1 Add a CI section to `README.md` describing both jobs, what runs
  where, and that the `fast` job deliberately runs without Nix. Verify the
  section's description of each job matches `ci.yml` step for step.
- [ ] 4.2 Add the working norm to `CLAUDE.md` — CI runs the conductor tests,
  don't merge red — without softening the existing statement that passing
  tests confirm code works rather than that it is right for this data model
  (design.md, last risk). Verify by re-reading the Working norms section as
  a whole for consistency.

## 5. Proving it catches what it is for

- [ ] 5.1 Open a throwaway PR that deliberately breaks a profile validation
  rule in the `profiles` integrity zome. Verify the `holochain` job turns
  red **at the conductor step**, link the failed run on #36, then close the
  PR without merging. A green run here means the job is not exercising
  validation and the job is wrong, not the test.
- [ ] 5.2 Record the exact check-run names both jobs report, taken from a
  real run rather than assumed from the job ids (design.md decision 10).

## 6. Enforcement

Last, and only once tasks 1–5 are green. See design.md decision 10.

- [ ] 6.1 `GET` ruleset `24758236`, add one `required_status_checks` element
  for the names recorded in 5.2 to its existing `rules` array, and `PUT` the
  modified ruleset back. Do not assemble the body by hand — a `PUT` replaces
  `rules` wholesale and would drop `pull_request`,
  `required_linear_history` and `non_fast_forward`.
- [ ] 6.2 Re-read the ruleset and diff it against the pre-change copy.
  Verify the only difference is the added rule, and that `deletion`,
  `non_fast_forward`, `creation`, `update`, `required_linear_history` and
  `pull_request` are all still present with their previous parameters.
- [ ] 6.3 Verify a PR with a failing check is blocked from merging for a
  non-bypass actor, and confirm the owner's `exempt` bypass still permits an
  override. Both are the intended behaviour — see proposal.md, On
  enforcement and the bypass.
- [ ] 6.4 Reword #37's acceptance criterion "a PR with a failing check can't
  be merged" on the issue to state what is actually enforced and for whom,
  then close #35, #36 and #37. Verify #34 shows all three sub-issues
  complete.

## Workflow follow-up

- Archive the change once the project's review requirements are satisfied,
  then verify the archived result.
