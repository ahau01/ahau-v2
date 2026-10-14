# Proposal

## Why

SweetTest integration runs make the required Holochain CI job substantially slower. Keep this integration suite available for local runs while removing its execution from CI.

## What Changes

- Remove the SweetTest invocation and SweetTest-specific cache commentary from the CI workflow; retain the zome tests and the required `holochain` check.
- Remove the README's `CI` section; use the `continuous-integration` spec as the documentation for CI behavior while keeping the local SweetTest command in the useful checks list.
- Keep the `test:sweettest` package script and local command documentation.
- Record the existing CI validation contract, including pull request checks, Holochain change detection, and manual dispatch behavior.

## Capabilities

### New Capabilities

- `continuous-integration`: Defines the stable contract for pull request and manual CI validation, including the boundary between CI checks and local-only SweetTest runs.

### Modified Capabilities

None.

## Impact

- `.github/workflows/ci.yml`: remove SweetTest from automated CI while retaining the rest of the Holochain job.
- `README.md`: remove the redundant CI section and retain the local SweetTest command in the useful checks list.
- `package.json`: no change; the existing `npm run test:sweettest` command remains the local entry point.
- `openspec/specs/continuous-integration/`: add the CI validation behavior contract.
