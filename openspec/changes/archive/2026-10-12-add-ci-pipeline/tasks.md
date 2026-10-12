# Tasks

**Scope:** Implement the CI workflow and documentation changes from PR #81 while retaining the existing correctness checks. Do not change application behavior, test coverage, or repository settings as part of this OpenSpec change.

## 1. Specify trigger and protection behavior

- [x] 1.1 Change the normal trigger design to run fast on pull_request opened, reopened, synchronize, and ready_for_review; run Holochain only for non-draft PRs when ready or when a later commit arrives. Verify the event/action matrix includes opening ready, converting draft to ready, reopening, and every new commit.
- [x] 1.2 Remove automatic push-to-main runs and retain workflow_dispatch for exceptional updates. Verify dispatch runs both fast and Holochain on the selected ref without relying on PR path data.
- [x] 1.3 Preserve required check names fast and holochain and the current strict latest-commit requirement. Verify ordinary updates remain PR-gated in ruleset 24758236 and record the owner exempt bypass as an exception requiring manual dispatch.

## 2. Detect Holochain-relevant changes safely

- [x] 2.1 Add a job-level changes detector for non-draft PRs without workflow-level paths or paths-ignore; skip detection for drafts. Define docs-only as root README*.md, CLAUDE.md, CONTEXT.md and other root Markdown, plus Markdown files under docs/**, openspec/**, and .agents/**. Directory membership alone does not exempt non-Markdown files; every other path is relevant by default. Verify workflow, package/lock, Node, Nix, Cargo, DNA/zome, test, and script paths all select Holochain.
- [x] 2.2 Keep the required holochain job conditional on detector output and non-draft status. Verify a docs-only PR starts fast and detection, skips the expensive runner, and reports holochain as successful/skipped under the exact required name.

  Verified with the Markdown-only test PR [#89](https://github.com/ahau01/ahau-v2/pull/89), closed without merging. On its ready-for-review run, `fast` and `changes` succeeded, the `changes` job took 5s, and the check run reported `holochain` as completed/skipped under the required name. [Run #12](https://github.com/ahau01/ahau-v2/actions/runs/38212252869).
- [x] 2.3 Make detector errors fail closed. Verify an unavailable diff, API/error result, or unknown event shape runs Holochain on a ready PR rather than yielding a skipped successful required check.

## 3. Preserve all existing validation

- [x] 3.1 Keep fast's Node setup and npm ci, npm test, npm run check:app, and npm run check:app-build. Verify all four commands remain present and fast remains Nix-free.
- [x] 3.2 Keep Holochain's Nix/Cachix setup, Rust cache keyed with flake.lock and cache-on-failure, test:zomes, and serial test:sweettest. Verify both test steps run for a relevant ready PR and every third-party action remains pinned to a full SHA.
- [x] 3.3 Verify a relevant code change cannot merge unless fast and holochain pass for the latest commit SHA. Push a second commit after a green run and verify the prior holochain result is stale and a fresh run is required.

  Verified on PR #81: run #8 passed on head SHA `46fd7dcc` at 05:29:35 UTC. Commit `36b1ee5f` was pushed afterward; run #9 passed `fast`, `changes`, and `holochain` on that new SHA before the PR merged. The active ruleset 24758236 has strict required status checks. [Run #8](https://github.com/ahau01/ahau-v2/actions/runs/38207364307), [run #9](https://github.com/ahau01/ahau-v2/actions/runs/38209547189).

## 4. Document savings and decisions

- [x] 4.1 Update README.md's CI section to describe PR fast checks, ready/relevant Holochain checks, docs-only behavior, no automatic main rerun, and manual exceptional validation. Verify it matches the workflow after implementation.
- [x] 4.2 Record merge queue as deferred until an administrator verifies private-repository Enterprise Cloud access and enables the feature. If later adopted, require merge_group checks_requested and verify holochain against the merge-group SHA; otherwise keep the ready-for-review fallback.
- [x] 4.3 Measure npm ci and total fast duration before adopting setup-node cache: report install time, cache restore/save time, total job time, and billed-minute effect. Keep caching deferred unless repeated runs show a net end-to-end saving.

  Measured on two successful PR #81 fast runs: run #8 took 60s total with `npm ci` at 4s; run #9 took 74s total with `npm ci` at 5s. Neither run restored or saved an npm dependency cache; `package.json` has no `packageManager` or `devEngines.packageManager` field to activate setup-node's automatic npm cache. Cache restore/save time is therefore not applicable (0s observed). On the private GitHub-hosted runner, the jobs billed 1 and 2 minutes respectively. Keep npm caching deferred: these runs provide an uncached baseline, not repeatable evidence of a net saving from caching. [Run #8](https://github.com/ahau01/ahau-v2/actions/runs/38207364307), [run #9](https://github.com/ahau01/ahau-v2/actions/runs/38209547189).
- [x] 4.4 Confirm estimates against Actions usage after rollout: compare cold and warm Holochain durations, docs-only detector overhead, draft updates avoided, and main push runs removed. Keep 54m35s cold and 1m02s fast as the current measured baseline until replaced by observed results.

  Post-rollout measurements: the cold Holochain job took 54m35s (PR #81 run #6, attempt 1); exact Rust-cache-hit jobs took 10m48s (run #8) and 15m32s (run #9). The fast baseline is now replaced by observed 1m00s–1m15s jobs; the docs-only ready run's detector took 5s. On temporary draft PR #89, its open and draft-synchronize events both skipped `changes` and `holochain`, avoiding two Holochain launches. The merged commit `ab82856` had no CI workflow run; its only run was an unrelated `dynamic` workflow. [Cold run #6, attempt 1](https://github.com/ahau01/ahau-v2/actions/runs/38202857090/attempts/1), [warm runs #8](https://github.com/ahau01/ahau-v2/actions/runs/38207364307) and [#9](https://github.com/ahau01/ahau-v2/actions/runs/38209547189), draft runs [#10](https://github.com/ahau01/ahau-v2/actions/runs/38212016816) and [#11](https://github.com/ahau01/ahau-v2/actions/runs/38212146596), [docs-only run #12](https://github.com/ahau01/ahau-v2/actions/runs/38212252869).

## Workflow follow-up

- Merge queue adoption remains a separate administrator decision; do not change ruleset 24758236 until plan and desired behavior are verified.
- Keep the #86 gender-parity and client-boundary coverage gaps flagged separately. Do not fold test-suite or application changes into this CI cost-saving scope.
- After implementation and verification, run the OpenSpec verification and archive workflow.
