# Design

## Context

See proposal.md for motivation and the `pull-request-validation` delta for the ongoing contributor requirement. The current `holochain` job runs `test:zomes` followed by serial Sweettest for relevant pull requests and for `workflow_dispatch`. The change detector treats root Markdown and Markdown under `docs/`, `openspec/`, and `.agents/` as documentation-only; other paths require Holochain validation. `holochain` remains a required check.

## Goals / Non-Goals

**Goals:**

- Keep the required Holochain job and zome tests for relevant ready PRs.
- Shift routine Sweettest execution from automatic PR Actions runs to contributors' local environment.
- Retain a manual Actions path that runs Sweettest for exceptional direct updates.
- Make the local result or waiver visible to reviewers and keep project documentation consistent.

**Non-Goals:**

- Change Sweettest coverage, test code, or its local command.
- Add linting or another CI job to attest to local test execution.
- Change the existing change detector, required check name, or repository ruleset.

## Decisions

### Run Sweettest on manual dispatch only

Keep `test:zomes` in the Holochain job for pull requests and manual dispatches. Gate only the Sweettest step on `github.event_name == 'workflow_dispatch'`. The PR run therefore continues to report the existing required `holochain` check while validating zomes; a manual run on the selected ref continues to run both test suites.

Alternatives considered:

- Remove Sweettest from every event: saves minutes on exceptional manual runs too, but weakens the existing direct-update validation path.
- Keep Sweettest on every event: preserves current coverage but does not reduce routine PR Actions use.

### Enforce the local requirement through the PR process

Add the durable rule in the `pull-request-validation` spec. Add concise guidance to `CLAUDE.md` to run `nix develop --command npm run test:sweettest` after implementation and before opening a Holochain-relevant PR, and rerun after relevant changes made before opening. Add a root `PULL_REQUEST_TEMPLATE.md` checklist that lets contributors record a passing run, the docs-only exception, or a maintainer waiver with the maintainer's name and reason. Update README's CI section to say that relevant PRs run zome tests in Actions, local Sweettest is required by policy, and manual dispatch runs both.

This is a contributor/reviewer requirement, not a new machine-verifiable GitHub status. The template makes the result visible; reviewers remain responsible for checking it. A maintainer waiver must be recorded on the PR.

Alternatives considered:

- Treat Sweettest as optional guidance: simpler, but fails the agreed requirement for relevant PRs.
- Add an automated job to validate an uploaded local result: adds a new mechanism and does not independently prove the test ran against the proposed changes. No concrete need justifies that machinery now.

### Estimate savings from measured cold-run data; remeasure warm runs

The archived cold job took 54m35s, including 2,279 seconds (37m59s) for zome tests and 855 seconds (14m15s) for Sweettest. Removing the measured Sweettest step would leave about 40m20s of elapsed job time before billing-minute rounding; the archived billing model rounds a private hosted job up, so the estimate is about 55 to 41 billable minutes per relevant cold run. Zome tests remain the larger cost.

The archived exact-cache-hit job totals of 10m48s and 15m32s conflict with the 14m15s Sweettest step recorded for the cold run. Do not infer a warm Sweettest duration or promise the same savings for warm runs. After rollout, compare step-level and whole-job durations on equivalent cache states. Savings accrue only on automatic relevant PR runs; exceptional manual dispatches still run Sweettest.

## Risks / Trade-offs

- A contributor may omit or misstate the local result, and branch protection cannot verify a template entry → Keep the requirement in OpenSpec, put the result/waiver in the PR template, and have reviewers check it for relevant changes.
- A local test result may become stale if relevant changes are made after it passes → Guidance requires rerunning against the final proposed changes before opening the PR.
- Removing Sweettest from PR CI means a passing `holochain` status no longer means Sweettest ran in Actions → Update README and describe the split clearly in the PR template; retain Sweettest on manual dispatch.
- Warm Actions savings are uncertain from current records → Measure the Sweettest step and whole job separately after rollout before updating the estimate.

## Migration Plan

1. Add the `pull-request-validation` requirement, update the workflow step condition, and add CLAUDE.md and PR template guidance.
2. Update README's CI description to match PR and manual-dispatch behavior.
3. Verify the workflow configuration keeps `test:zomes` on relevant PRs, omits Sweettest there, and runs Sweettest on manual dispatch; confirm the `holochain` check name is unchanged.
4. After rollout, record comparable step-level and job-level timings to replace the cold-only savings estimate where evidence supports it.

Rollback by restoring the Sweettest step for pull request events. Keep the local policy and manual-dispatch behavior unless the requirement itself is separately changed in OpenSpec.
