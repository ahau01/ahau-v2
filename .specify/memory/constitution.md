<!--
Sync Impact Report (scratch — remove before committing)
- Version change: (unratified template) → 1.0.0
- Modified principles: none (first ratification); all placeholders replaced
- Added principles:
  I. Data Stays With the Person and Their Whānau (new, from amendment input)
  II. No Canonical Version of Relationship or Identity Data (from CLAUDE.md rule 1)
  III. Relationships Are Assertions From a Source (from CLAUDE.md rule 2)
  IV. No Assumed Central Authority (from CLAUDE.md rule 3)
  V. Identity Is a Key, Not a Session (from CLAUDE.md rule 4)
- Added sections: Architecture Constraints (from CLAUDE.md "High-risk areas");
  Development Workflow (from CLAUDE.md "Working norms"); Governance
- Removed sections: none
- Follow-up TODOs:
  - "Fully encrypted" private archives is stated as a requirement (Principle I).
    ADR-0007 currently relies on private source-chain entries, not encryption,
    and rejected in-entry encryption for first launch. An ADR is needed on
    encryption at rest for private entries before any user-facing copy claims it.
  - CLAUDE.md says "No Holochain code exists yet"; README says first launch on
    Holochain is done (#14). CLAUDE.md needs a refresh (out of scope here).
-->
# Āhau v2 Constitution

## Core Principles

### I. Data Stays With the Person and Their Whānau

Āhau is a distributed application. Data a person enters is stored on their own
device and on their whānau network, and nowhere else.

- Āhau (the company) MUST NOT run, depend on, or add any server, database,
  relay, analytics sink, backup service, or log collector that receives or
  keeps a record of information people put into Āhau.
- Information marked private MUST NOT leave the author's device unless they
  choose to share it. On Holochain that means a private entry on the author's
  source chain (ADR-0007), never a public entry published to the DHT.
- Private archives MUST be encrypted, so a lost device or a peer holding its
  data cannot read them. Any feature that claims encryption MUST point to the
  ADR and the test that show it.
- Public data MUST be published only to the whānau network (the DHT of the
  relevant Holochain app). It MUST NOT be copied to infrastructure owned by
  Āhau the company.
- Nothing published can be erased (removal is retraction —
  `docs/contract-decisions.md` §1). Any design that publishes personal data
  MUST say why publishing is necessary and what a later retraction can and
  cannot undo.

**Rationale**: Data sovereignty is the reason Āhau exists. A company server is
both a single point of compromise and a claim of custody over whakapapa that
belongs to whānau. Because publishing can't be undone, the time to protect data
is before it is published.

### II. No Canonical Version of Relationship or Identity Data

Different whānau, hapū, or people can hold genuinely conflicting accounts of
the same relationship, and none is automatically correct.

- Code MUST NOT use last-write-wins, a single source of truth, or
  overwrite-on-conflict for relationship or identity data. This includes sync,
  entry updates, and links on Holochain.
- When versions conflict, all of them MUST be kept. Choosing which one to show
  is a render-layer decision, made per viewer.
- If a task seems to need a canonical value, the contributor MUST stop and
  flag it rather than pick one.

**Rationale**: Contested authority is real and has to be kept, not erased. If
the system quietly picks a winner, it erases an account.

### III. Relationships Are Assertions From a Source

A relationship is modelled as "source X asserts relationship Y", and several
sources' assertions coexist.

- Zomes, client modules, and the shell MUST NOT simplify relationships into
  editable graph edges or overwrite-on-write records, for efficiency or any
  other reason.
- Any change touching relationship storage MUST include an explicit note on
  how it keeps multi-source assertions.
- A source MUST be able to retract only its own assertions. It MUST NOT be able
  to retract another source's.

**Rationale**: Every other piece of software models these as edges, so drifting
toward an edge is the most likely regression in this codebase.

### IV. No Assumed Central Authority

No node, agent, or server holds anyone's canonical copy.

- Requests to add a "primary" database, centralise storage, or treat one node
  or agent as the source of truth MUST be flagged, not built.
- Permissions MUST be enforced where every peer checks them, in Holochain
  validation rules and capability grants. They MUST NOT be enforced only in the
  UI or in a client-side check.

**Rationale**: External stakeholders asked for central authority on the
original Āhau. It reads as a reasonable requirement, but it breaks the
architecture.

### V. Identity Is a Key, Not a Session

On Holochain, identity is an agent's public key.

- Code MUST NOT add email/password login, sessions, JWT, or OAuth to a zome,
  client, or the shell without first showing how the pattern maps onto
  key-based identity.
- Code MUST NOT treat a device holding a key as "a logged-in user". Designs
  MUST account for one person using several devices.

**Rationale**: Session-based assumptions pass single-device testing and then
fail once a person has more than one device.

## Architecture Constraints

- **Holochain is not a database.** DHT reads can be stale or incomplete, and
  nothing is ever erased. Shell and client code MUST NOT treat a zome call like
  a database query.
- **Zome calls stay in per-feature client modules.** Svelte components MUST NOT
  call Holochain directly.
- **Permissions hold at sync time and cache time**, not just read time. A
  revoked member's already-synced local data is a real leak vector, and
  designs MUST address it.
- **Merge-sensitive mutations** (e.g. "update" as replace-the-latest) MUST be
  reviewed for whether they erase a source's assertion. Type-checking does not
  show a design is merge-safe.
- **The frozen contract is not the spec.** `src/contract/` is a checklist of
  what the old app could do. Holochain code MUST NOT copy it
  operation-for-operation (ADR-0006). The spec is the capability inventory
  (#13).

## Development Workflow

- **Name the principle first.** When a change touches Principles I–V, the PR
  description (or the agent's reply) MUST name the principle and the approach
  taken before any code is written.
- **Flag, don't decide.** Work outside a task's explicit scope, including
  "helpful" cleanup next to the change, goes in the PR description, not the
  diff.
- **Small changes get full scrutiny.** A rename or entry-shape tweak that
  touches sync, permissions, privacy, or relationship storage is reviewed as
  seriously as a large change.
- **Tests assert real behaviour.** Sync, conflict, permission, and privacy
  rules MUST be tested against a real conductor (Tryorama or Sweettest), not
  mocked sync state. Conflict handling MUST be covered by a
  two-devices-offline-then-sync test.
- **Merge gate for high-risk areas.** Before AI-generated code in sync,
  permissions, privacy, or relationship storage merges, the author MUST be able
  to answer, unaided: Why not the conventional alternative? What happens when
  two devices go offline and make conflicting edits? What happens to
  already-synced data if permissions change afterwards? Where does this data
  physically live?
- **Read first, prompt second.** Before working on relationship data, sync,
  privacy, or access control, read the relevant code, ADRs, `CLAUDE.md`, and
  this constitution.

## Governance

- This constitution overrides other practices in this repo. `CLAUDE.md` is the
  day-to-day guidance for AI-assisted work and MUST agree with it. Where they
  disagree, this document wins until `CLAUDE.md` is updated.
- **Amendments** are made by PR to `.specify/memory/constitution.md`. The PR
  states the version bump and the reason for it. A change to Principles I–V
  also needs an ADR in `docs/adr/`.
- **Versioning** follows semantic versioning. MAJOR: a principle is removed or
  redefined. MINOR: a principle or section is added or materially expanded.
  PATCH: wording or clarification only.
- **Compliance**: every spec, plan, and PR review checks against Principles
  I–V. A deviation MUST be written down and justified in the plan's complexity
  tracking, or it is a defect.

**Version**: 1.0.0 | **Ratified**: 2026-10-10 | **Last Amended**: 2026-10-10
