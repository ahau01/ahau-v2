# Spec Delta

## Purpose

Defines the Sweettest validation and waiver expectations for pull requests that change Holochain-relevant files.

## ADDED Requirements

### Requirement: Sweettest passes locally before a relevant pull request
For a pull request whose changed files require Holochain validation, Sweettest SHALL pass locally against the proposed changes after implementation and before the pull request is opened, unless a maintainer records a waiver.

#### Scenario: Relevant pull request has a passing local Sweettest result
- **WHEN** a contributor prepares a pull request containing a Holochain-relevant change
- **THEN** Sweettest has passed locally against the proposed changes after implementation and before the pull request is opened

#### Scenario: Documentation-only pull request skips Sweettest
- **WHEN** all changed files are documentation-only under the CI change detector
- **THEN** no local Sweettest result is required

#### Scenario: Maintainer waives the local run
- **WHEN** Sweettest has not passed locally for a Holochain-relevant pull request
- **AND** a maintainer records a waiver on the pull request
- **THEN** the pull request may proceed without a passing local Sweettest result

### Requirement: Pull request shows Sweettest outcome to reviewers
The pull request SHALL show whether Sweettest passed locally or was waived; a waiver SHALL identify the maintainer and include a reason.

#### Scenario: Passing result is visible
- **WHEN** Sweettest passes locally for a Holochain-relevant pull request
- **THEN** the pull request records that it passed

#### Scenario: Waiver is visible with its basis
- **WHEN** a maintainer waives Sweettest for a Holochain-relevant pull request
- **THEN** the pull request records the maintainer and the reason for the waiver
