# Āhau v2 — Protocol Adapters and the Agnosticism Proof

> **Leg 2** of the Āhau v2 rebuild. Begins where
> `.claude/prds/ahau-v2-repo-foundation.prd.md` ends — with a runnable,
> backend-free `ahau-v2` — and attaches real protocols to it.

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

## Constraints

| Constraint | Decision |
|---|---|
| Frontend stack | Svelte 5 + TypeScript, as built in Leg 1 |
| Repository | `ahau-v2`, as created in Leg 1 |
| Experiment set | Holochain and nostr |
| Production backend | **Deliberately undecided.** This leg produces the evidence; it does not make the call. |
| Existing SSB repo | Continues to ship; untouched by this work |
| Visual + interaction design | Parity with current Āhau — no redesign |
| `~/projects/Holochain/ahau_holo` | A tutorial exercise. Not a starting point. Ignore. |

**Experiment backends are not automatically production candidates.** nostr's
role here is to stress the contract with a protocol whose identity, permission
and persistence models differ sharply from Holochain's. Whether it could ever
host whakapapa in production is a separate question, raised below, and the
answer does not affect its usefulness as a test adapter.

## Success Metrics

| Metric | Target | How measured |
|---|---|---|
| Backends running the slice behind one contract | 2 | End-to-end run against each |
| Frontend files changed when swapping adapters | **0** | Diff between the two configurations |
| Contract revisions forced by adapter #1 | Recorded, whatever it is | Contract revision history during Milestone 1 |
| Contract revisions forced by adapter #2 | Materially fewer than adapter #1 | Contract revision history during Milestone 2 |
| Conformance-suite changes forced by real adapters | Recorded — the measure of how well Leg 1's blind contract held | Suite revision history |
| Effort ratio, adapter #2 : adapter #1 | Substantially below 1:1 | Elapsed build time per adapter |
| Capabilities a backend declines rather than fakes | Every gap explicit | Capability negotiation records |
| Design parity on ported screens | TBD — needs a parity definition | TBD — comparison method not yet chosen |

Rows two and four are the real test. Everything else can pass while the
abstraction is still secretly shaped by whichever backend was built first.

## Scope

**MVP** — One whakapapa feature working end-to-end against **both** a Holochain
conductor and a nostr relay, through Leg 1's contract, with no frontend code
differing between the two.

The feature chosen must exercise group permissions and record revision, not a
trivial public read. Those are where the two protocols diverge most, and a
slice that avoids them would pass on both while proving nothing.

**Out of scope**

- **Everything Leg 1 delivers** — the repo, shell, contract, fixtures and
  conformance suite are inputs here, not work. If they need revision, that is a
  finding to record, not a milestone to absorb.
- **Choosing the production backend** — this leg produces the evidence for that
  decision. Making it is downstream.
- **SSB data migration** — existing users' whakapapa is not carried over.
  *Significant commitment; flagged in Open Questions.*
- **Desktop and mobile shells** — no Electron, no Cordova. Web-first only.
- **Design or UX changes** — no redesign smuggled in alongside the re-platform.
- **Adapters beyond Holochain and nostr** — atproto, a conventional server and
  a reference SSB adapter are plausible later, and the contract should not
  preclude them, but none are built here.

## Delivery Milestones

<!-- Business outcomes, not engineering tasks. /plan turns each into a plan. -->
<!-- Status: pending | in-progress | complete -->

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Adapter #1 — Holochain | The slice reads and writes through a real conductor, including permissions and revision — the contract meets a real protocol for the first time | pending | — |
| 2 | Adapter #2 — nostr | The same slice runs through relays with zero frontend changes — **the hypothesis is tested here, and this is the milestone that must not be dropped** | pending | — |
| 3 | Feature cut list | A decided, written list of which Āhau features survive into v2 — made with real porting cost known rather than estimated | pending | — |
| 4 | Surviving feature set ported | The cut list is complete on a chosen production backend — v2 is a usable application | pending | — |

Milestone 3 sits after the adapters deliberately. Leg 1 deferred the cut list
on the grounds that the cost of porting a real feature area should inform it;
Milestones 1 and 2 are what produce that cost.

## Open Questions

- [ ] **Can one contract serve both protocols without flattening to their
      intersection?** Holochain enforces validation and capability grants in the
      conductor; nostr has none. If the contract can only express what both
      support, Āhau loses its permission model. It likely needs capability
      negotiation — backends declaring what they cannot do — rather than a
      common denominator. This is the central design question of the project.
- [ ] **Could nostr ever host whakapapa in production?** Public-by-default
      storage on third-party relays, application-level encryption, and deletion
      requests relays may ignore sit badly with tribal data sovereignty. If the
      answer is no, that is acceptable — its role here is to stress the
      contract — but the answer should be written down before anyone mistakes
      it for a candidate.
- [ ] **Does the whakapapa data model survive protocol change at all?** Āhau's
      graph is built on SSB CRUT / append-only feed semantics. Which guarantees
      are essential versus incidental to SSB is still unknown; Milestone 1 is
      the first place it gets answered with evidence.
- [ ] **How much contract revision is acceptable before "agnostic" is
      disproven?** Some revision under a real adapter is healthy. A rewrite is
      not. The threshold should be named before Milestone 1, not argued about
      during it.
- [ ] **What decides the production backend, and on what evidence?** This leg
      exists to inform that call. Naming the deciding evidence in advance stops
      deferral from becoming indecision.
- [x] **What replaces Vuetify 2?** Settled during Leg 1: a hybrid — headless
      primitives for the handful of components where accessibility is expensive
      to get right, hand-built and token-driven for the rest. Proven on one
      dialog, with focus trapping, escape and focus restore verified in a
      browser.

      The cost is also smaller than this PRD assumed. 869 of the old UI's 1,871
      Vuetify tags are grid primitives that CSS replaces natively, so the real
      surface is roughly 37 components, not 76.
- [ ] **Is abandoning existing users' SSB data acceptable?** Recorded as out of
      scope. Needs explicit confirmation, as it is effectively irreversible.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Contract flattens to the weakest backend, silently discarding Āhau's permission and sovereignty model | High | Very High | Treat capability negotiation as a contract requirement, not an optimisation. The slice must exercise permissions so the gap appears in Milestone 1–2, not after porting. |
| Leg 1's twice-blind contract proves substantially wrong at Milestone 1, and this leg absorbs a contract rewrite it did not budget for | Medium–High | High | Name the acceptable revision threshold before starting. Exceeding it is a finding that sends work back to Leg 1, not a task to quietly swallow here. |
| Wrong abstraction — a contract shaped by whichever adapter was built first, agnostic in name only | High | High | Build adapter #2 immediately after #1, before any feature porting. The revision-count metrics exist to detect this. |
| Adapter #2 gets dropped under time pressure, leaving agnosticism permanently unvalidated | Medium–High | High | Milestone 2 is the hypothesis test, not a nice-to-have. If it is cut, this PRD's central claim is unproven and should be restated as an assumption. |
| The slice is chosen for ease and avoids permissions or revision, so both adapters pass and nothing is learned | Medium | Very High | Slice selection is a gate on Milestone 1, not an implementation detail. A slice both protocols handle trivially is the wrong slice. |
| Framework rewrite scope exceeds solo capacity at Milestone 4 — 47k LOC of Vue reimplemented in Svelte, by one person | High | High | Milestone 3's cut list is the primary control, and it now has real cost data behind it. Treat the feature set as the budget, not the deadline. |
| Two adapters double the integration surface before any feature ships to anyone | Medium | Medium | Both adapters serve one slice, not a growing set, until Milestone 4. |
| "Design parity" is unfalsifiable without a parity definition, so Milestone 4 never feels done | Medium | Medium | Method now defined in `docs/design-parity.md`: screenshot comparison against the Vue app in `ahau-monorepo`, captured once and kept. Not yet applied — no screens ported. Note that `ahau-styles` proved unreliable during Leg 1 (life-status colours attributed backwards), so tokens are verified against the application source, not adopted. |

---
*Status: DRAFT — requirements only. Implementation planning pending via /plan.*
