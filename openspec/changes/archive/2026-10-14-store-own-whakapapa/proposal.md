# Proposal

## Why

The person's own space has a Whakapapa destination, but currently no private storage for their own account of parent-child relationships. This change establishes that data on the author's chain while preserving privacy and the distinction between one person's account and universal truth.

## What Changes

- Add private, chain-local whakapapa storage for name-only relatives and parent-child relationships, with a nonce on each relative to make guesses against published action hashes harder.
- Add atomic creation of a relative and its first relationship, plus a read that returns the author's relatives with their latest names and live relationships.
- Add author-only validation for updates and deletes and require the author's profile to exist before whakapapa entries are created.
- Keep Holochain access behind a `src/whakapapa/` feature client. Leave the Whakapapa page and navigation behavior unchanged.
- Keep entry content validation in the coordinator/domain boundary if the spike confirms private-entry validation cannot inspect content; record the evidence and result in `design.md`.

## Capabilities

### New Capabilities
- `own-whakapapa`: private storage and retrieval of the author's account of relatives and parent-child relationships.

### Modified Capabilities
- None.

## Impact

- Adds integrity and coordinator zomes to `dnas/ahau`, and updates the DNA configuration.
- Adds a feature client in `src/whakapapa/` following `src/profile/` boundaries.
- Adds unit and conductor-backed coverage for source-chain writes, atomicity, author restrictions, and privacy. The conductor proof is local-only because SweetTest is not run in CI.
- Later work to display the tree, rename relatives, link existing relatives, retract relationships, or refine tree layout is out of scope.
