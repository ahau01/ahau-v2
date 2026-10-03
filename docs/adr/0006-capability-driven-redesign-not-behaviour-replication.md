# ADR-0006: Redesign around user capabilities on Holochain; freeze the Leg 1 contract as SSB-era reference

**Date**: 2026-10-03
**Status**: proposed
**Deciders**: taiao.kawiti.wbhs@gmail.com

## Context

Leg 1 derived a backend-agnostic contract from the old app's data layer: 77
exported data-access functions were triaged, 68 kept, and expressed as 69
typed operations across 14 domains, with capability negotiation
(`src/contract/capabilities.ts`), cross-cutting semantics
(`src/contract/semantics.ts`), an in-memory fixture backend
(`src/fixtures/`), and a conformance suite (`src/conformance/`). Its purpose
was to let protocol adapters be swapped, and to prove that by running two
very different adapters (Holochain and nostr) behind it with zero frontend
changes.

Three things have since changed:

1. **ADR-0003 removed the second adapter.** With nostr dropped, Holochain is
   the only backend being built. Swappability can no longer be proven, and
   the machinery that exists to support it — adapter boundaries, capability
   negotiation between backends with different enforcement levels — has
   nothing to negotiate between.
2. **The contract is SSB-shaped.** Its operations are one-to-one with the
   old GraphQL-over-SSB accessors (each is annotated `Source: <accessor>`).
   Building Holochain to satisfy it would carry SSB's workflow shapes into
   Holochain, rather than letting each capability be designed around
   Holochain's own model — source chains, capability grants, validation
   rules, DHT links. That is the same coupling to an old protocol's
   constraints ADR-0002 set out to escape.
3. **Knowledge and capacity are thin.** One developer carries the project's
   context, alongside a junior new to it, at reduced hours (ADR-0003). Nobody
   holds complete knowledge of the old app's internals, and maintaining a
   69-operation abstraction ahead of need competes directly with building.

The contract is still valuable — just not as the thing Holochain is built
against. It is the most complete written record of what the SSB-era app
could do, and its design docs (`docs/contract-decisions.md`,
`docs/contract-friction.md`) capture reasoning about whakapapa data that
holds on any backend.

## Decision

Build `ahau-v2` as a **behaviour-equivalent redesign directly on Holochain**,
not an implementation-equivalent port behind a swappable contract.

1. **The spec is a capability inventory** — user-facing statements such as
   "a kaitiaki can remove a member from a whānau group", recovered from the
   running old app, users/kaitiaki, and existing docs (tracked in #13). Each
   capability is designed the way Holochain does it best.

2. **The Leg 1 contract is frozen as historical reference.** `src/contract/`
   and `contract-source/` stop evolving. They remain in the repo as:
   - a record of the SSB-era app's possible actions, and
   - a verification checklist — cross-checked against the capability
     inventory so nothing the old app did is dropped unnoticed, and used to
     confirm a dev run-through of a rebuilt feature covers what the old one
     did.
   No Holochain code is required to implement or conform to it.

3. **The shell talks to Holochain through thin per-feature client modules**
   (e.g. a `groups` client wrapping that feature's zome calls) — ordinary
   module boundaries, no adapter layer or capability negotiation. They exist
   so the Svelte UI can be developed and tested with a stub client rather
   than a running conductor, not to make Holochain swappable. The shell's
   current `DataAccess` wiring (`src/app/backend.ts`) and the fixture
   backend are replaced feature by feature as each one moves to Holochain.

4. **The kaupapa principles in `CLAUDE.md` are invariants, not features**,
   and carry over unchanged: no canonical version, relationships as sourced
   assertions, no central authority, key-based identity.

5. **Backend-independent reasoning carries forward; backend-negotiation
   machinery does not.** These Leg 1 decisions hold on Holochain and should
   shape its design:
   - removal is retraction, never erasure (`contract-decisions.md` §1)
   - a permission is either enforced or it isn't, and the UI must never
     present an unenforced rule as a lock
   - graph traversal happens in the backend, not the frontend (§4)
   - approving a proposal states what it applied

   Capability declarations, `enforced`/`advisory`/`unsupported` negotiation,
   and `partial` write acknowledgements exist to cope with backend
   differences and are not carried forward.

6. **Kaupapa tests move to Holochain.** Conformance cases that assert an
   invariant rather than an SSB operation shape — e.g.
   `semantics/retraction-hides-without-erasing`,
   `semantics/visibility-excludes-non-members` — are rewritten as Holochain
   tests (Tryorama or Sweettest) against a real conductor. **There is
   currently no test asserting that two sources can hold conflicting
   relationship assertions and both survive**; that test is new work and
   belongs in the first slice touching relationship data. The deferred
   two-devices-offline-then-sync validation (ADR-0003) lands in the same
   place.

Group permissions remains the first vertical slice; ADR-0003's exit
criterion is unchanged.

## Alternatives Considered

### Alternative 1: Keep the contract as the shell–backend interface and grow it by vertical slices
- **Pros**: keeps a formal seam and the conformance suite live; Holochain
  revisions to the contract stay visible and reviewable
- **Cons**: retains swappable-adapter machinery with only one adapter to
  use it; every Holochain-native design has to be translated back into a
  contract that started SSB-shaped
- **Why not**: this was this ADR's first draft. It still optimises for a
  swappability nothing will exercise, at the cost of the capacity needed to
  build. Thin per-feature clients keep the testability benefit without the
  abstraction

### Alternative 2: Continue the operation-for-operation port (Leg 1 direction as originally planned)
- **Pros**: contract already largely done; the triage gives a complete,
  mechanical checklist; low risk of dropping an old behaviour
- **Cons**: carries SSB-shaped workflows into Holochain; maintains 69
  operations before any real backend has tested them
- **Why not**: optimises for fidelity to an architecture the project is
  deliberately leaving. The checklist benefit is kept by freezing the
  contract as reference rather than building against it

### Alternative 3: Mechanical rewrite of the old app (e.g. AI-assisted port to Rust)
- **Pros**: fast; the old app acts as an oracle for behaviour
- **Cons**: the old app's problem was its coupling to unmaintained SSB
  plugins (ADR-0002), not its language; a faithful port keeps that coupling
  or needs a new backend anyway. The old app is not a trustworthy spec (9 of
  77 accessors were dropped; group creation was built in 2021 and never
  shipped). The kaupapa-sensitive areas — multi-source assertions,
  permissions, sync — are where conventional, AI-generated patterns are
  wrong for this data model (`CLAUDE.md`)
- **Why not**: solves the wrong problem, fastest

### Alternative 4: Freeform redesign with no inventory or reference
- **Pros**: maximum freedom; no upfront cataloguing; could delete Leg 1
  outright
- **Cons**: high risk of silently dropping something whānau rely on, with
  nobody on the team holding full knowledge of the old app to notice
- **Why not**: the capability inventory plus the frozen contract are cheap
  insurance against exactly that, and the inventory doubles as onboarding
  for the junior

## Consequences

### Positive
- Holochain capabilities are designed natively instead of imitating SSB
  workflows
- Removes an abstraction layer whose purpose (proving swappability) no
  longer exists, freeing capacity for the group-permissions slice
- Leg 1's work is kept for what it's genuinely good at — a reference and a
  verification checklist — rather than discarded
- Scope is set by what users do, which is recoverable without deep knowledge
  of the old codebase; building the inventory transfers product knowledge to
  the junior

### Negative
- **`ahau-v2` stops being backend-agnostic.** Moving off Holochain later
  would mean reworking each per-feature client and its callers, not writing
  one adapter. This is accepted: ADR-0003 already made agnosticism
  unprovable, and this ADR stops paying for it
- **Supersedes earlier framing that now needs revising** (not done in this
  change):
  - `CLAUDE.md` — the repo description ("backend-agnostic rewrite", Leg 1 /
    Leg 2) and the "Adapter boundaries" high-risk area, which assumes
    swappable adapters
  - `README.md` — describes the repo as a backend-agnostic contract
  - `docs/prds/ahau-v2-frontend-rebuild.prd.md` — "Protocol Adapters and the
    Agnosticism Proof"
  - `docs/writing-an-adapter.md` — no longer applies
- Amends ADR-0002's "no change to Leg 1/Leg 2 scope follows from this ADR".
  ADR-0002's decision (rewrite rather than keep patching SSB) stands; this
  ADR changes what the rewrite builds against
- Sunk cost: the contract's operation set, capability negotiation and
  fixture backend stop being developed

### Risks
- **A capability the old app provided gets dropped unnoticed.** Mitigation:
  the capability inventory (#13) is completed and cross-checked against the
  frozen contract before deep Holochain work beyond the group-permissions
  slice, and verified against the running old app and, where possible, real
  users/kaitiaki.
- **"Redesign" becomes licence to drift from the kaupapa principles** —
  e.g. a Holochain-native design that's simpler because it keeps one
  canonical value, or overwrites on conflict. Mitigation: the principles are
  invariants (Decision 4), each gets a Holochain test against a real
  conductor (Decision 6), and the missing multi-source assertion test is
  named here so it isn't forgotten.
- **Holochain's ecosystem ages the way SSB's did**, now without an adapter
  boundary to contain it. Mitigation: per-feature clients keep zome calls out
  of components, so the blast radius is the client layer rather than the
  whole UI; ADR-0003's exit criterion (no patching the protocol) remains the
  early warning.
- **Frozen reference drifts into being treated as live spec.** Mitigation:
  mark `src/contract/` as frozen reference in its module header and in
  `docs/INDEX.md` when this ADR is accepted.
