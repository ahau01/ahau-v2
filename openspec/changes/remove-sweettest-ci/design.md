# Design

## Context

See proposal.md for motivation. The `holochain` CI job runs zome tests and SweetTest inside the pinned Nix environment. `package.json` exposes SweetTest locally through `npm run test:sweettest`. The `continuous-integration` spec records the workflow behavior; the README's CI section is removed to avoid maintaining a second description.

## Goals / Non-Goals

**Goals:**

- Keep the required zome validation in CI while removing SweetTest execution from automated runs.
- Keep the SweetTest script available to developers inside `nix develop`.
- Retain existing CI triggers, change detection, fail-closed behavior, and required check names.
- Set the `holochain` job timeout to 60 minutes after removing the SweetTest runtime.

**Non-Goals:**

- Change what `test:zomes` or `test:sweettest` validate.
- Change the CI trigger set, path classification, manual dispatch behavior, or repository ruleset.
- Add a separate SweetTest CI job or remove the local test command.

## Decisions

### Keep zome tests in the existing Holochain job

Remove only the SweetTest workflow step and the obsolete cache comment that refers to the former SweetTest job. Keep `test:zomes` in the required `holochain` job, along with its existing Nix environment and cache setup. A separate SweetTest job would still run the suite in CI, contrary to the local-only requirement.

### Keep SweetTest's package command for local runs

Leave `npm run test:sweettest` in `package.json` and in the README's useful checks list. It remains the direct local entry point inside `nix develop`; no alternate script or wrapper is needed.

### Use the capability spec as the CI behavior documentation

Remove the README's `## CI` section. The `continuous-integration` capability spec is the durable description of triggers, check selection, required check names, manual dispatch, and the SweetTest boundary. Keeping a second prose account in the README would create two sources that can drift.

### Reduce the Holochain job timeout to 60 minutes

The current cold zome test run is about 38 minutes, excluding setup. With SweetTest removed, a 60-minute timeout preserves about 20 minutes of margin while avoiding the former 90-minute allowance. Keep the existing timeout if future measurements show the remaining Holochain job regularly needs more time; the timeout does not change which checks run.

## Risks / Trade-offs

- SweetTest regressions will no longer be detected by CI → Keep the local command documented and retain its serial execution behavior.
- The 60-minute timeout may be too short if Holochain build or setup time grows → Monitor job duration and raise the timeout if the remaining job approaches the limit.

## Migration Plan

Remove the SweetTest step and stale cache comment, set the `holochain` timeout to 60 minutes, and remove the README CI section. Keep the local command in the useful checks table. No data migration is required. To restore automated SweetTest coverage, restore the workflow step and revise the capability spec and README guidance together.
