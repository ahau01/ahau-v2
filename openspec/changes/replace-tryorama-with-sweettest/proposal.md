# Proposal

## Why

This test-infrastructure change exercises profile authorship and private personal information, bearing on kaupapa rule 4: identity is the agent key, not session auth. The repo's 16 real-conductor validation scenarios currently use Tryorama serially, which has made the test run costly; Holochain recommends Sweettest for the pinned 0.6 line, so the repo can keep real-conductor zome coverage without retaining Tryorama.

## What Changes

- Replace the 16 zome-validation scenarios in `src/profile/validation.conductor.ts` with Rust Sweettest coverage, preserving the zome-side authorization, privacy, validation, update and deletion guarantees.
- Run these tests in parallel with isolated conductor/agent state through a separate `npm run test:sweettest` command and a dedicated CI job. Record old and new runtimes without making a specific speed threshold an acceptance gate.
- Remove the Tryorama dependency and the current TypeScript conductor suites from the active test command. Keep the existing fast TypeScript and Rust unit tests.
- Keep the Holochain dependency line pinned to 0.6.3.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This changes test infrastructure, not runtime behavior; `.openspec.yaml` sets `skip_specs: true`.

## Impact

Rust test dependencies and profile coordinator test layout; npm scripts and lockfile; the existing TypeScript conductor test files; CI and README test instructions. The Holochain version remains unchanged.

## Flagged, not done

- Design a separate TypeScript integration suite for the real `AppWebsocket` connection, profile round-trips/defaults, TypeScript-to-Rust value/message parity, and first-launch wiring. These checks are deferred from this change along with the current real-conductor client and first-launch tests.
