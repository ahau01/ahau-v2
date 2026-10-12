# Proposal

Completes the CI design from [#34](https://github.com/ahau01/ahau-v2/issues/34), including [#35](https://github.com/ahau01/ahau-v2/issues/35), [#36](https://github.com/ahau01/ahau-v2/issues/36), and [#37](https://github.com/ahau01/ahau-v2/issues/37).

## Why

PR #81 established required fast and Holochain checks, but both jobs currently run for every pull request and every push to main. The first consolidated cold Holochain run took 54m35s, while fast took 1m02s. Reduce repeated Actions use while keeping all existing fast checks and requiring current Holochain validation for relevant changes before ordinary PR merges.

## What Changes

- Keep fast on every pull request, running npm test, check:app, and check:app-build without Nix.
- Defer Holochain testing until a PR is ready for review. Run it on ready_for_review and on each later commit (synchronize), plus open/reopen events for PRs opened ready. Do not run it for draft PRs.
- Add a lightweight job-level change detector. It must identify documentation-only PRs without workflow-level path filters. Keep the required holochain check name stable; a conditional skip for docs-only changes reports success, not a permanently pending check.
- Remove the automatic push-to-main trigger to avoid paying for tests already required on the PR. Keep workflow_dispatch for exceptional direct updates, running both fast and Holochain checks on the selected ref.
- Preserve Rust/Nix caching, cache-on-failure, serial Sweettest execution, pinned action SHAs, and every current correctness check.
- Evaluate merge_group / merge queue as an alternative, but defer adoption until an administrator verifies the private repository's plan and enables the feature. Use the ready-for-review design if that prerequisite is not met.
- Evaluate setup-node npm caching for fast; defer it unless measured savings exceed its restore/save and cache-storage costs.
- Update README.md to describe the chosen CI behavior and its limits.

## Acceptance Criteria

- A docs-only PR starts fast and the detector, does not start the expensive Holochain job, and reports the required holochain check as successful/skipped.
- Any code, workflow, package, Nix, Cargo, DNA/zome, test, script, or otherwise unclassified change on a ready PR runs Holochain. The required fast and holochain checks must pass for the latest commit before merge.
- A new commit on a ready PR causes fresh detection and, when relevant, a fresh Holochain run. A green result attached to an earlier SHA cannot satisfy the latest-commit requirement.
- A detector failure fails closed by running Holochain for a non-draft PR; it must never turn into a successful skipped required check.
- No automatic duplicate CI run starts on a main push. A workflow_dispatch run can validate an exceptional direct update.
- The existing required check names fast and holochain remain unchanged. Required status checks continue to require the latest commit, and ordinary updates remain PR-gated.
- Rust/Nix caching, serial Sweettest, pinned actions, and the full fast command set remain intact.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This changes CI orchestration, not application behavior.

## Impact

Implementation scope is limited to CI workflow orchestration, the detector needed to select Holochain runs, and README.md. Verify the existing ruleset without changing repository settings. Do not change application behavior or test coverage; the known #86 gender-parity and client-boundary coverage gaps remain separately flagged in design.md.
