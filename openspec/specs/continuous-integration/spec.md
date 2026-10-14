# Continuous-Integration Specification

## Purpose

Defines the stable contract for pull request and manual CI validation, including which Holochain integration checks run automatically and which remain available only to local developers.

## Requirements

### Requirement: Fast pull request checks
The CI workflow SHALL run the `fast` checks for pull request open, reopen, update, and ready-for-review events. These checks SHALL cover JavaScript and TypeScript tests, the Svelte app check, and the production app build check.

#### Scenario: Pull request receives fast validation
- **WHEN** a pull request is opened, reopened, updated with a commit, or marked ready for review
- **THEN** the `fast` check runs the JavaScript and TypeScript tests, Svelte check, and production build check

### Requirement: Holochain checks follow changed files
For a non-draft pull request, the CI workflow SHALL run the required `holochain` check when changed files include anything beyond documentation-only Markdown at the repository root or under `docs/`, `openspec/`, or `.agents/`. If change detection fails or cannot verify the complete file list, the workflow SHALL run Holochain validation. A docs-only pull request SHALL report the skipped `holochain` check as successful. Holochain validation SHALL run zome tests and SHALL NOT run SweetTest.

#### Scenario: Relevant pull request receives Holochain validation
- **WHEN** a non-draft pull request includes a non-documentation change
- **THEN** the required `holochain` check runs zome tests without invoking SweetTest

#### Scenario: Documentation-only pull request skips Holochain validation
- **WHEN** all changed files are Markdown files at the repository root or under `docs/`, `openspec/`, or `.agents/`
- **THEN** the `holochain` job is skipped and its required check reports success

#### Scenario: Change detection cannot establish a documentation-only change
- **WHEN** the change detector fails or cannot verify the complete pull request file list
- **THEN** the workflow runs Holochain validation

### Requirement: Required check names remain stable
The workflow SHALL retain the `fast` and `holochain` check names used by the repository's required-check rules for ordinary updates.

#### Scenario: Ordinary pull request reports required checks
- **WHEN** an ordinary pull request is evaluated for merge
- **THEN** the workflow reports the required `fast` and `holochain` check names

### Requirement: Manual CI dispatch validates the selected ref
The CI workflow SHALL support manual dispatch on a selected ref, running both `fast` and `holochain` checks without pull request change detection. The workflow SHALL NOT run automatically on pushes to `main`. Operators SHALL manually dispatch CI after an exceptional update that bypasses the required checks.

#### Scenario: Operator manually validates a ref
- **WHEN** CI is manually dispatched for a selected ref
- **THEN** both `fast` and `holochain` checks run for that ref

#### Scenario: Main receives a direct push
- **WHEN** a commit is pushed directly to `main`
- **THEN** the CI workflow does not start automatically

#### Scenario: Update bypasses required checks
- **WHEN** an exceptional update bypasses the ordinary required checks
- **THEN** an operator manually dispatches CI against the updated ref

### Requirement: SweetTest is local-only
Developers SHALL retain a local command for running the SweetTest integration suite inside the pinned Nix development environment, and automated CI SHALL NOT run that suite.

#### Scenario: Developer runs SweetTest locally
- **WHEN** a developer runs `npm run test:sweettest` inside `nix develop`
- **THEN** the profile SweetTest integration suite runs serially

#### Scenario: CI does not run SweetTest
- **WHEN** CI runs any automated check
- **THEN** it does not invoke the SweetTest integration suite
