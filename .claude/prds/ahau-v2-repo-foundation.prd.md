# Āhau v2 — Repo Foundation

> Leg 1 of the Āhau v2 rebuild. Ends where a runnable, backend-free `ahau-v2`
> exists. Protocol adapters and the backend-agnosticism proof are Leg 2.

## Problem

To evaluate any successor protocol for Āhau, two things must exist: a frontend
that can host a backend adapter, and a way to tell whether an adapter actually
satisfies what the frontend needs. Neither exists today. There is no v2
repository, no data-access contract, and no means of testing a backend against
the application's real requirements. The current frontend does state those
needs — 18 helper modules export 77 accessor functions covering 103 of its 110
`gql` templates — but they are untyped Apollo operation descriptors bound to
one transport, and nothing declares them as a contract a different backend
could satisfy.

The cost of leaving this unsolved is that every protocol experiment requires
building a complete application against that protocol first. That price is high
enough that no experiment gets run, and the successor protocol gets chosen by
inertia rather than evidence.

## Evidence

Carried forward from the Āhau v2 framing work (2026-09-17); unchanged by this
leg's narrower scope.

- **Direct assessment from Dominic Tarr (SSB's original author), relayed to the
  product owner**: SSB was a proof of concept; future Āhau work should target
  something like nostr or atproto. *(Recorded as reported by the product owner;
  paraphrase, not a verbatim quote.)*
- **Measured coupling** (audited in `ahau` and `ahau-monorepo`, 2026-09-17):
  - 26 of 34 monorepo packages carry an `ssb-` prefix — 76% of the backend is
    protocol-specific.
  - 110 `gql` template literals across 24 UI files.
  - 18 of those files are data-layer modules (`store/modules/*/apollo-helpers.*`,
    `lib/*-helpers.mjs`) holding 103 templates and exporting 77 accessor
    functions — an undeclared, Apollo-shaped proto-repository layer, already
    split by domain.
  - The remaining 7 templates leak into 4 components, `main.js` and a mixin.
  - No typed contract, and no boundary a non-GraphQL backend could implement.
  - UI is ~47,300 LOC across 311 files.
- **Toolchain fragility**: root/`ui`/`desktop` require Node 18, while `mobile`
  and `mobile/src/nodejs-project` pin Node 12.19.0 — no single environment can
  build the whole product.
- **First-hand build and run failures** experienced by the product owner.
- **Upstream signals** of Scuttlebutt ecosystem stall, observed by the product
  owner.

## Users

- **Primary**: The product owner, working solo. The trigger is needing a place
  to build v2 and a definition of what a backend must provide, before
  committing effort to any protocol.
- **Secondary (downstream, not designed for yet)**: whoever writes the first
  protocol adapter in Leg 2 — in practice the same person, but the conformance
  suite is what makes that work possible for anyone else.
- **Not for**: existing Āhau users on the SSB build. They are served by the
  current repository, which continues to ship independently.

## Hypothesis

We believe **a standalone `ahau-v2` repo containing a typed data-access
contract, a fixture reference implementation, and a conformance suite** will
**make backend evaluation possible without building a whole application per
protocol** for **the product owner**.

We'll know we're right when **the conformance suite runs green against the
fixture implementation, and its operation coverage of the existing Āhau
application's data access is complete and explicitly triaged — so a Leg 2
adapter can be developed against a known, executable target**.

The stronger test — that a real adapter passes the suite without frontend
changes — is deliberately out of reach this leg. It is Leg 2's hypothesis.

## Constraints

Product-owner decisions, fixed before planning:

| Constraint | Decision |
|---|---|
| Frontend stack | Svelte 5 + TypeScript (not a Vue port) |
| Repository | New standalone repo, `ahau-v2` |
| Backend protocol | None wired this leg. The repo must not assume one. |
| UI breadth this leg | App shell, routing, theming. Screens are placeholders. |
| Data with no backend | In-memory fixtures implementing the contract |
| Feature cut list | Deferred entirely to Leg 2 |
| Existing SSB repo | Continues to ship; untouched by this work |
| Visual language | Āhau's existing design — no redesign |
| `~/projects/Holochain/ahau_holo` | A tutorial exercise. Not a starting point. Ignore. |

**Requirements source**: because no cut list and no real screens exist this
leg, the contract's requirements come from the *existing* Āhau application —
its 77 exported accessors are a complete, working statement of what the
frontend needs from a backend, already grouped by domain. Leg 2's cut list will
narrow that surface; it does not define it.

**Starting point, not a source of truth**: `~/projects/ahau-styles` holds a
framework-independent extraction of colours, typography tokens, fonts and icons,
separated from Vue/Vuetify. Earlier revisions of this PRD called it the visual
source of truth. It is not: it is a proof of concept that still needs
correction, so its values must be verified against the running Vue application
before anything is built on them.

The tribal theming it carries is separately unverified. The `are-are` theme was
written before migration, its assets are of unconfirmed origin, and the user
need behind it is unconfirmed. It should not be treated as a settled
requirement, and whether assets of unclear provenance belong in a whakapapa
application is a question for the community rather than for this document.

## Success Metrics

Measured on completion. "How measured" records what was actually run, not what
was intended.

| Metric | Target | Result | How measured |
|---|---|---|---|
| Data-access accessors catalogued and triaged | 77 of 77, plus 7 leaked templates | **met** — 77 accessors, 6 leakage decisions | `inventory-data-access.mjs --ci` |
| Conformance suite against fixture implementation | Green | **met** | `npm test` |
| Contract operations covered by the conformance suite | 100% of kept operations | **met** — 69 of 69 | `check-conformance-coverage.mjs --ci` |
| SSB dependencies in `ahau-v2` | 0 | **met** — and zero runtime dependencies of any kind | Dependency tree inspection |
| Production files aware of transport, outside the adapter boundary | 0 | **met** — 2 matches, both test files that must name protocols | Source scan with comments stripped |
| Node environments required to build | 1 | **met** — Node 20, pinned | `.nvmrc` and `engines` |
| Fresh clone boots the shell | Yes | **met** — clone, install, typecheck, build | Fresh clone into a temp directory |
| Time to first successful run, fresh clone | TBD — needs a second person | **still unvalidated** — fast for its author, which proves nothing | TBD |
| Design parity on ported screens | TBD — needed a definition | **method defined**, not yet applied — no screens ported | `docs/design-parity.md` in `ahau-v2` |

The last two are deliberately not claimed. Onboarding time measured by the
person who wrote the repo is worthless, and parity cannot be judged before a
screen is ported.

## Scope

**MVP** — A standalone `ahau-v2` repository that boots from a fresh clone on a
single Node version, renders an app shell with routing and Āhau's visual
language, and contains a typed, backend-agnostic data-access contract with an
in-memory fixture implementation and an executable conformance suite that a
future adapter must satisfy. No protocol is wired to it.

**Out of scope**

- **Any protocol adapter** — Holochain, nostr, atproto, SSB. Deferred to Leg 2;
  wiring one is what blew this leg's scope out previously.
- **The feature cut list and product-surface decisions** — deferred to Leg 2,
  where the cost of porting a real feature area will inform them.
- **Porting screens** — only the shell and navigation are built. The 47k LOC of
  Vue screens stay where they are.
- **SSB data migration** — existing users' whakapapa is not carried over.
  *Significant commitment; flagged in Open Questions.*
- **Desktop and mobile shells** — no Electron, no Cordova. Web-first only.
- **Design or UX changes** — no redesign smuggled in alongside the re-platform.

## Delivery Milestones

<!-- Business outcomes, not engineering tasks. /plan turns each into a plan. -->
<!-- Status: pending | in-progress | complete -->

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Data-access inventory | Every operation the existing Āhau app performs is catalogued and triaged — the frontend's real requirements are declared and triaged rather than implicit in 18 Apollo-shaped modules | complete | `.claude/plans/ahau-v2-repo-foundation.plan.md` |
| 2 | Data-access contract v0 | Those requirements are expressed as a typed, backend-agnostic contract — the definition of what any backend must provide | complete | `.claude/plans/ahau-v2-contract-v0.plan.md` |
| 3 | `ahau-v2` shell runs | A fresh clone boots, routes, and renders in Āhau's visual language on one Node version — there is somewhere to build v2 | complete | `.claude/plans/ahau-v2-shell.plan.md` |
| 4 | Fixture reference implementation | The contract is satisfied in memory and the shell runs on realistic whakapapa data — the contract is demonstrably implementable | complete | `.claude/plans/ahau-v2-fixtures.plan.md` |
| 5 | Conformance suite | Adapter correctness becomes executable rather than described — Leg 2 has a target to build against | complete | `.claude/plans/ahau-v2-conformance-suite.plan.md` |

## Open Questions

- [ ] **How do we separate essential requirements from SSB artefacts?** The
      contract's only requirements source is a GraphQL surface built for SSB.
      Some of those 110 operations encode append-only feed and CRUT semantics
      that a different protocol would express differently — or not need at all.
      Triage criteria for Milestone 1 are undecided, and this determines
      whether the contract is genuinely agnostic or SSB-shaped in new syntax.
- [ ] **Is the contract domain-shaped or transport-shaped?** Derived directly
      from GraphQL operations it will resemble a query API; derived from what
      whakapapa work actually requires it would look different. The choice
      affects how much a Leg 2 adapter has to translate.
- [ ] **What replaces Vuetify 2?** ~47k LOC of UI is built on a component
      library with no Svelte equivalent. A shell-only leg does not answer this,
      so the project's largest unknown cost stays unknown after this leg
      completes. When is it confronted?
- [ ] **How does the conformance suite express capabilities a backend cannot
      provide?** Protocols differ on permissions, deletion and revision. A
      suite that demands every capability will fail honest adapters; one that
      demands too little will pass useless ones.
- [ ] **When is the contract revisited against reality?** It will be written
      without a real screen consuming it or a real backend implementing it.
      Naming the checkpoint now prevents it from calcifying.
- [ ] **Is abandoning existing users' SSB data acceptable?** Recorded as out of
      scope. Needs explicit confirmation, as it is effectively irreversible.
- [ ] **Licence and repo home for `ahau-v2`?** Current repo is AGPL-3.0 under
      Āhau Ltd. on GitLab. Ownership and licensing of a rebuild are unsettled.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Contract is designed twice-blind — no real screen consumes it, no real backend implements it — and proves wrong in Leg 2 | High | High | Treat contract v0 as explicitly provisional and expect revision. Milestone 1's triage should record *why* each operation exists, so Leg 2 can re-derive rather than re-guess. |
| Conformance suite over-fits the fixtures — tests pass because the same person wrote both to agree | High | Medium | Derive test cases from the inventory's recorded requirements, not from fixture behaviour. A test the fixture passes trivially is evidence of nothing. |
| Contract transcribes SSB-shaped GraphQL operations, importing the old data model into the new system | Medium–High | High | Milestone 1 is triage, not transcription. Each operation is justified by a user-facing need or dropped. |
| Vuetify-to-Svelte component gap is deferred again, leaving the project's biggest cost unknown | High | Medium | Accepted for this leg. Named as an Open Question with a checkpoint, so it is a decision rather than a drift. |
| Shell-only delivery feels like progress while every hard problem remains untouched | Medium | Medium | The conformance suite is the real deliverable; the shell is its host. Judge the leg on Milestones 1, 2 and 5 — not on a running app. |
| Scope creeps back toward wiring a backend "just to check it works" | Medium | Medium | Out of scope above is explicit. Wiring a protocol is Leg 2's opening move, and doing it early re-creates the problem this rescope solved. |
| Maintaining the SSB repo in parallel drains capacity | Medium | Low–Medium | Define what "keeps shipping" means for the old repo — security fixes only, or continued features. Unresolved. |

---
*Status: COMPLETE. All five milestones delivered in https://github.com/ahau01/ahau-v2*

Leg 2 continues in `ahau-v2-frontend-rebuild.prd.md`. Thirteen contract findings
are recorded in `docs/contract-friction.md` in the `ahau-v2` repository; eleven
are resolved, and two remain open - a refused write has no representation, and
the contract has no notion of the group you are currently in. Both were found by
the first UI consumer.
