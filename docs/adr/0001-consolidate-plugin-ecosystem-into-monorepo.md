# ADR-0001: Consolidate Āhau plugin ecosystem into a single monorepo

**Date**: 2026-08-19
**Status**: proposed
**Deciders**: taiao.kawiti.wbhs@gmail.com

## Context

The Āhau ecosystem is currently spread across 61 separately versioned/published repos (per `ahau-arch-map`'s dependency analysis). This structure was justified when packages needed independent publishing for external consumers, but that no longer applies now that this is a private fork. The coordination overhead directly blocks fast iteration on experimental work (fluid whakapapa, TRAION exploration, and anything else built on Āhau's plugins), since a single logical change often requires PRs across multiple repos. Development activity is already concentrated in a small subset — `ahau/ahau` alone accounts for 55% of all recorded MRs, and 31% of the 61 repos show zero recorded MR/issue activity — so most of the ecosystem is low-risk to move.

## Decision

Fold shared plugins into `packages/`, with `ahau` and `pataka` as sibling apps in `apps/`, using workspaces so existing `require()` calls don't need to change. Migrate in phases per the existing architecture map (`ahau-arch-map/ARCHITECTURE.md`) — core plumbing first, then domain plugins, then the GraphQL layer — rather than a big-bang migration. Genuine upstream dependencies (`ssb-tribes`, `ssb-blobs`/`ssb-serve-blobs`, `@tangle/*`) stay external as npm deps, not vendored in.

## Alternatives Considered

### Alternative 1: Keep 61 separate repos (status quo)
- **Pros**: independent versioning, clean per-package MR/issue history
- **Cons**: heavy cross-repo coordination for any change touching a plugin and its consumer
- **Why not**: this coordination overhead is exactly the friction blocking experiment work; the original justification (external publishing) no longer applies on a private fork

### Alternative 2: Big-bang single-PR migration
- **Pros**: disruption happens once, done quickly
- **Cons**: high risk, hard to validate incrementally, harder to safely resolve import re-pointing and naming collisions across 61 packages at once
- **Why not**: the existing architecture map supports a safer phased sequence (core → domain plugins → GraphQL)

### Alternative 3: Partial/selective consolidation
- **Pros**: less immediate migration effort
- **Cons**: leaves cross-repo friction for whichever plugins stay split out
- **Why not**: doesn't fully unblock experiment work, which depends on plugins across the whole stack

## Consequences

### Positive
- One PR can change a plugin and its consumer together
- Directly unblocks fluid whakapapa, TRAION, and other experiment work built on Āhau plugins
- Lower ongoing maintenance overhead than 61 separately versioned/published repos
- Existing `require()` calls keep working via workspaces — no import rewrite forced by the move itself

### Negative
- Loses live per-package MR/issue history (archived separately in `ahau-arch-map/results/raw-migration-data/`, low risk)
- Loses independent version pinning per package
- One-time migration effort: import re-pointing, keep/rename/drop decisions per package, resolving the `ssb-atala-prism`/`broken-atala-demo` npm name collision (both repos publish as `ssb-atala-prism`; `ahau/prototypes/broken-atala-demo` has zero recorded activity)

### Risks
- Accidentally vendoring genuine upstream deps (`ssb-tribes`, `ssb-blobs`/`ssb-serve-blobs`, `@tangle/*`) instead of keeping them external — mitigate with an explicit external-deps checklist during migration
- Import-repointing errors across many packages — mitigate via the phased sequence (core plumbing → domain plugins → GraphQL layer) rather than moving everything at once
