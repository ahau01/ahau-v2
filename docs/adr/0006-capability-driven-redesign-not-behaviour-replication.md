# ADR-0006: Redesign around user capabilities rather than replicating the SSB-era app's behaviour

**Date**: 2026-10-03
**Status**: proposed
**Deciders**: taiao.kawiti.wbhs@gmail.com

## Context

Leg 1 derived the contract from the old app's data layer: 77 exported
data-access functions were triaged, 68 kept, and expressed as 69 typed
operations across 14 domains (see `README.md`, `contract-source/`). That
gives the contract a faithful *shape* of the old app — but the old app's
shape is GraphQL-over-SSB's shape. Its operations exist partly because of
what `ssb-db`, `ssb-tribes` and friends could and couldn't do, not purely
because of what whānau need to do.

Two things have since changed the cost of that approach:

1. **ADR-0003 removed the agnosticism proof.** The contract's operation-
   by-operation fidelity was justified by the two-adapter comparison: a
   contract proven backend-agnostic by two independent adapters. With nostr
   dropped, there is one adapter (Holochain). Nothing can now verify the
   contract is agnostic, so the cost of maintaining all 69 operations ahead
   of need is no longer buying that proof.
2. **Replicating SSB-era behaviour constrains the Holochain build.**
   Holochain has its own native model — source chains, capability grants,
   validation rules, DHT links. Porting each SSB action one-to-one forces
   Holochain into SSB's workflow shapes instead of letting each capability
   be designed the way Holochain does it best. That is the same coupling to
   an old protocol's constraints that ADR-0002 set out to escape.

There is also a knowledge constraint. The team is one developer carrying
the project's context plus a junior new to it, at reduced hours (ADR-0003).
Nobody holds complete knowledge of the old app's internals, and
reconstructing it accessor-by-accessor is the most expensive way to recover
what actually matters.

## Decision

Treat `ahau-v2` as a **behaviour-equivalent redesign, not an
implementation-equivalent port**. The spec is what people can do with
Āhau, not how the SSB-era app did it.

Concretely:

- **The spec is a capability inventory** — user-facing statements of the
  form "a kaitiaki can remove a member from a whānau group", recovered from
  the running old app, users/kaitiaki, and existing docs. It replaces the
  accessor triage as the source of truth for scope.
- **The kaupapa principles in `CLAUDE.md` are invariants, not features.**
  No canonical version, relationships as sourced assertions, no central
  authority, key-based identity. These carry over unchanged and are the
  part of the old system that must survive any redesign.
- **The contract becomes an interface, grown by vertical slices.** It
  remains the seam between the Svelte shell and the backend (with the
  in-memory implementation as the test fake), but operations are added,
  reshaped or removed as each capability is built end-to-end on Holochain —
  not maintained ahead of need. Group permissions is the first slice
  (ADR-0003's exit criterion is unchanged).
- **The conformance suite encodes invariants and capabilities**, e.g. "two
  sources can assert conflicting relationships and both survive" — not
  parity with old SSB operations.

## Alternatives Considered

### Alternative 1: Continue the operation-for-operation port (current Leg 1 direction)
- **Pros**: already largely done for the contract; low risk of silently
  dropping an old behaviour; the triage gives a complete, mechanical
  checklist
- **Cons**: carries SSB-shaped workflows into Holochain; maintains 69
  operations before any real backend has tested them; the agnosticism
  proof that justified that fidelity no longer exists (ADR-0003)
- **Why not**: it optimises for fidelity to an architecture the project is
  deliberately leaving, at the cost of fitting the one it's moving to

### Alternative 2: Mechanical rewrite of the old app (e.g. AI-assisted port to Rust)
- **Pros**: fast; the old app acts as an oracle for behaviour
- **Cons**: the problem with the old app was never its language — it was
  its coupling to unmaintained SSB plugins (ADR-0002); a faithful port
  keeps that coupling or needs a new backend anyway. The old app is also
  not a trustworthy spec (9 of 77 accessors were dropped; group creation
  was built in 2021 and never shipped). And the kaupapa-sensitive areas
  (multi-source assertions, permissions, sync) are exactly where
  conventional, AI-generated patterns are wrong for this data model
  (`CLAUDE.md`)
- **Why not**: solves the wrong problem, fastest

### Alternative 3: Freeform redesign with no inventory of the old app
- **Pros**: maximum freedom to design for Holochain; no upfront cataloguing
- **Cons**: high risk of quietly dropping something whānau rely on, with
  nobody on the team holding full knowledge of the old app to notice
- **Why not**: the capability inventory is cheap insurance against exactly
  that, and doubles as onboarding for the junior

## Consequences

### Positive
- Holochain capabilities can be designed natively rather than shaped to
  imitate SSB workflows
- Scope is set by what users do, which is recoverable without deep
  knowledge of the old codebase
- Building the capability inventory is concrete, well-bounded work that
  transfers product knowledge to the junior, reducing the single-person
  knowledge bottleneck
- Contract maintenance cost tracks what's actually built

### Negative
- Supersedes the framing in `docs/prds/ahau-v2-frontend-rebuild.prd.md`
  ("Protocol Adapters and the Agnosticism Proof") and the "contract exists
  so adapters are swappable" framing in `CLAUDE.md`'s Adapter boundaries
  section; both need revising if this ADR is accepted (not done in this
  change)
- Some of Leg 1's 69 operations will turn out to be unnecessary or wrongly
  shaped and will be reworked or removed — sunk cost, accepted
- Partially reverses ADR-0002's "no change to Leg 1/Leg 2 scope follows
  from this ADR". ADR-0002's decision (rewrite rather than keep patching
  SSB) stands; this ADR changes what "rewrite" means

### Risks
- **A capability the old app provided gets dropped unnoticed.** Mitigation:
  the capability inventory is done before deep Holochain work beyond the
  group-permissions slice, and verified against the running old app and,
  where possible, real users/kaitiaki.
- **"Redesign" becomes licence to drift from the kaupapa principles**, e.g.
  a Holochain-native design that's simpler because it keeps a single
  canonical value. Mitigation: those principles are listed above as
  invariants, and the conformance suite asserts them independently of any
  capability.
- **The contract becomes Holochain-shaped.** This is now accepted rather
  than guarded against (see ADR-0003's Risks). Keeping the contract as a
  clean interface still preserves a seam if Holochain's ecosystem ages the
  way SSB's did.
