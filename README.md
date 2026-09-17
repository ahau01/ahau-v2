# Āhau v2

Backend-agnostic data-access contract for Āhau.

It defines what any backend must provide for the whakapapa application, without depending on a specific protocol.

**Status: Leg 1 complete.**

The repo currently contains:
- A typed contract with 69 operations across 14 domains
- An in-memory reference implementation
- A conformance test suite
- A Svelte app shell using the contract

No Holochain, Nostr, or other protocol adapter exists yet. That is Leg 2.

## Why this exists

The existing Āhau frontend has 77 exported data-access functions. These work, but they are tied to GraphQL over SSB.

This means replacing SSB would require changing the frontend as well.

Milestone 1 catalogued and reviewed all 77 accessors in the `ahau` repository. 68 were kept and are now represented as a typed contract here.

The goal is to give future backends a clear target to implement and test against.

Requirements source: `plans/data-access-triage.json` in the `ahau` repository.

## Setup

Requires Node 20 (`.nvmrc`).

```bash
npm install
npm run typecheck
not settle them.
