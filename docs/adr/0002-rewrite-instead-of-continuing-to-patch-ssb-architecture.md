# ADR-0002: Rewrite the backend as a swappable contract, rather than continue patching `ahau-monorepo`'s SSB architecture

**Date**: 2026-09-18
**Status**: accepted
**Deciders**: taiao.kawiti.wbhs@gmail.com

## Context

`ahau-v2`'s premise — a backend-agnostic data-access contract with swappable protocol adapters
(see [`CLAUDE.md`](../../CLAUDE.md)) — was originally one option among several for Āhau's future,
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

## Decision

Continue with `ahau-v2`'s existing direction: a typed, backend-agnostic data-access contract (Leg
1, complete) with swappable protocol adapters (Leg 2, not started), rather than continuing to
build new features directly against `ahau-monorepo`'s SSB stack. The three PRs above are treated
as the confirming evidence for a direction already underway, not as a new proposal — no change to
Leg 1/Leg 2 scope follows from this ADR.

## Alternatives Considered

### Alternative 1: Keep building features directly on `ahau-monorepo`'s SSB stack
- **Pros**: no rewrite cost; `ahau-monorepo` already exists and partially works
- **Cons**: as demonstrated above, a single UI feature (remove a group member) required an
  unplanned database engine migration, patching a third-party dependency, and building bespoke
  migration-verification tooling — before the originating feature could ship
- **Why not**: the cost isn't hypothetical; it's the actual, measured cost of the smallest
  possible next feature. Nothing about `ssb-tribes`/`ssb-db`/`ssb-box2` is unique here — it's
  evidence of what any future feature touching membership/permissions/identity is likely to
  repeat, on unmaintained upstream plugins with no team member holding full context (the original
  db2 migration attempt sat unmerged for two years across a team split)

### Alternative 2: Finish the db2 migration in `ahau-monorepo`, then keep iterating there
- **Pros**: unblocks Milestone 3 and any near-term feature that needs `ssb-tribes` v4; smaller
  scope than a full rewrite
- **Cons**: fixes this one dependency-version wall without addressing the underlying pattern —
  the next feature that brushes against an unmaintained SSB plugin hits the same shape of problem
  again, with no adapter boundary to contain it next time
- **Why not**: it treats the symptom (this migration) rather than the cause (no abstraction
  between domain logic and a specific, aging protocol's plugin ecosystem) — which is exactly what
  the Leg 1 contract now exists to fix

### Alternative 3: Rewrite without a backend-agnostic contract, just on a newer SSB stack
- **Pros**: still escapes `ssb-db`/`ssb-tribes@3.x`, less abstraction than a full adapter
  interface
- **Cons**: doesn't address the deeper structural risk — [`CLAUDE.md`](../../CLAUDE.md)'s "no
  canonical version of relationship data" / "no assumed central authority" principles are about
  what any decentralised backend must support, not specifically about SSB's plugin versioning;
  a same-protocol rewrite still leaves the project coupled to one implementation's release cadence
- **Why not**: `ahau-v2`'s contract-and-adapters approach was already the chosen direction before
  this evidence arrived; this ADR confirms it rather than reopening the choice

## Consequences

### Positive
- The decision to keep pursuing Leg 1/Leg 2 now has concrete, dated evidence behind it, not just
  the abstract kaupapa-principles argument in `CLAUDE.md` — useful for onboarding and for any
  future stakeholder conversation that re-litigates "why not just keep patching `ahau-monorepo`"
- Confirms that unmaintained-upstream-plugin risk (not just data-model/sovereignty concerns) is a
  real driver for adapter boundaries — worth weighing when Leg 2 adapter candidates are evaluated
  (does the candidate protocol have better-maintained core libraries than late-2010s SSB plugins?)

### Negative
- None beyond what Leg 1/Leg 2 already committed to — this ADR ratifies work already scoped, it
  doesn't add new scope

### Risks
- The three PRs (#3/#6/#7) remain open, unmerged, in-flight work in `ahau-monorepo` as of this
  writing — this ADR's evidence section is a snapshot, not a live mirror. If those PRs land or get
  abandoned, that's a fact worth noting in a future ADR or the `ahau-v2` docs, but doesn't change
  this decision (tracked via [Wayfinder ticket #12](https://github.com/ahau01/ahau-v2/issues/12),
  closed as deferred at the same time this ADR was written)
