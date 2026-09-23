# ADR-0003: Adopt Holochain as the Leg 2 protocol candidate, validated by a single capability-specific spike rather than a two-adapter comparison

**Date**: 2026-09-23
**Status**: accepted
**Deciders**: taiao.kawiti.wbhs@gmail.com

## Context

`docs/prds/ahau-v2-frontend-rebuild.prd.md` ("Protocol Adapters and the
Agnosticism Proof") currently defines Leg 2's hypothesis as: one whakapapa
feature, exercising group permissions and record revision, running
end-to-end against **both** a Holochain conductor and a nostr relay, with
zero frontend changes between them. Its Delivery Milestones name the nostr
adapter "the milestone that must not be dropped" — the two-adapter
comparison, not either adapter individually, is what proves the contract is
genuinely backend-agnostic rather than SSB's shape in new syntax.

Capacity has since dropped below what that plan assumed. Tu is moving from
20 hours/week to 10; the product owner is moving from 30 to 20, with most of
that reduction spent on mentoring and backlog maintenance rather than build
work. At the same time, there is an explicit near-term need for a tangible,
demoable prototype for stakeholders — this rewrite's justification rests
partly on a specific story (the 2021/2026 group-permissions saga documented
in ADR-0002), and funders/stakeholders need to see forward motion on it
sooner than a full two-adapter comparison can deliver.

`docs/decentralized-backend-research.md` independently ranks Holochain first
among four candidates "if forced to rank" — enforced (not merely advisory)
capability grants, fully offline-first — while noting no genealogy hApp
exists anywhere as prior art, and Holochain's zome logic is Rust-only. nostr
is flagged in the same research as structurally public-by-default with no
record-level access control, which the frontend-rebuild PRD's own Open
Questions already treats as a live doubt about whether it could ever host
whakapapa in production, independent of its usefulness as a contract-stress
test.

## Decision

Build a single Holochain adapter, evaluated against a capability-specific
exit criterion, in place of the two-adapter comparison the frontend-rebuild
PRD currently specifies. nostr is dropped from active build/comparison —
not because the research disqualifies it, but on capacity grounds; this is
recorded as a deliberate scope cut, not a silent one, and `docs/prds/
ahau-v2-frontend-rebuild.prd.md` is being revised in the same change that
introduces this ADR to reflect it (see that PRD's updated Hypothesis,
Constraints, Scope, Delivery Milestones, Success Metrics, and Open
Questions/Risks sections).

**Exit criterion**: does Holochain's capability-grant system deliver
*enforced* permissions for the group-permissions use case (see `docs/plans/
group-permissions.md` for the functional shape: kaitiaki/member removal, at
least one enforced per-content-type permission) without resorting to custom
protocol-level workarounds? If achieving it requires patching Holochain
itself, or working around undocumented conductor behaviour the way the
`ssb-db2`/`ssb-tribes` saga in ADR-0002 required patching SSB, that is the
falsification signal — regardless of how close the implementation feels to
working, and regardless of time already spent.

**Explicitly out of this checkpoint's scope**: two-devices-offline-then-sync
validation (CLAUDE.md's high-risk-area rule for sync/conflict resolution).
Sync correctness is exactly the kind of property that looks fine
single-device and breaks multi-device — deferring it is a real risk, not a
non-issue — but it is deferred to a second validation pass *after* the
capability-grant checkpoint passes, to keep this checkpoint answerable in
one pass rather than compounding two open questions into one ambiguous
result.

Production backend selection remains formally undecided by this ADR:
Holochain becomes the thing that gets built and evaluated, not yet the
committed production choice. But there is no second adapter left to compare
it against, so "undecided pending comparison" (the frontend-rebuild PRD's
current framing) becomes, in practice, "undecided pending this one adapter
clearing its exit criteria" — a materially different and weaker form of
undecided. See Consequences.

## Alternatives Considered

### Alternative 1: Keep the two-adapter comparison (Holochain + nostr), as currently specified
- **Pros**: the only version of this plan that actually tests whether the
  contract is agnostic rather than shaped by whichever backend was built
  first — this is what the frontend-rebuild PRD's Success Metrics
  ("Contract revisions forced by adapter #2 — materially fewer than adapter
  #1") are designed to catch
- **Cons**: not affordable at current capacity without indefinitely
  delaying any stakeholder-visible progress
- **Why not**: capacity is the binding constraint right now, not technical
  preference — see Context

### Alternative 2: Holochain-only, but with time-boxed exit criteria instead of capability-specific ones
- **Pros**: simpler to state and track ("stop after N weeks if it's not
  working")
- **Cons**: a time box alone doesn't distinguish "almost working, worth one
  more push" from "fundamentally the wrong shape" — exactly the ambiguity
  that let the `ssb-db2` migration in ADR-0002's case study consume far more
  effort than a UI feature should have, one "just one more patch" at a time
- **Why not**: the capability-specific criterion (does the permission model
  work *without* protocol-level patching) is falsifiable in a way a deadline
  alone is not; time-boxing is kept as a backstop within that criterion, not
  as the criterion itself

### Alternative 3: nostr or ATProto instead of Holochain
- **Pros**: nostr is the better TypeScript/stack fit; ATProto has the
  strongest typed-schema fit (Lexicons); both are lower-effort to prototype
  than Rust-based Holochain zomes
- **Cons**: nostr has no record-level access control at all, structurally
  public-by-default — directly in tension with group-permissions being the
  flagship use case; ATProto has the weakest offline story of the four
  candidates researched and no per-record permissions either
- **Why not**: both are structurally weaker fits for the specific feature
  (group permissions) this rewrite is being justified by — this is recorded
  in `docs/decentralized-backend-research.md`, not re-litigated here

### Alternative 4: Fold sync/offline-then-conflict validation into this same checkpoint
- **Pros**: catches a second class of protocol risk in the same pass,
  avoids a second surprise later
- **Cons**: compounds two open questions (does the permission model work?
  does sync hold up?) into one checkpoint, making a partial pass hard to
  interpret and harder to act on decisively
- **Why not**: sequencing risk one at a time, with each having its own clear
  pass/fail bar, is worth more than catching both risks nominally earlier at
  the cost of a muddier signal on either

## Consequences

### Positive
- A single, capacity-realistic checkpoint with a falsifiable bar, reachable
  on the current reduced-hours timeline
- Produces the tangible near-term prototype stakeholders need, on the
  feature (group permissions) that already carries the rewrite's own
  justifying narrative
- The capability-specific exit criterion is a genuine check, not silence on
  risk — it specifically re-tests the failure mode (patching a protocol the
  project doesn't own) that ADR-0002 identified as the core problem with the
  current SSB stack

### Negative
- **This materially narrows the claim `ahau-v2` can make about itself.**
  `docs/prds/ahau-v2-frontend-rebuild.prd.md` is titled "Protocol Adapters
  and the Agnosticism Proof" and its whole hypothesis is that the contract's
  genuine backend-agnosticism gets proven by two independent adapters
  converging on it. Building one adapter proves, at best, that the contract
  works for Holochain — it cannot prove the contract *isn't* secretly
  Holochain-shaped, which is exactly the risk CLAUDE.md's "Adapter
  boundaries" section and the frontend-rebuild PRD's own Risks table
  ("Wrong abstraction — a contract shaped by whichever adapter was built
  first, agnostic in name only") were written to guard against. This is a
  deliberate, recorded trade made under capacity pressure, not an oversight
  — but it should not be described externally as "backend-agnosticism
  proven," because it isn't, by this plan's own prior definition of proof.
- No second adapter exists to catch a contract revision that happens to fit
  Holochain but wouldn't fit anything else — that risk is now unmitigated by
  design, not just unmitigated by omission.

### Risks
- **The contract could quietly become Holochain-shaped with nothing to
  catch it.** Mitigation: track every contract revision forced during the
  Holochain build explicitly (the frontend-rebuild PRD's "Contract revisions
  forced by adapter #1" metric stays in place even without a #2 to compare
  against), and treat any revision that reads as "make this fit Holochain's
  model" rather than "this was underspecified for any backend" as a flag
  worth a second look before merging.
- **A capability-grant success that still required protocol-level patching
  could get called a pass under time pressure.** Mitigation: the exit
  criterion is written down now, in this ADR, specifically so that judgment
  call is checked against a standard set before the pressure exists, not
  invented in the moment.
- **Deferred sync/offline validation could surface a second, later Holochain
  problem after more has been built on top of it** (the same shape of risk
  ADR-0002's case study describes for SSB — a small feature surfacing a
  deep protocol issue late). Mitigation: named explicitly as a known,
  accepted risk of this sequencing (Alternative 4), not a blind spot; the
  second validation pass is committed, not optional, once the capability
  checkpoint passes.
