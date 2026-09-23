# Āhau v2 — Protocol Adapters and the Agnosticism Proof

> **Leg 2** of the Āhau v2 rebuild. Begins where
> `docs/prds/ahau-v2-repo-foundation.prd.md` ends — with a runnable,
> backend-free `ahau-v2` — and attaches real protocols to it.

> **Revised 2026-09-23 — scope narrowed, not just re-planned.** This PRD's
> title and original Hypothesis describe proving backend-agnosticism via
> two independent adapters (Holochain and nostr) converging on one contract.
> Capacity constraints made that two-adapter comparison unaffordable; see
> [ADR-0003](../adr/0003-holochain-as-leg-2-protocol-candidate.md) for the
> full reasoning. The plan below now targets a single Holochain adapter
> against a capability-specific exit criterion instead. **This is a weaker
> claim than the one this document's title still describes** — read
> ADR-0003's Consequences section before treating anything below as proof of
> genuine agnosticism, because it isn't. Sections below are updated in
> place; superseded content is marked, not deleted, so the original plan
> stays legible. [ADR-0004](../adr/0004-continue-with-svelte-shell-defer-gramps-js.md)
> and [ADR-0005](../adr/0005-clean-slate-ssb-data-migration-stance.md) cover
> the frontend-framework and data-migration decisions made in the same pass.

## Preconditions

This PRD assumes Leg 1 has delivered all of the following. None of it is in
scope here.

| Delivered by Leg 1 | Why Leg 2 depends on it |
|---|---|
| `ahau-v2` repo with a running app shell | Somewhere to attach an adapter |
| Typed, backend-agnostic data-access contract | The thing an adapter implements |
| In-memory fixture reference implementation | The behaviour an adapter is compared against |
| Conformance suite | The executable definition of adapter correctness |

**Leg 1 is complete**, so these are met: 69 contract operations across 14
domains, an in-memory reference implementation, a conformance suite of 77 cases,
and a Svelte shell that consumes the contract and renders fixture data.

Two things Leg 1 delivered beyond the table are worth knowing here. The fixture
takes a capability profile, so capability negotiation can be exercised against a
deliberately weak backend before any adapter exists. And the conformance suite
fails a backend that declares a capability it does not honour, so an adapter
cannot pass by overclaiming.

## Problem

Leg 1 produced a data-access contract, but it was designed twice-blind: no real
screen consumed it and no real backend implemented it. Its only requirements
source was the existing Āhau frontend's 77 Apollo-shaped accessors, which
encode GraphQL-over-SSB assumptions that may or may not be essential to
whakapapa work.

So the central claim — that a protocol experiment now costs an adapter rather
than a rewrite — is asserted, not demonstrated. Until a real protocol pushes
back on that contract, nobody knows whether it is genuinely agnostic or merely
SSB's shape in new syntax. And the protocol question stays open in the
meantime: SSB's own author pointed at nostr and atproto, the current direction
is Holochain, and nothing yet distinguishes them on the grounds that matter for
tribal data sovereignty.

The cost of leaving this unsolved is that Āhau ports 47k LOC of features onto a
contract nobody has tested, and discovers the abstraction is wrong after the
expensive work is done.

## Evidence

- **The protocol question is contested, not settled.** Dominic Tarr (SSB's
  original author), relayed to the product owner: SSB was a proof of concept;
  future Āhau work should target something like nostr or atproto. The current
  direction — Holochain — was reached independently. *(Recorded as reported by
  the product owner; paraphrase, not a verbatim quote.)*
- **Holochain and nostr differ on exactly what whakapapa needs.** Holochain
  enforces validation rules and capability grants in the conductor; nostr has
  no native access control, is public-by-default, and treats deletion as a
  request relays may ignore. A contract that satisfies both without losing
  Āhau's permission model is not obviously possible — which is what makes the
  pair a real test.
- **The contract's requirements source is protocol-shaped** (audited
  2026-09-17): 18 data-layer modules export 77 accessors returning Apollo
  operation descriptors, carrying SSB constructs — `feedId`, `recps`,
  `authors`/`intervals`, `tombstone`, CRUT-shaped revision fields — throughout.
- **26 of 34 packages in `ahau-monorepo` carry an `ssb-` prefix**, so there is
  no existing non-SSB implementation of Āhau's data model to compare against.
- **Recorded maintenance cost** across planned and completed work in
  `ahau-monorepo`. *(Assumption — not yet quantified.)*

## Users

- **Primary**: The product owner, working solo. The trigger is needing evidence
  about which protocol fits whakapapa before committing the porting effort.
- **Secondary (downstream, not designed for yet)**: future iwi/hapū technical
  contributors, for whom the conformance suite is what makes an adapter
  contributable by someone who did not write the contract.
- **Not for**: existing Āhau users on the SSB build. They are served by the
  current repository, which continues to ship independently.

## Hypothesis

We believe **supplying protocols as adapters behind Leg 1's data-access
contract** will **reduce the cost of a protocol experiment from a rewrite to an
adapter** for **the product owner rebuilding Āhau solo**.

We'll know we're right when **one whakapapa feature — exercising group
permissions and record revision — runs end-to-end against both a Holochain
conductor and a nostr relay, with zero changes to frontend code between them**.

**Superseded 2026-09-23 ([ADR-0003](../adr/0003-holochain-as-leg-2-protocol-candidate.md)).**
The above was the original hypothesis and stays the honest target for
genuine agnosticism-proving — kept here, not deleted, because it's what a
future two-adapter pass would still be testing. The hypothesis this leg
actually validates now: **group permissions can be built on Holochain, with
enforcement genuinely delivered by the protocol's capability-grant system
rather than by patching Holochain the way SSB had to be patched (ADR-0002)**.
We'll know we're right when the group-permissions capability checkpoint
(ADR-0003) passes without protocol-level workarounds — not when a second
adapter confirms the contract wasn't shaped around the first.

## Constraints

| Constraint | Decision |
|---|---|
| Frontend stack | Svelte 5 + TypeScript, as built in Leg 1 — reconfirmed by [ADR-0004](../adr/0004-continue-with-svelte-shell-defer-gramps-js.md); Gramps.js researched and deliberately deferred, not adopted |
| Repository | `ahau-v2`, as created in Leg 1 |
| Experiment set | ~~Holochain and nostr~~ **Holochain only**, per [ADR-0003](../adr/0003-holochain-as-leg-2-protocol-candidate.md) — nostr dropped from active build on capacity grounds, not technical merit; its structural gap (no record-level access control) is documented in `docs/decentralized-backend-research.md` regardless |
| Production backend | Holochain is the leading candidate, pending the capability-specific exit criterion in ADR-0003 — no longer "undecided pending a two-adapter comparison" (there is no second adapter to compare against), but not yet locked either |
| SSB data migration | **Clean-slate for MVP**, per [ADR-0005](../adr/0005-clean-slate-ssb-data-migration-stance.md) — no automatic import from the frozen old app; a future GEDCOM path is acknowledged as a real need, not committed to a shape |
| Existing SSB repo | Continues to ship; untouched by this work |
| Visual + interaction design | Parity with current Āhau — no redesign |
| `~/projects/Holochain/ahau_holo` | A tutorial exercise. Not a starting point. Ignore. |

**Experiment backends are not automatically production candidates.** ~~nostr's
role here is to stress the contract with a protocol whose identity, permission
and persistence models differ sharply from Holochain's.~~ This reasoning
applied when nostr was still an active build target; it no longer is
(ADR-0003). Whether nostr could ever host whakapapa in production is now
moot rather than open — it isn't being pursued as a candidate, tested or
otherwise.

## Success Metrics

**Superseded 2026-09-23 ([ADR-0003](../adr/0003-holochain-as-leg-2-protocol-candidate.md)).**
The comparison-based rows below (backends running the slice, adapter #2
revisions, effort ratio) can no longer be measured — there is no adapter #2.
They're kept, struck through, as a record of what genuine agnosticism-proving
would have measured. The rows that still apply to a single adapter are kept
live. The real test this leg now runs is the capability-specific exit
criterion in ADR-0003 (does Holochain deliver *enforced* group-permissions
without protocol-level workarounds) — not a metric on this table, since it's
a pass/fail design question, not a count.

| Metric | Target | How measured |
|---|---|---|
| ~~Backends running the slice behind one contract~~ | ~~2~~ | Not pursued — one adapter only (ADR-0003) |
| ~~Frontend files changed when swapping adapters~~ | ~~0~~ | Not measurable without a second adapter to swap to |
| Contract revisions forced by the Holochain adapter | Recorded, whatever it is — flag any revision that reads as "make this fit Holochain" rather than "this was underspecified for any backend" | Contract revision history during the Holochain build |
| ~~Contract revisions forced by adapter #2~~ | ~~Materially fewer than adapter #1~~ | Not measurable — no adapter #2 |
| Conformance-suite changes forced by the real adapter | Recorded — the measure of how well Leg 1's blind contract held, even single-handedly | Suite revision history |
| ~~Effort ratio, adapter #2 : adapter #1~~ | ~~Substantially below 1:1~~ | Not measurable — no adapter #2 |
| Capabilities the Holochain adapter declines rather than fakes | Every gap explicit | Capability negotiation records |
| Group-permissions capability checkpoint | Enforced, without protocol-level workarounds | Manual evaluation against ADR-0003's exit criterion |
| Design parity on ported screens | TBD — needs a parity definition | Method defined in `docs/design-parity.md`; not yet applied |

The struck-through rows were "the real test" in the original plan — this is
exactly the gap ADR-0003's Consequences section names as a materially weaker
claim, not a hidden one.

## Scope

**Superseded 2026-09-23 ([ADR-0003](../adr/0003-holochain-as-leg-2-protocol-candidate.md)).**

**MVP** (revised) — Group permissions (kaitiaki/member removal, at least one
enforced per-content-type permission — full functional shape in `docs/plans/
group-permissions.md`) working end-to-end on a real Holochain adapter through
the existing Svelte shell. Narrow and deep: this one slice working for real
on real infrastructure, not a broader set of features half-working. Everything
else in the 14-domain contract stays contract-only/stubbed until after this
MVP ships. Chosen because it's the feature this rewrite's own justifying
narrative (ADR-0002) is built on — explicitly *not* claimed as the most
kaupapa-critical risk area (that's the relationship-assertion/non-canonical-
data model in `CLAUDE.md`, which this feature doesn't exercise) — worth not
conflating the two later.

~~One whakapapa feature working end-to-end against **both** a Holochain
conductor and a nostr relay, through Leg 1's contract, with no frontend code
differing between the two.~~

~~The feature chosen must exercise group permissions and record revision, not a
trivial public read. Those are where the two protocols diverge most, and a
slice that avoids them would pass on both while proving nothing.~~ Still true
for the group-permissions capability checkpoint itself (ADR-0003) — but note
Prototype 1 on the roadmap below is deliberately a trivial read, run *before*
the checkpoint to prove the pipeline wires up at all. It is not a substitute
for the checkpoint and must not be reported as if it were.

**Out of scope**

- **Everything Leg 1 delivers** — the repo, shell, contract, fixtures and
  conformance suite are inputs here, not work. If they need revision, that is a
  finding to record, not a milestone to absorb.
- **Choosing the production backend** — Holochain is the leading candidate
  pending its exit criterion (ADR-0003), not a locked choice, but there is no
  longer a downstream comparison step that makes the call either.
- **SSB data migration** — existing users' whakapapa is not carried over.
  Resolved, not just flagged: [ADR-0005](../adr/0005-clean-slate-ssb-data-migration-stance.md).
- **Desktop and mobile shells** — no Electron, no Cordova. Web-first only.
- **Design or UX changes** — no redesign smuggled in alongside the re-platform.
- **A second adapter (nostr or otherwise)** — ~~atproto, a conventional server
  and a reference SSB adapter are plausible later, and the contract should not
  preclude them, but none are built here~~. Still true, but now also includes
  nostr itself, previously in scope as adapter #2 (ADR-0003).
- **Feature cut list / broader feature porting** — the original Milestones 3–4
  below (deciding which features survive into v2, porting that full set) are
  deferred beyond this MVP entirely, not just resequenced. Broadening comes
  after this one flagship slice proves the pipeline, not alongside it.

## Delivery Milestones

**Superseded 2026-09-23 ([ADR-0003](../adr/0003-holochain-as-leg-2-protocol-candidate.md)/[ADR-0004](../adr/0004-continue-with-svelte-shell-defer-gramps-js.md)).**
Original four-milestone table (two-adapter comparison, then broad feature
porting) kept below for record, replaced by the milestone-level roadmap that
follows it. This is phase-level sequencing, deliberately not committed to a
sprint calendar — sprint planning stays a separate, living activity.

~~| # | Milestone | Outcome | Status | Plan |~~
~~|---|---|---|---|---|~~
~~| 1 | Adapter #1 — Holochain | The slice reads and writes through a real conductor, including permissions and revision — the contract meets a real protocol for the first time | pending | — |~~
~~| 2 | Adapter #2 — nostr | The same slice runs through relays with zero frontend changes — the hypothesis is tested here, and this is the milestone that must not be dropped | pending | — |~~
~~| 3 | Feature cut list | A decided, written list of which Āhau features survive into v2 — made with real porting cost known rather than estimated | pending | — |~~
~~| 4 | Surviving feature set ported | The cut list is complete on a chosen production backend — v2 is a usable application | pending | — |~~

### Current roadmap (milestone-level)

| # | Milestone | Outcome | Status | Depends on | Plan/spec |
|---|---|---|---|---|---|
| 0 | Contract fixes | Friction findings #12 (a refused write has no representation) and #13 (no "current group" concept) resolved — both load-bearing for group permissions | pending | — | `docs/contract-friction.md` |
| 1 | Prototype — pipeline proof | One trivial read-only operation runs through a real Holochain adapter into the existing Svelte shell — first time this repo's pipeline touches a real protocol; the tangible near-term demo for stakeholders | pending | — | — |
| 2 | Holochain capability checkpoint | A real group-permissions capability attempt on Holochain, evaluated against ADR-0003's exit criterion (enforced permissions, no protocol-level workarounds) | pending | Milestone 0 | ADR-0003 |
| 3 | Flagship feature — group permissions | Kaitiaki/member removal and at least one enforced per-content-type permission, built for real end-to-end, only once Milestone 2 passes | pending | Milestone 2 | `docs/plans/group-permissions.md` |
| 4 | MVP | Milestone 3's slice working end-to-end on real infrastructure. Everything else in the 14-domain contract stays stubbed until after | pending | Milestone 3 | — |

Sync/offline-then-conflict validation (CLAUDE.md's high-risk-area rule) is
explicitly deferred to a second pass after Milestone 2 passes — a deliberate
scope cut recorded in ADR-0003, not an oversight. Broader feature-cut-list
work (the original Milestones 3–4 above) is deferred beyond Milestone 4,
not resequenced within it.

## Open Questions

- [x] **Can one contract serve both protocols without flattening to their
      intersection?** Moot as originally posed — narrowed 2026-09-23 to one
      protocol (ADR-0003), so there's no second protocol to flatten against.
      The underlying risk (a contract secretly shaped by its one adapter)
      is *not* resolved, just unmitigated by a different mechanism — see
      ADR-0003's Consequences and Risks sections.
- [x] **Could nostr ever host whakapapa in production?** Moot, not answered
      — nostr isn't being pursued as a candidate at all (ADR-0003), so the
      question doesn't currently need an answer either way.
- [ ] **Does the whakapapa data model survive protocol change at all?** Āhau's
      graph is built on SSB CRUT / append-only feed semantics. Which guarantees
      are essential versus incidental to SSB is still unknown; the Holochain
      capability checkpoint (Milestone 2 in the current roadmap) is the first
      place it gets answered with evidence.
- [ ] **How much contract revision is acceptable before "agnostic" is
      disproven?** Still open, and arguably sharper now: with no second
      adapter to cross-check against, this threshold is the only remaining
      check against the contract quietly becoming Holochain-shaped. Should be
      named before Milestone 2, not argued about during it.
- [x] **What decides the production backend, and on what evidence?** Resolved
      2026-09-23: the capability-specific exit criterion in
      [ADR-0003](../adr/0003-holochain-as-leg-2-protocol-candidate.md) — does
      Holochain's capability-grant system deliver enforced group-permissions
      without protocol-level workarounds. Not a two-adapter comparison, as
      originally planned; see that ADR's Consequences for what's weaker about
      this answer.
- [x] **What replaces Vuetify 2?** Settled during Leg 1: a hybrid — headless
      primitives for the handful of components where accessibility is expensive
      to get right, hand-built and token-driven for the rest. Proven on one
      dialog, with focus trapping, escape and focus restore verified in a
      browser.

      The cost is also smaller than this PRD assumed. 869 of the old UI's 1,871
      Vuetify tags are grid primitives that CSS replaces natively, so the real
      surface is roughly 37 components, not 76.
- [x] **Is abandoning existing users' SSB data acceptable?** Resolved
      2026-09-23: [ADR-0005](../adr/0005-clean-slate-ssb-data-migration-stance.md)
      — clean-slate for MVP, old app stays frozen and available, no automatic
      import. A real, previously-requested GEDCOM need is acknowledged but not
      committed to a shape, pending someone proving SSB group-decryption is
      usable outside the app that built it.

## Risks

**Superseded 2026-09-23 ([ADR-0003](../adr/0003-holochain-as-leg-2-protocol-candidate.md)).**
Rows that depended on a second adapter are updated in place, not removed —
several describe risks that are now *certainties*, which is itself worth
seeing plainly rather than quietly dropping the row.

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Contract flattens to the weakest backend, silently discarding Āhau's permission and sovereignty model | High | Very High | Treat capability negotiation as a contract requirement, not an optimisation. The group-permissions capability checkpoint must exercise real permissions so the gap appears there, not after porting. |
| Leg 1's twice-blind contract proves substantially wrong at the Holochain checkpoint, and this leg absorbs a contract rewrite it did not budget for | Medium–High | High | Name the acceptable revision threshold before starting (still open — see Open Questions). Exceeding it is a finding that sends work back to Leg 1, not a task to quietly swallow here. |
| Wrong abstraction — a contract shaped by whichever adapter was built first, agnostic in name only | High | High | **No longer mitigated by a second adapter** (ADR-0003 dropped it). Reduced mitigation: track every contract revision forced by the Holochain build and flag any that read as "make this fit Holochain" rather than "this was underspecified" — a real but weaker check than the original. |
| ~~Adapter #2 gets dropped under time pressure, leaving agnosticism permanently unvalidated~~ | ~~Medium–High~~ | ~~High~~ | **This has happened, deliberately, not under silent time pressure.** ADR-0003 records it as a considered trade, not a risk to mitigate going forward — see that ADR's Consequences (Negative) for the resulting weaker claim, stated explicitly rather than discovered later. |
| The slice is chosen for ease and avoids permissions or revision, so nothing is learned | Medium | Very High | Slice selection is a gate on the capability checkpoint (Milestone 2), not an implementation detail. Note: Milestone 1 (the pipeline-proof prototype) is deliberately an easy slice — that's fine, because it isn't the checkpoint. Don't let the prototype's success be reported as if it cleared this bar; it doesn't. |
| Framework rewrite scope exceeds solo capacity once broader feature porting starts — 47k LOC of Vue with no direct equivalent in Svelte, by a capacity-constrained team | High | High | The narrow/deep MVP (one flagship feature, everything else stubbed) is the control now, not a future cut-list milestone. Broader porting stays explicitly out of scope until after MVP ships. |
| ~~Two adapters double the integration surface before any feature ships to anyone~~ | — | — | No longer applicable — one adapter only. |
| "Design parity" is unfalsifiable without a parity definition, so it never feels done | Medium | Medium | Method defined in `docs/design-parity.md`: screenshot comparison against the Vue app in `ahau-monorepo`, captured once and kept. Not yet applied — no screens ported. `ahau-styles` proved unreliable during Leg 1 (life-status colours attributed backwards) and is reconfirmed in ADR-0004 as needing verification against the shell's own tokens, not assumed correct. |

---
*Status: DRAFT — requirements only, revised 2026-09-23 per ADR-0003/0004/0005.
Implementation planning for Milestone 0 pending via /plan.*
