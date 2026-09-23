# ADR-0005: No SSB-to-v2 data migration for MVP; GEDCOM export/import remains an acknowledged, uncommitted future need

**Date**: 2026-09-23
**Status**: accepted
**Deciders**: taiao.kawiti.wbhs@gmail.com

## Context

Both existing Leg 1/Leg 2 PRDs already flag this as unresolved and
"effectively irreversible": `docs/prds/ahau-v2-repo-foundation.prd.md` and
`docs/prds/ahau-v2-frontend-rebuild.prd.md` each list "Is abandoning
existing users' SSB data acceptable?" as an open question, recorded as out
of scope but needing explicit confirmation. Separately, the broader
maintenance-direction decision (this rewrite's own justification) commits
to sunsetting the current app into a frozen, maintained-minimally state —
whānau who want it keep using it as-is — rather than shutting it down.

There is a real, pre-existing user need adjacent to this: `docs/history/
knowledge-base/repos/ahau-ahau.md` records issue #32 (opened 2023-09-14,
never built) — a GEDCOM import feature requested by whānau during Āhau
training sessions, motivated by wanting to move data between genealogy
tools. GEDCOM is a standard cross-compatible genealogy file-interchange
format; neither GEDCOM import nor export exists anywhere in the current
Āhau codebase today.

Old Āhau's whānau/whakapapa data can be group-encrypted via `ssb-tribes`.
Per `docs/history/knowledge-base/cross_cutting.md`, group encryption is
"documented as supported" but has **zero test coverage** in the app that
built it. SSB's identity model is key-based (per this repo's own CLAUDE.md)
— decryption capability lives with a whānau member's own local key, not
with "the app" as a server secret — so a migration tool does not
necessarily need to be part of the actively-maintained frozen app to work.
But nobody has actually proven SSB's group-decryption logic is usable
outside the app it was built into, and an untested encryption path is not
a safe thing to build irreversible data-export tooling against without
that proof existing first.

## Decision

**Clean-slate for MVP.** The old SSB-based app stays frozen and available
for whānau who want to keep using it; `ahau-v2` does not automatically
import existing SSB data. This resolves the open question both existing
PRDs flag as unconfirmed.

**The GEDCOM need is acknowledged, not committed.** A future GEDCOM
export-from-old-Āhau / import-into-`ahau-v2` path is recorded as a real,
previously-requested need (2023 issue #32) worth revisiting — but no export
or import mechanism, shape, or timeline is decided here. Specifically, this
ADR does **not** commit to a "standalone external tool" as the eventual
shape, because that would imply SSB's group-decryption logic is a solved,
usable-outside-the-app problem, which is unproven. Revisit only once
someone has actually spiked SSB group-decryption independently of the app
and confirmed it's viable to build on.

Building a GEDCOM exporter *into* the frozen old app (as opposed to
external, decoupled tooling) is explicitly not favoured, since that would
mean taking on new SSB-stack maintenance — directly against the
minimal-maintenance rationale for freezing the app in the first place — but
this is a preference to weigh if/when the work is scoped, not a decision
this ADR needs to lock in ahead of that.

## Alternatives Considered

### Alternative 1: Build a migration path for MVP
- **Pros**: removes the biggest reason a whānau might stay on the
  unmaintained SSB app rather than move to `ahau-v2`
- **Cons**: requires solving SSB group-decryption outside the app (unproven,
  zero test coverage even inside the app) as a prerequisite, on top of an
  already-constrained Milestone 0/Holochain-checkpoint roadmap; large,
  open-ended technical lift with a genuinely different data model on the
  other end (SSB CRUT/feed semantics vs. whatever Holochain's entries look
  like)
- **Why not**: not affordable at current capacity, and not needed for the
  narrow MVP definition (ADR-0003) — the flagship feature doesn't depend on
  migrated data existing

### Alternative 2: Commit now to a standalone GEDCOM tool as the eventual shape
- **Pros**: gives whānau who asked in 2023 (issue #32) a concrete answer
  sooner
- **Cons**: implies SSB's group encryption is provably usable outside the
  app before anyone has actually checked that — the app itself has never
  tested this code path
- **Why not**: recording an unverified technical assumption as a decision
  risks it calcifying into a plan nobody re-checks; better to record the
  need honestly as unresolved than to paper over the encryption question

### Alternative 3: Say nothing about GEDCOM, leave it purely as historical trivia
- **Pros**: simpler ADR
- **Cons**: loses the connection between a real 2023 whānau request and
  this rewrite's data-migration stance — a future contributor (or
  stakeholder question) re-asking "can people move their data?" would have
  no written answer beyond "not migrating," without the nuance that the
  need is known and specifically why nothing is committed yet
- **Why not**: the distinction between "not doing this" and "acknowledged,
  blocked on an unproven technical prerequisite" is worth the extra
  paragraph

## Consequences

### Positive
- Resolves an open question flagged as unconfirmed in both existing Leg
  1/Leg 2 PRDs
- Keeps the "avoid increasing dev time on the old stack" principle from the
  maintenance-direction decision intact — no new SSB-stack maintenance
  obligation created by this ADR
- The 2023 whānau request isn't lost or silently dropped — it's on record
  with an honest status

### Negative
- Whānau who want to move from the old app to `ahau-v2` have no path to do
  so without manual re-entry, for as long as this stance holds
- No committed timeline exists for revisiting this, only a trigger
  condition (someone spiking SSB group-decryption independently)

### Risks
- If demand for migration grows before the technical prerequisite is
  spiked, this could become a forcing function under pressure rather than a
  deliberate technical investigation. Mitigation: this ADR names the actual
  blocker (unproven group-decryption outside the app) explicitly, so if
  pressure does arrive, the first step is already identified rather than
  needing rediscovery.
- SSB group encryption having zero test coverage is itself a standing risk
  to the *old* app, independent of migration — whānau relying on group
  encryption today are trusting an untested code path. Out of scope for
  this ADR (the old app is frozen, not actively worked on), but worth
  flagging as a fact this decision surfaced, not one it resolves.
