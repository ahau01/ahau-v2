# Why the rewrite

This document merges five accepted ADRs (0002–0006) written during
`ahau-v2`'s first weeks into one chronological narrative: why continuing to
patch `ahau-monorepo`'s SSB architecture was abandoned, what shape the
rewrite took (Holochain as the Leg 2 candidate, Svelte over Gramps.js,
clean-slate data migration), and why the Leg 1 contract ended up frozen as
reference rather than the thing Holochain is built against. Content is kept
near-verbatim per ADR, each under its own date and title, rather than
re-narrated — this is a relocation of the "initial days" case study, not a
summary of it. ADR numbers are kept as section labels for continuity with
material (git history, issue threads) that already cites them; they are no
longer live citations anyone outside this file needs to follow.

## 2026-09-18 — ADR-0002: Rewrite the backend as a swappable contract, rather than continue patching `ahau-monorepo`'s SSB architecture

**Status**: accepted · **Deciders**: taiao.kawiti.wbhs@gmail.com

### Context

`ahau-v2`'s premise — a backend-agnostic data-access contract with swappable protocol adapters
(see `CLAUDE.md`) — was originally one option among several for Āhau's future,
not a settled conclusion. Three pieces of concrete, in-flight work in `ahau-monorepo` turned it
into one: [Enable group creation](https://github.com/ahau01/ahau-monorepo/pull/3) (draft),
[apps/ahau db2 migration, Milestone 1](https://github.com/ahau01/ahau-monorepo/pull/6) (draft),
and [Milestone 2: data-migration verification](https://github.com/ahau01/ahau-monorepo/pull/7)
(draft, "complete" but still unmerged as of this writing). All three remain open and were still
being updated the day this ADR was written — this is a live case study of the current
architecture's cost, not settled history.

**What started as a small, scoped feature.** [`enable-group-creation.prd.md`](https://github.com/ahau01/ahau-monorepo/blob/ahau-65-enable-group-creation/.claude/prds/enable-group-creation.prd.md)
set out to finish and re-enable a group-creation feature that was fully built in 2021 and then
disabled before shipping — re-wire an existing UI, re-enable a disabled button, add logging and
tests. A four-milestone PRD, most of it straightforward.

**Milestone 3 (removing a group member) could not be scoped as a UI task.** The only method that
removes a member, `ssb.tribes.excludeMembers`, exists solely in `ssb-tribes@^4.0.1`,and
`apps/ahau/desktop`/`mobile` are pinned to `ssb-tribes@3.1.3`, which has no removal method under
any name. Investigating the version bump surfaced that it isn't a version bump: v4 tribes depends
on the `ssb-box2` encryption plugin and queries via `ssb-db2/operators`, neither of which
desktop/mobile load — they still run the older `ssb-db` (v1). "Add a method" became "migrate the
app's database engine," spun out as its own PRD
([`apps-ahau-db2-migration.prd.md`](https://github.com/ahau01/ahau-monorepo/blob/ahau-db2-migration/.claude/prds/apps-ahau-db2-migration.prd.md)).

**The migration had already been attempted once, and abandoned unmerged for two years.** A
near-complete prior attempt existed as GitLab MR !953 ("Upgrade to db2 and migrate from db1"),
opened 2024-01-25 against the pre-monorepo `ahau/ahau` repo, 16 commits, all checks passing per
its own description — never merged. Its target dependency versions still matched what the monorepo has hoisted at its root today, two
years later — the technical content hadn't gone stale, but nobody had carried it across the team
transition into a mergeable state. It also only ever covered desktop, never mobile, which remains
unmigrated with no prior art at all. Full writeup:
[`docs/learnings/apps-ahau-db2-migration-mr953.md`](https://github.com/ahau01/ahau-monorepo/blob/ahau-65-enable-group-creation/docs/learnings/apps-ahau-db2-migration-mr953.md)
on the `ahau-65-enable-group-creation` branch — not migrated into `ahau-v2`, per the decision
recorded in [Wayfinder ticket #12](https://github.com/ahau01/ahau-v2/issues/12).

**Finishing that migration meant patching a dependency the project doesn't own.** Milestone 2
(data-migration verification) found and fixed a resume-crash bug inside `ssb-db2` itself
(`patches/ssb-db2+8.1.0.patch`), which in turn exposed a second, independent deadlock bug in the
same dependency's resume logic — deferred rather than fixed a second time, and documented rather
than patched, specifically because "fixing it would mean a second patch to a dependency we don't
own." A custom migration-guard and verification harness
(`migration-guard.js`, `scripts/db2-migration-verify/`) had to be built from scratch just to
validate the migration was safe on real user data. As of this ADR, Milestone 2 is done and
Milestone 3 — the group-member-removal feature that started this — has not begun.

### Decision

Continue with `ahau-v2`'s existing direction: a typed, backend-agnostic data-access contract (Leg
1, complete) with swappable protocol adapters (Leg 2, not started), rather than continuing to
build new features directly against `ahau-monorepo`'s SSB stack. The three PRs above are treated
as the confirming evidence for a direction already underway, not as a new proposal — no change to
Leg 1/Leg 2 scope follows from this ADR.

### Alternatives Considered

#### Alternative 1: Keep building features directly on `ahau-monorepo`'s SSB stack
- **Pros**: no rewrite cost; `ahau-monorepo` already exists and partially works
- **Cons**: as demonstrated above, a single UI feature (remove a group member) required an
  unplanned database engine migration, patching a third-party dependency, and building bespoke
  migration-verification tooling — before the originating feature could ship
- **Why not**: the cost isn't hypothetical; it's the actual, measured cost of the smallest
  possible next feature. Nothing about `ssb-tribes`/`ssb-db`/`ssb-box2` is unique here — it's
  evidence of what any future feature touching membership/permissions/identity is likely to
  repeat, on unmaintained upstream plugins with no team member holding full context (the original
  db2 migration attempt sat unmerged for two years across a team split)

#### Alternative 2: Finish the db2 migration in `ahau-monorepo`, then keep iterating there
- **Pros**: unblocks Milestone 3 and any near-term feature that needs `ssb-tribes` v4; smaller
  scope than a full rewrite
- **Cons**: fixes this one dependency-version wall without addressing the underlying pattern —
  the next feature that brushes against an unmaintained SSB plugin hits the same shape of problem
  again, with no adapter boundary to contain it next time
- **Why not**: it treats the symptom (this migration) rather than the cause (no abstraction
  between domain logic and a specific, aging protocol's plugin ecosystem) — which is exactly what
  the Leg 1 contract now exists to fix

#### Alternative 3: Rewrite without a backend-agnostic contract, just on a newer SSB stack
- **Pros**: still escapes `ssb-db`/`ssb-tribes@3.x`, less abstraction than a full adapter
  interface
- **Cons**: doesn't address the deeper structural risk — `CLAUDE.md`'s "no
  canonical version of relationship data" / "no assumed central authority" principles are about
  what any decentralised backend must support, not specifically about SSB's plugin versioning;
  a same-protocol rewrite still leaves the project coupled to one implementation's release cadence
- **Why not**: `ahau-v2`'s contract-and-adapters approach was already the chosen direction before
  this evidence arrived; this ADR confirms it rather than reopening the choice

### Consequences

#### Positive
- The decision to keep pursuing Leg 1/Leg 2 now has concrete, dated evidence behind it, not just
  the abstract kaupapa-principles argument in `CLAUDE.md` — useful for onboarding and for any
  future stakeholder conversation that re-litigates "why not just keep patching `ahau-monorepo`"
- Confirms that unmaintained-upstream-plugin risk (not just data-model/sovereignty concerns) is a
  real driver for adapter boundaries — worth weighing when Leg 2 adapter candidates are evaluated
  (does the candidate protocol have better-maintained core libraries than late-2010s SSB plugins?)

#### Negative
- None beyond what Leg 1/Leg 2 already committed to — this ADR ratifies work already scoped, it
  doesn't add new scope

#### Risks
- The three PRs (#3/#6/#7) remain open, unmerged, in-flight work in `ahau-monorepo` as of this
  writing — this ADR's evidence section is a snapshot, not a live mirror. If those PRs land or get
  abandoned, that's a fact worth noting in a future ADR or the `ahau-v2` docs, but doesn't change
  this decision (tracked via [Wayfinder ticket #12](https://github.com/ahau01/ahau-v2/issues/12),
  closed as deferred at the same time this ADR was written)

## 2026-09-23 — ADR-0003: Adopt Holochain as the Leg 2 protocol candidate, validated by a single capability-specific spike rather than a two-adapter comparison

**Status**: accepted · **Deciders**: taiao.kawiti.wbhs@gmail.com

### Context

`docs/history/leg1/ahau-v2-frontend-rebuild.prd.md` ("Protocol Adapters and the
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
in ADR-0002 above), and funders/stakeholders need to see forward motion on it
sooner than a full two-adapter comparison can deliver.

`docs/history/leg1/decentralized-backend-research.md` independently ranks Holochain first
among four candidates "if forced to rank" — enforced (not merely advisory)
capability grants, fully offline-first — while noting no genealogy hApp
exists anywhere as prior art, and Holochain's zome logic is Rust-only. nostr
is flagged in the same research as structurally public-by-default with no
record-level access control, which the frontend-rebuild PRD's own Open
Questions already treats as a live doubt about whether it could ever host
whakapapa in production, independent of its usefulness as a contract-stress
test.

### Decision

Build a single Holochain adapter, evaluated against a capability-specific
exit criterion, in place of the two-adapter comparison the frontend-rebuild
PRD currently specifies. nostr is dropped from active build/comparison —
not because the research disqualifies it, but on capacity grounds; this is
recorded as a deliberate scope cut, not a silent one, and `docs/history/leg1/
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
`ssb-db2`/`ssb-tribes` saga in ADR-0002 (above) required patching SSB, that is the
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

### Alternatives Considered

#### Alternative 1: Keep the two-adapter comparison (Holochain + nostr), as currently specified
- **Pros**: the only version of this plan that actually tests whether the
  contract is agnostic rather than shaped by whichever backend was built
  first — this is what the frontend-rebuild PRD's Success Metrics
  ("Contract revisions forced by adapter #2 — materially fewer than adapter
  #1") are designed to catch
- **Cons**: not affordable at current capacity without indefinitely
  delaying any stakeholder-visible progress
- **Why not**: capacity is the binding constraint right now, not technical
  preference — see Context

#### Alternative 2: Holochain-only, but with time-boxed exit criteria instead of capability-specific ones
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

#### Alternative 3: nostr or ATProto instead of Holochain
- **Pros**: nostr is the better TypeScript/stack fit; ATProto has the
  strongest typed-schema fit (Lexicons); both are lower-effort to prototype
  than Rust-based Holochain zomes
- **Cons**: nostr has no record-level access control at all, structurally
  public-by-default — directly in tension with group-permissions being the
  flagship use case; ATProto has the weakest offline story of the four
  candidates researched and no per-record permissions either
- **Why not**: both are structurally weaker fits for the specific feature
  (group permissions) this rewrite is being justified by — this is recorded
  in `docs/history/leg1/decentralized-backend-research.md`, not re-litigated here

#### Alternative 4: Fold sync/offline-then-conflict validation into this same checkpoint
- **Pros**: catches a second class of protocol risk in the same pass,
  avoids a second surprise later
- **Cons**: compounds two open questions (does the permission model work?
  does sync hold up?) into one checkpoint, making a partial pass hard to
  interpret and harder to act on decisively
- **Why not**: sequencing risk one at a time, with each having its own clear
  pass/fail bar, is worth more than catching both risks nominally earlier at
  the cost of a muddier signal on either

### Consequences

#### Positive
- A single, capacity-realistic checkpoint with a falsifiable bar, reachable
  on the current reduced-hours timeline
- Produces the tangible near-term prototype stakeholders need, on the
  feature (group permissions) that already carries the rewrite's own
  justifying narrative
- The capability-specific exit criterion is a genuine check, not silence on
  risk — it specifically re-tests the failure mode (patching a protocol the
  project doesn't own) that ADR-0002 identified as the core problem with the
  current SSB stack

#### Negative
- **This materially narrows the claim `ahau-v2` can make about itself.**
  `docs/history/leg1/ahau-v2-frontend-rebuild.prd.md` is titled "Protocol Adapters
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

#### Risks
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

## 2026-09-23 — ADR-0004: Continue building the frontend on the Leg 1 Svelte shell; defer Gramps.js

**Status**: accepted · **Deciders**: taiao.kawiti.wbhs@gmail.com

### Context

Leg 1 delivered a Svelte 5 + TypeScript shell (`src/app/`) that proves
routing, contract consumption against `DataAccess`, and a verified design
token set (`tokens.css`) — per `docs/design-parity.md`, its screens are
explicitly placeholders, not ported UI, with parity capture "scheduled for
the first Leg 2 screen port, when there is something to diff." That port
hasn't happened yet.

Separately, `~/projects/ahau-styles` holds a framework-independent
extraction of Āhau's colours, typography tokens, fonts and icons, already
flagged in `docs/history/leg1/ahau-v2-repo-foundation.prd.md` as "a starting point,
not a source of truth" — its values need verification against the shell's
existing tokens before anything further is built on them.

During planning for this ADR, forking Gramps.js (the web/Lit-based frontend
for Gramps Web, not desktop Gramps) as the frontend shell was raised as an
option, on the strength of it being the closest existing genealogy-software
precedent for a contract-then-frontend architecture. `docs/history/leg1/
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
with an unproven Holochain protocol adapter (ADR-0003, above).

### Decision

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

### Alternatives Considered

#### Alternative 1: Fork Gramps.js as the frontend shell now
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

#### Alternative 2: Spike Gramps.js now (fork it, gut its API client, wire one screen to the fixture adapter) before committing either way
- **Pros**: would produce real evidence rather than a judgment call
- **Cons**: is itself a second piece of exploratory work competing for the
  same constrained hours as the Holochain spike (ADR-0003) and Milestone 0's
  contract fixes
- **Why not**: not ruled out forever — this is essentially what the revisit
  trigger describes — but not affordable as parallel work right now

#### Alternative 3: Drop Gramps.js from consideration entirely, don't record it
- **Pros**: simpler ADR, nothing to revisit
- **Cons**: the research (REST-over-one-database precedent, no genealogy
  Holochain hApp anywhere) took real effort and stays valuable; dropping it
  silently risks it being re-researched from scratch if it comes up again
  in six months
- **Why not**: recording it as deferred, with a concrete revisit trigger, is
  nearly free and preserves the work

### Consequences

#### Positive
- No new frontend-framework risk introduced alongside the Holochain adapter
  risk — Svelte is proven infrastructure from here, the only open question
  is Holochain
- Leg 1's shell/routing/token work isn't discarded
- Gramps.js research stays available and actionable, not lost

#### Negative
- Building out real UI in Svelte means the ~47k LOC of Vue screens in the
  existing app still have no directly reusable equivalent to port from
  (this was already true before this ADR — `docs/history/leg1/
  ahau-v2-repo-foundation.prd.md`'s Open Questions flags "What replaces
  Vuetify 2?" as settled via a headless-primitives/hand-built hybrid, but
  the porting volume itself is unchanged by this decision)

#### Risks
- `tokens.css` and `ahau-styles` may not actually agree — this has been
  assumed rather than verified since Leg 1. Mitigation: explicit
  reconciliation pass against `docs/design-parity.md`'s method at the first
  real Leg 2 screen port, not assumed correct by default.
- The revisit trigger ("Svelte proves inadequate for something Gramps.js
  already solves") is a judgment call, not a metric. Mitigation: named here
  in writing so it's a deliberate re-evaluation if it comes up, not a
  silent scope change either direction.

## 2026-09-23 — ADR-0005: No SSB-to-v2 data migration for MVP; GEDCOM export/import remains an acknowledged, uncommitted future need

**Status**: accepted · **Deciders**: taiao.kawiti.wbhs@gmail.com

### Context

Both existing Leg 1/Leg 2 PRDs already flag this as unresolved and
"effectively irreversible": `docs/history/leg1/ahau-v2-repo-foundation.prd.md` and
`docs/history/leg1/ahau-v2-frontend-rebuild.prd.md` each list "Is abandoning
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

### Decision

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

### Alternatives Considered

#### Alternative 1: Build a migration path for MVP
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

#### Alternative 2: Commit now to a standalone GEDCOM tool as the eventual shape
- **Pros**: gives whānau who asked in 2023 (issue #32) a concrete answer
  sooner
- **Cons**: implies SSB's group encryption is provably usable outside the
  app before anyone has actually checked that — the app itself has never
  tested this code path
- **Why not**: recording an unverified technical assumption as a decision
  risks it calcifying into a plan nobody re-checks; better to record the
  need honestly as unresolved than to paper over the encryption question

#### Alternative 3: Say nothing about GEDCOM, leave it purely as historical trivia
- **Pros**: simpler ADR
- **Cons**: loses the connection between a real 2023 whānau request and
  this rewrite's data-migration stance — a future contributor (or
  stakeholder question) re-asking "can people move their data?" would have
  no written answer beyond "not migrating," without the nuance that the
  need is known and specifically why nothing is committed yet
- **Why not**: the distinction between "not doing this" and "acknowledged,
  blocked on an unproven technical prerequisite" is worth the extra
  paragraph

### Consequences

#### Positive
- Resolves an open question flagged as unconfirmed in both existing Leg
  1/Leg 2 PRDs
- Keeps the "avoid increasing dev time on the old stack" principle from the
  maintenance-direction decision intact — no new SSB-stack maintenance
  obligation created by this ADR
- The 2023 whānau request isn't lost or silently dropped — it's on record
  with an honest status

#### Negative
- Whānau who want to move from the old app to `ahau-v2` have no path to do
  so without manual re-entry, for as long as this stance holds
- No committed timeline exists for revisiting this, only a trigger
  condition (someone spiking SSB group-decryption independently)

#### Risks
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

## 2026-10-03 — ADR-0006: Redesign around user capabilities on Holochain; freeze the Leg 1 contract as SSB-era reference

**Status**: accepted · **Deciders**: taiao.kawiti.wbhs@gmail.com

### Context

Leg 1 derived a backend-agnostic contract from the old app's data layer: 77
exported data-access functions were triaged, 68 kept, and expressed as 69
typed operations across 14 domains, with capability negotiation
(`reference/leg1-contract/contract/capabilities.ts`), cross-cutting semantics
(`reference/leg1-contract/contract/semantics.ts`), an in-memory fixture backend
(`reference/leg1-contract/fixtures/`), and a conformance suite (`reference/leg1-contract/conformance/`). Its purpose
was to let protocol adapters be swapped, and to prove that by running two
very different adapters (Holochain and nostr) behind it with zero frontend
changes.

Three things have since changed:

1. **ADR-0003 (above) removed the second adapter.** With nostr dropped, Holochain is
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
   constraints ADR-0002 (above) set out to escape.
3. **Knowledge and capacity are thin.** One developer carries the project's
   context, alongside a junior new to it, at reduced hours (ADR-0003). Nobody
   holds complete knowledge of the old app's internals, and maintaining a
   69-operation abstraction ahead of need competes directly with building.

The contract is still valuable — just not as the thing Holochain is built
against. It is the most complete written record of what the SSB-era app
could do, and its design docs (`docs/contract-decisions.md`,
`docs/history/leg1/contract-friction.md`) capture reasoning about whakapapa data that
holds on any backend.

### Decision

Build `ahau-v2` as a **behaviour-equivalent redesign directly on Holochain**,
not an implementation-equivalent port behind a swappable contract.

1. **The spec is a capability inventory** — user-facing statements such as
   "a kaitiaki can remove a member from a whānau group", recovered from the
   running old app, users/kaitiaki, and existing docs (tracked in #13). Each
   capability is designed the way Holochain does it best.

2. **The Leg 1 contract is frozen as historical reference.** `reference/leg1-contract/contract/`
   and `reference/leg1-contract/contract-source/` stop evolving. They remain in the repo as:
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
   two-devices-offline-then-sync validation (ADR-0003, above) lands in the same
   place.

Group permissions remains the first vertical slice; ADR-0003's exit
criterion is unchanged.

### Alternatives Considered

#### Alternative 1: Keep the contract as the shell–backend interface and grow it by vertical slices
- **Pros**: keeps a formal seam and the conformance suite live; Holochain
  revisions to the contract stay visible and reviewable
- **Cons**: retains swappable-adapter machinery with only one adapter to
  use it; every Holochain-native design has to be translated back into a
  contract that started SSB-shaped
- **Why not**: this was this ADR's first draft. It still optimises for a
  swappability nothing will exercise, at the cost of the capacity needed to
  build. Thin per-feature clients keep the testability benefit without the
  abstraction

#### Alternative 2: Continue the operation-for-operation port (Leg 1 direction as originally planned)
- **Pros**: contract already largely done; the triage gives a complete,
  mechanical checklist; low risk of dropping an old behaviour
- **Cons**: carries SSB-shaped workflows into Holochain; maintains 69
  operations before any real backend has tested them
- **Why not**: optimises for fidelity to an architecture the project is
  deliberately leaving. The checklist benefit is kept by freezing the
  contract as reference rather than building against it

#### Alternative 3: Mechanical rewrite of the old app (e.g. AI-assisted port to Rust)
- **Pros**: fast; the old app acts as an oracle for behaviour
- **Cons**: the old app's problem was its coupling to unmaintained SSB
  plugins (ADR-0002), not its language; a faithful port keeps that coupling
  or needs a new backend anyway. The old app is not a trustworthy spec (9 of
  77 accessors were dropped; group creation was built in 2021 and never
  shipped). The kaupapa-sensitive areas — multi-source assertions,
  permissions, sync — are where conventional, AI-generated patterns are
  wrong for this data model (`CLAUDE.md`)
- **Why not**: solves the wrong problem, fastest

#### Alternative 4: Freeform redesign with no inventory or reference
- **Pros**: maximum freedom; no upfront cataloguing; could delete Leg 1
  outright
- **Cons**: high risk of silently dropping something whānau rely on, with
  nobody on the team holding full knowledge of the old app to notice
- **Why not**: the capability inventory plus the frozen contract are cheap
  insurance against exactly that, and the inventory doubles as onboarding
  for the junior

### Consequences

#### Positive
- Holochain capabilities are designed natively instead of imitating SSB
  workflows
- Removes an abstraction layer whose purpose (proving swappability) no
  longer exists, freeing capacity for the group-permissions slice
- Leg 1's work is kept for what it's genuinely good at — a reference and a
  verification checklist — rather than discarded
- Scope is set by what users do, which is recoverable without deep knowledge
  of the old codebase; building the inventory transfers product knowledge to
  the junior

#### Negative
- **`ahau-v2` stops being backend-agnostic.** Moving off Holochain later
  would mean reworking each per-feature client and its callers, not writing
  one adapter. This is accepted: ADR-0003 already made agnosticism
  unprovable, and this ADR stops paying for it
- **Superseded earlier framing** (already carried out in a later change,
  listed here for the historical record):
  - `CLAUDE.md` — the repo description ("backend-agnostic rewrite", Leg 1 /
    Leg 2) and the "Adapter boundaries" high-risk area, which assumed
    swappable adapters
  - `README.md` — described the repo as a backend-agnostic contract
  - `docs/history/leg1/ahau-v2-frontend-rebuild.prd.md` — "Protocol Adapters and the
    Agnosticism Proof"
  - `docs/history/leg1/writing-an-adapter.md` — no longer applies
- Amends ADR-0002's "no change to Leg 1/Leg 2 scope follows from this ADR".
  ADR-0002's decision (rewrite rather than keep patching SSB) stands; this
  ADR changes what the rewrite builds against
- Sunk cost: the contract's operation set, capability negotiation and
  fixture backend stop being developed

#### Risks
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
  mark `reference/leg1-contract/contract/` as frozen reference in its module header and in
  `docs/INDEX.md` when this ADR is accepted.
