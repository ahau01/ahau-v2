# Proposal

## Why

Sweettest runs in the required Holochain job for every relevant ready pull request, adding substantial Actions runtime even though it can run locally in the pinned Nix environment. Moving routine Sweettest validation to contributors' local workflow should reduce Actions use while keeping the test required for changes that trigger Holochain validation.

## What Changes

- Remove Sweettest from automatic pull request runs while retaining the `holochain` job and its required check name for relevant PRs.
- Keep Sweettest available on manually dispatched Actions runs for exceptional direct updates.
- Require a passing local Sweettest run after implementation and before opening an in-scope PR, unless a maintainer records a waiver; docs-only PRs may skip it.
- Record the ongoing PR validation policy in OpenSpec, add agent guidance to `CLAUDE.md`, and add a PR template checklist item so reviewers can see the result or waiver.
- Update the README CI description to match which tests run automatically and on manual dispatch.
- Keep linting out of scope until there is a concrete problem for it to catch.

## Capabilities

### New Capabilities

- `pull-request-validation`: Local Sweettest validation policy for Holochain-relevant pull requests, including the docs-only exception and maintainer waiver.

### Modified Capabilities

None.

## Impact

- `.github/workflows/ci.yml`: omit Sweettest from pull request runs and preserve it for `workflow_dispatch`.
- `CLAUDE.md`, the README, and a root pull request template: explain and surface the local validation requirement and CI behavior.
- `openspec/specs/pull-request-validation/spec.md`: durable requirement for future relevant PRs.
- Actions savings are bounded by Sweettest's measured cold-run duration of 855 seconds (14m15s); the same run spent 2,279 seconds (37m59s) in zome tests, which remain. The archived 10m48s and 15m32s warm job totals conflict with the 14m15s cold Sweettest step duration, so warm per-run savings are not established and should be measured after rollout.
