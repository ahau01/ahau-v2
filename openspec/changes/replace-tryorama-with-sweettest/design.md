# Design

## Context

See [proposal.md](proposal.md) for the motivation and agreed scope. The current conductor tests are TypeScript files ending in `.conductor.ts`; `test:conductor` builds and packs the app and rogue test hApp, compiles TypeScript, then runs those tests serially. Sixteen tests in `src/profile/validation.conductor.ts` exercise profile zome behavior. The client and first-launch conductor suites exercise the TypeScript `AppWebsocket` path and are explicitly deferred with that path.

The Rust workspace already includes the production profiles coordinator and a test-only rogue profiles coordinator, both using the profiles integrity crate. Holochain and HDK are pinned to 0.6.3. The integrity crate has direct validation unit tests, but these do not execute coordinator calls or prove behavior across agents and the DHT.

## Goals / Non-Goals

**Goals:**

- Execute the coordinator-facing validation scenarios through Sweettest against real Holochain conductors, including rogue calls that bypass the production coordinator.
- Keep each case independent so cases can run concurrently without sharing source chains, agents, or app state.
- Make the Sweettest suite an explicit command and CI job, separate from fast Rust unit tests and the default test command.

**Non-Goals:**

- Recreate TypeScript client, WebSocket, app startup, first-launch, or TypeScript-to-Rust parity coverage in Rust. The proposal tracks these for a future TypeScript integration suite.
- Change profile behavior, integrity rules, Holochain versions, or the existing fast Rust and TypeScript unit-test responsibilities.

## Decisions

### Put Sweettest coverage in the profiles coordinator crate

Add `holochain` as a dev dependency of `dnas/ahau/zomes/coordinator/profiles`, with the test utilities feature required for Sweettest, and place conductor tests in that crate's Rust test modules. This keeps behavior tests next to the coordinator calls they exercise while allowing them to call the compiled zomes as an installed hApp.

The harness should load the test hApp/DNA fixture that includes `rogue_profiles`, and install it for both the owner and adversarial agent. Preserve the shared production-DNA relationship used today: the rogue zome must use the same profiles integrity zome and DNA as the production coordinator. Assert or otherwise verify that fixture relationship so the adversarial tests cannot silently become tests of a different validation implementation.

**Alternative considered:** Put tests in the integrity crate. That is already where pure validation tests belong, but it cannot exercise coordinator behavior, private entry retrieval, or cross-agent DHT visibility. Keep those unit tests in `test:zomes`; use Sweettest for the conductor boundary.

### Translate the 16 cases by the guarantee they prove

Port the validation suite's zome-side guarantees: author-only profile and personal-information changes, private personal-information reads, refusal of unsupported deletion, profile prerequisite and uniqueness rules, valid self-updates, rejection of updates linked to an earlier version, invalid profile field rejection, and Rust gender enum acceptance/rejection. Preserve adversarial calls through `rogue_profiles` for bypass cases and multi-agent DHT synchronization where a result depends on another agent's view.

The existing case about one agent creating a profile “for” another does not test a validation rejection: Holochain signs the action as the caller, so the profile belongs to the caller's agent key. Preserve this identity guarantee with a Rust conductor test that confirms the caller owns the created profile and the other agent has none. Do not recreate client readback assertions merely to match the old test shape.

Do not share a parity data file between Rust and TypeScript. The gender enum test should pin the Rust contract's own accepted and rejected values. TypeScript/Rust equality, client round-trips, defaults and message parity are deferred as agreed.

**Alternative considered:** Keep the TypeScript validation suite while adding equivalent Rust cases. That would retain the Tryorama dependency and two competing sources for the same conductor-level guarantees. The migration removes the TypeScript conductor suites from the active command and keeps only the Rust Sweettest coverage for these guarantees.

### Give every test isolated conductor and agent state

Each Sweettest case creates its own conductor(s), installs its own app(s), and uses fresh agent keys. Multi-agent authorization/privacy cases use the smallest setup that proves the guarantee; DHT-dependent assertions wait for synchronization before reading from the other agent. Tests must not depend on execution order or shared mutable state.

Run the Rust tests concurrently under Cargo's normal test runner. Isolation is the concurrency boundary; do not add shared conductor reuse or serialize the suite to manage shared state.

**Alternative considered:** A single shared conductor or shared app state is cheaper to start but couples uniqueness and update history across cases, makes parallel execution unsafe, and obscures which agent signed a write.

### Separate command and CI execution

Add `npm run test:sweettest` to build the required hApp fixture and invoke the coordinator crate's Sweettest tests through Cargo. Keep `npm run test:zomes` as the fast Rust workspace unit-test command and keep Sweettest out of `npm test`. Remove `test:conductor`, the Tryorama package, and the old TypeScript conductor files from active test execution.

Add a dedicated CI job that provisions the pinned Holochain 0.6.3 toolchain and runs `npm run test:sweettest`. Record before/after runtime in the change or CI summary for comparison, but do not make a speed threshold a pass condition. No CI workflow file is present in this checkout, so implementation should identify the repository's actual CI configuration before adding the job; if CI is configured externally, document the command in the repo's test instructions and wire the job at its owning configuration.

**Alternative considered:** Add Sweettest to `test:zomes` or `npm test`. That would make the default/fast test path start conductors, contrary to the agreed dedicated-job boundary.

## Risks / Trade-offs

- **The rogue fixture may drift from the production DNA** → Build tests from the existing rogue test hApp and verify it shares the production profiles integrity zome/DNA; keep fixture packaging in the explicit Sweettest command.
- **Parallel conductor startup can consume substantial CPU or ports** → Give every case independent state and rely on ephemeral ports/conductor-managed isolation; observe the dedicated job runtime and resource behavior without introducing a speed threshold.
- **Sweettest APIs or fixture packaging may differ from assumptions for Holochain 0.6.3** → Use APIs and feature flags from the pinned 0.6.3 toolchain, and keep this version unchanged.
- **Removing client and first-launch real-conductor tests temporarily reduces integration coverage** → Keep their deferred scope explicit in the proposal's “Flagged, not done” section so a later change can restore real `AppWebsocket` integration coverage.
- **Runtime comparison can be noisy across machines** → Record environment and command for both measurements; treat timing as observational, not as an acceptance gate.

## Migration Plan

1. Add Sweettest dev dependencies and conductor tests while retaining the old TypeScript suite during development.
2. Map and review all 16 existing validation scenarios against Rust tests, preserving the zome-side guarantees and the adversarial fixture setup.
3. Add `test:sweettest`, run the suite with parallel cases, and record baseline and new runtimes in comparable environments.
4. Add the dedicated CI job and update README test instructions.
5. Remove Tryorama, `test:conductor`, and the three TypeScript conductor suites; regenerate the npm lockfile and verify the fast test commands still work.

Rollback is to revert the change as a unit, restoring the Tryorama dependency, conductor command, and TypeScript conductor files. The production zome behavior is unchanged, so no data migration is required.
