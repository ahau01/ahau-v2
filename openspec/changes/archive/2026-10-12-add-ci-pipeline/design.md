# Design

## Context

PR #81's latest workflow has two jobs, fast and holochain, on every pull_request and push to main. The required check names are fast and holochain. Its first consolidated cold run measured 54m35s for Holochain and 1m02s for fast. The cold Holochain run (#6, attempt 1) comprised 2279s in Test zomes and 855s in serial Sweettest. After rollout, Holochain runs with exact Rust-cache hits took 10m48s (#8) and 15m32s (#9); recent fast jobs took 1m00s–1m15s. Do not substitute the earlier 16m05s Sweettest-only figure, which excluded the expensive zome compile. [Cold run #6, attempt 1](https://github.com/ahau01/ahau-v2/actions/runs/38202857090/attempts/1), [warm runs #8](https://github.com/ahau01/ahau-v2/actions/runs/38207364307) and [#9](https://github.com/ahau01/ahau-v2/actions/runs/38209547189).

The current active main-protection ruleset (24758236) applies to the default branch. Its rules include pull_request, update, strict required status checks for fast and holochain, and the existing review requirements. The ruleset has an owner bypass actor in exempt mode. It currently has no merge_queue rule. The GitHub API integration cannot read the branch-protection endpoint or the organization billing plan. The repository API confirms the repository is private and organization-owned. PR #81's description says the organization is on Team, but that statement is context only, not verification of plan capability.

GitHub's current documentation says private repositories need GitHub Enterprise Cloud for merge queues. Verify the actual organization plan with an administrator before deciding that merge queue is available. GitHub also rounds each private GitHub-hosted job's billable duration up to the next minute. On that basis, the measured cold Holochain job is approximately 55 billable minutes, and fast is approximately 2 billable minutes. Estimates below use these rounded cold-run figures; cache-warm savings may differ.

References:
- [GitHub merge queue availability](https://docs.github.com/en/pull-requests/concepts/deploying-code#enforcing-requirements-at-scale)
- [Required checks, skipped jobs, and merge_group](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks)
- [Actions job execution time and rounding](https://docs.github.com/en/actions/how-tos/monitor-workflows/view-job-execution-time)
- [setup-node npm cache behavior](https://github.com/actions/setup-node/blob/main/docs/advanced-usage.md#caching-packages-data)

## Goals / Non-Goals

**Goals:**

- Reduce avoidable Actions minutes without reducing required correctness coverage.
- Keep required check names stable and make docs-only skips merge-safe.
- Ensure every relevant ready-PR commit receives fresh Holochain validation.
- Keep an operator path for exceptional direct updates while avoiding routine main-push duplicates.

**Non-Goals:**

- Changing what npm test, check:app, check:app-build, test:zomes, or test:sweettest validate.
- Weakening or removing Sweettest, changing its serial execution, or moving the expensive zome compilation elsewhere.
- Fixing application behavior or unrelated #86 coverage gaps.
- Changing repository settings; verify the existing ruleset and document its owner bypass without modifying it.

## Decisions

### 1. Run fast on PRs and defer Holochain until ready

Trigger the workflow for pull_request opened, reopened, synchronize, and ready_for_review activity. Keep fast unconditional for each PR event. Use the ready_for_review action to start Holochain when a draft becomes ready. Also run Holochain for a PR opened or reopened ready, and for every later synchronize event while the PR is not a draft. Draft PRs cannot merge, so their Holochain job may be conditionally skipped.

A new commit changes the PR head SHA and fires synchronize. The strict required-status rule requires checks on the latest commit, so a previous green result is stale; the workflow must rerun detection and Holochain for relevant changes. If a PR is converted back to draft, GitHub prevents merging while it remains draft. When it becomes ready again, ready_for_review starts a fresh run.

Savings: draft updates avoid a Holochain run worth approximately 55 billable minutes using the measured cold run; skip the detector too while the PR is draft. Fast still costs approximately 2 billable minutes per PR event. Once a PR is ready, relevant commits still run Holochain; this design does not hide that cost.

Adopt now. This reduces work on in-progress drafts while keeping current-commit coverage at merge time.

### 2. Use a job-level detector; keep required check behavior explicit

Do not put paths or paths-ignore on the workflow trigger. GitHub documents that when workflow-level path filtering suppresses a workflow, an associated required check can remain pending and block merging.

Use a small changes job on non-draft pull_request events. It compares the complete PR base-to-head change set and exposes whether Holochain is required. Skip this detector for draft PR events because the expensive job cannot run until the PR is ready. Holochain depends on that output and keeps its job id/name holochain. The changes job is not required by branch rules.

Documentation-only classification is an explicit Markdown-only allowlist: root README*.md, CLAUDE.md, CONTEXT.md, other root-level Markdown files, and Markdown files under docs/**, openspec/**, or .agents/**. Directory membership alone does not make a non-Markdown file documentation. Any file outside that allowlist is relevant by default. In particular, the following always require Holochain: .github/workflows/**, .github/actions/**, .github/dependabot.yml; package.json, package-lock.json, .nvmrc; flake.nix, flake.lock, nix/**, .cargo/**, rust-toolchain*; root or nested Cargo.toml and Cargo.lock; dnas/**; tests/**, test/**, and scripts/**. Any unclassified path is relevant, including src/**. If a docs allowlist path also changes one of these paths, the PR is relevant.

On docs-only PRs, the Holochain job is skipped by a job-level condition. GitHub reports a conditionally skipped job as success, preserving the required holochain check name without launching its runner. The fast job and changes detector still run. The ready docs-only run on temporary PR #89 measured the detector at 5s, which rounds to one billable minute on the private GitHub-hosted runner. Against the 54m35s cold run, a docs-only PR saves about 54 billable minutes; against observed warm runs of 10m48s–15m32s, it saves about 10–15 billable minutes. The detector adds one billable minute to a relevant ready-PR event that still runs Holochain. [Docs-only run #12](https://github.com/ahau01/ahau-v2/actions/runs/38212252869).

Fail closed: if detection fails or produces no trustworthy result, a ready PR must run Holochain. Use an always()-aware dependency condition with this logic: run for workflow_dispatch, or for a non-draft PR when the detector failed or reported a relevant path. This prevents a failed changes job from causing the required holochain job to be skipped through normal needs behavior. Test this explicitly. Treat an unavailable diff, API error, or unknown event shape as relevant.

Adopt now. The explicit docs allowlist makes false skips narrow; the conservative default makes uncertain paths pay the test cost.

### 3. Remove automatic push-to-main runs; retain manual exception handling

The active ruleset requires updates through a pull request and requires fast and holochain with strict status freshness for ordinary actors. Remove push to main from the normal workflow triggers, avoiding a second full run after a PR merge. At measured cold duration, this avoids approximately 57 billable minutes per merge (55 Holochain plus 2 fast), subject to cache state.

The ruleset also grants the owner an exempt bypass. Therefore direct updates remain possible for that actor. Keep workflow_dispatch enabled and document that an exceptional direct update must be validated by manually dispatching CI against the updated main ref. workflow_dispatch runs fast and Holochain without PR path filtering. This is an operator obligation; the ruleset cannot guarantee it for an exempt actor.

Adopt now, conditional on retaining the verified ruleset requirement for ordinary updates and documenting the bypass procedure. If repository policy later removes the bypass, the manual path can remain as an operational tool.

### 4. Merge queue / merge_group: defer pending plan verification

A merge queue could defer Holochain until GitHub creates a merge candidate, but the active ruleset currently has no merge_queue rule. GitHub documents merge queues for private repositories as an Enterprise Cloud feature. The private repository plan is not independently verified here, and the API integration cannot inspect billing settings.

Cost comparison: if a queue candidate replaces a ready-PR Holochain run one-for-one, it saves no Holochain minutes for a merged PR: approximately 55 minutes are moved from ready-review to the queue candidate. It can save runs for PRs abandoned before queue entry, but queue candidate rebuilds caused by base or queue changes can add approximately 55 minutes each. A merge queue is not a free minutes optimization and adds repository configuration and check-trigger complexity.

If an administrator verifies GitHub Enterprise Cloud and elects to use a merge queue for its integration guarantees, add merge_group with types: checks_requested, run Holochain on every candidate, and verify that the existing required check context holochain is reported for the merge-group SHA. Keep fast on pull_request. Do not rely on the PR check alone: GitHub requires the workflow to include merge_group for required checks to be reported to the queue. Account for candidate retries. Otherwise, retain the ready-for-review design above.

Decision: defer. Do not claim queue support or change merge rules until plan and settings are verified.

### 5. setup-node npm caching: defer pending measurement

The initial fast job took 1m02s; two later runs took 1m00s and 1m14s, and the docs-only run took 1m15s. Their `npm ci` steps took 4–5s. No npm dependency-cache restore or save occurred: `package.json` has no `packageManager` or `devEngines.packageManager` declaration, and the run logs show no npm cache operation. Restore/save time is not applicable in the current workflow. No cached-run evidence shows a net saving, so keep setup-node npm caching deferred; it would need repeated cached and uncached end-to-end measurements before adoption.

Defer. If later measured, compare uncached and cached npm ci plus full job duration across repeated runs and include cache storage and save/restore overhead. Adopt only if the end-to-end savings are repeatable; otherwise leave it out.

### 6. Preserve checks, caches, serial execution, and pins

Keep the existing fast commands unchanged. Keep both test:zomes and test:sweettest in the Holochain job, retain the Rust cache prefix tied to flake.lock and cache-on-failure, retain Nix and Holochain Cachix setup, and keep Sweettest serial. Pin every third-party action to a full commit SHA with its version comment. Do not move or remove checks to improve the time estimate.

## Risks / Trade-offs

- A skipped conditional job is success for a required status check → keep the workflow trigger broad, keep the holochain job id stable, and test docs-only behavior on GitHub. Workflow-level path filtering is prohibited for this required check.
- A detector failure could indirectly skip a dependent job → use an always()-aware job condition and fail closed by running Holochain; verify with an injected detector failure.
- A broad docs allowlist could misclassify a behavior-bearing file → allowlist only known documentation roots; every other path triggers Holochain.
- A new commit could appear green because of an earlier run → assert that check results belong to the latest head SHA; strict status checks are enabled in the current ruleset.
- Owner bypass can avoid both checks or manual dispatch → document that bypassed direct updates require workflow_dispatch.
- Removing push triggers means accidental direct updates do not automatically run CI → the ruleset protects ordinary actors; keep and document manual dispatch for the exempt owner.
- Merge queue may be unavailable on the current private-repository plan and may add candidate reruns → defer until an administrator confirms Enterprise Cloud and settings.
- npm cache might add work without saving time → defer until full-job measurements show a repeatable net benefit.

PR #87 already demonstrated that a wasm-only validation regression passes Test zomes and fails in serial Sweettest at the expected assertion. Keep those steps unchanged and retain that run as evidence; this trigger-only change does not need another deliberately broken validation probe.

## Migration Plan

1. Implement the PR event set, detector, fail-closed job condition, main trigger removal, and workflow_dispatch.
2. Preserve check names and all test steps, cache configuration, and action pins.
3. Update README.md to match the resulting triggers and exceptions.
4. Verify docs-only, relevant-code, detector-failure, new-commit, and manual-dispatch cases on GitHub before considering the change complete.
5. Re-read ruleset 24758236. Do not edit it for this plan unless the required names or queue adoption decision changes.

Rollback by restoring the prior triggers and removing the detector condition; do not remove required status checks as a rollback shortcut.

## Open Questions

- An administrator must verify whether ahau01's current plan includes GitHub Enterprise Cloud and whether the organization wants merge queue. Until answered, the merge queue stays deferred and the ready-for-review fallback is the plan.
