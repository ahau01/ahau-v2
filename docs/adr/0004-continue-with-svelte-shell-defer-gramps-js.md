# ADR-0004: Continue building the frontend on the Leg 1 Svelte shell; defer Gramps.js

**Date**: 2026-09-23
**Status**: accepted
**Deciders**: taiao.kawiti.wbhs@gmail.com

## Context

Leg 1 delivered a Svelte 5 + TypeScript shell (`src/app/`) that proves
routing, contract consumption against `DataAccess`, and a verified design
token set (`tokens.css`) — per `docs/design-parity.md`, its screens are
explicitly placeholders, not ported UI, with parity capture "scheduled for
the first Leg 2 screen port, when there is something to diff." That port
hasn't happened yet.

Separately, `~/projects/ahau-styles` holds a framework-independent
extraction of Āhau's colours, typography tokens, fonts and icons, already
flagged in `docs/prds/ahau-v2-repo-foundation.prd.md` as "a starting point,
not a source of truth" — its values need verification against the shell's
existing tokens before anything further is built on them.

During planning for this ADR, forking Gramps.js (the web/Lit-based frontend
for Gramps Web, not desktop Gramps) as the frontend shell was raised as an
option, on the strength of it being the closest existing genealogy-software
precedent for a contract-then-frontend architecture. `docs/
decentralized-backend-research.md` confirms that precedent is real but
narrower than it first sounds: Gramps.js is Lit web components wired to a
REST API in front of one Gramps database — "the abstraction stops at 'REST
over one Gramps database instance'... nobody has swapped the store
underneath for anything decentralized." Desktop Gramps, by contrast, is
Python/GTK, local-storage-only, with no network or protocol-pluggability
layer at all. No Holochain hApp for genealogy — Gramps-based or otherwise —
exists anywhere.

Concretely, adopting Gramps.js would mean: a different component framework
(Lit, not Svelte) than Leg 1 already proved out; a data layer built for REST
against one database, needing full replacement with calls against a
capability-negotiating typed contract rather than a fixed API shape; and
abandoning the Leg 1 Svelte shell's already-verified routing/token work.
This is a frontend-framework migration, not a reskin, running in parallel
with an unproven Holochain protocol adapter (ADR-0003).

## Decision

Continue building the real, production frontend on the existing Leg 1
Svelte shell — its placeholder screens get built out into real UI, with
`ahau-styles` reconciled against (not assumed to already match) the shell's
existing verified `tokens.css`, per `docs/design-parity.md`'s method, once
there is a real screen to run that comparison against.

Gramps.js is not adopted now. It is recorded here as **researched and
deliberately deferred**, not dropped: the research (Gramps Web API
precedent, confirmation that no genealogy Holochain hApp exists anywhere)
remains valid and re-usable later, even though nothing is built on it today.

**Revisit trigger**: reconsider Gramps.js if the Svelte shell proves
inadequate for something Gramps.js already solves — e.g. if genealogy-tree
visualisation, GEDCOM-adjacent data presentation, or a specific UX pattern
Gramps.js already has built turns out to be materially expensive to build
from scratch in Svelte. Not before then, and not as a parallel track
alongside the Holochain adapter work.

## Alternatives Considered

### Alternative 1: Fork Gramps.js as the frontend shell now
- **Pros**: closest existing genealogy-software precedent for a
  contract/frontend split; avoids building UI patterns (person/family
  browsing, tree visualisation) from scratch
- **Cons**: different component framework than Leg 1 already built and
  proved (Lit vs Svelte); its data layer assumes REST over one Gramps
  database, not a capability-negotiating contract over swappable adapters —
  needs full replacement, not adaptation; abandons Leg 1's already-verified
  shell work
- **Why not**: stacks an unproven frontend-framework migration on top of an
  unproven protocol adapter (ADR-0003) at the same time — one unknown at a
  time is the more capacity-realistic sequencing, and Svelte is the known
  quantity here, not Holochain

### Alternative 2: Spike Gramps.js now (fork it, gut its API client, wire one screen to the fixture adapter) before committing either way
- **Pros**: would produce real evidence rather than a judgment call
- **Cons**: is itself a second piece of exploratory work competing for the
  same constrained hours as the Holochain spike (ADR-0003) and Milestone 0's
  contract fixes
- **Why not**: not ruled out forever — this is essentially what the revisit
  trigger describes — but not affordable as parallel work right now

### Alternative 3: Drop Gramps.js from consideration entirely, don't record it
- **Pros**: simpler ADR, nothing to revisit
- **Cons**: the research (REST-over-one-database precedent, no genealogy
  Holochain hApp anywhere) took real effort and stays valuable; dropping it
  silently risks it being re-researched from scratch if it comes up again
  in six months
- **Why not**: recording it as deferred, with a concrete revisit trigger, is
  nearly free and preserves the work

## Consequences

### Positive
- No new frontend-framework risk introduced alongside the Holochain adapter
  risk — Svelte is proven infrastructure from here, the only open question
  is Holochain
- Leg 1's shell/routing/token work isn't discarded
- Gramps.js research stays available and actionable, not lost

### Negative
- Building out real UI in Svelte means the ~47k LOC of Vue screens in the
  existing app still have no directly reusable equivalent to port from
  (this was already true before this ADR — `docs/prds/
  ahau-v2-repo-foundation.prd.md`'s Open Questions flags "What replaces
  Vuetify 2?" as settled via a headless-primitives/hand-built hybrid, but
  the porting volume itself is unchanged by this decision)

### Risks
- `tokens.css` and `ahau-styles` may not actually agree — this has been
  assumed rather than verified since Leg 1. Mitigation: explicit
  reconciliation pass against `docs/design-parity.md`'s method at the first
  real Leg 2 screen port, not assumed correct by default.
- The revisit trigger ("Svelte proves inadequate for something Gramps.js
  already solves") is a judgment call, not a metric. Mitigation: named here
  in writing so it's a deliberate re-evaluation if it comes up, not a
  silent scope change either direction.
