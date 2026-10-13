# Tasks

## 1. Publish the local validation policy

- [x] 1.1 Add concise `CLAUDE.md` guidance requiring `nix develop --command npm run test:sweettest` after implementation and before opening a Holochain-relevant PR, with reruns after relevant pre-PR changes; verify it describes the docs-only exception and maintainer waiver.
- [x] 1.2 Add a root `PULL_REQUEST_TEMPLATE.md` checklist for a local pass, docs-only exemption, or maintainer waiver; verify a waiver entry asks for the maintainer and reason and a passing result is visible to reviewers.

## 2. Update CI behavior and documentation

- [x] 2.1 Gate only the Sweettest workflow step on `workflow_dispatch`; verify `test:zomes` remains in relevant PR and manual runs, Sweettest is skipped for PR events, and `holochain` retains its job name and existing PR condition.
- [x] 2.2 Update README's CI section to explain that relevant PRs run zome tests in Actions, Sweettest is a local PR requirement, and manual dispatch runs both suites; verify it matches the workflow and policy.

## 3. Verify the policy and savings

- [x] 3.1 For the relevant implementation PR, run `nix develop --command npm run test:sweettest` against the final proposed changes before opening it, or have a maintainer record a waiver; verify the PR template records the applicable outcome.
- [ ] 3.2 Verify a relevant PR run keeps `holochain` successful with zome tests executed and Sweettest skipped, then manually dispatch CI on the selected ref and verify Sweettest executes; record whole-job and step-level durations to reconcile the archived warm-run timing discrepancy.
- [x] 3.3 Run `openspec validate remove-sweettest-from-ci --strict` and verify the proposal, capability delta, design, and tasks validate together.
