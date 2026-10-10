# CLAUDE.md — Āhau v2

Read before working in this repo. This file states the kaupapa Māori
principles this project encodes into its architecture, and the practices
that keep AI-assisted contributions aligned with them. Migrated and adapted
from the `ahau-monorepo` CLAUDE.md — see
[docs/history/knowledge-base/](docs/history/knowledge-base/) for that repo's
own history.

## Why this file exists

AI assistants reliably produce code that works, passes tests, and uses the
conventional pattern — and for this data model, "conventional" is often
wrong. Āhau encodes kaupapa Māori principles (data sovereignty, non-erasure
of contested authority, decentralisation) into its architecture. Those
principles aren't visible in a type signature or a diff, so a model
optimising for "works, efficient, standard" will quietly violate them. The
result isn't a bug — it's correct-looking code aimed at the wrong objective,
which review and demos don't catch.

This repo is a rebuild of Āhau directly on Holochain, designed around what
people need to do rather than how the SSB-era app did it
([ADR-0006](docs/adr/0006-capability-driven-redesign-not-behaviour-replication.md)). The spec is a capability inventory (#13). The Leg 1 typed
contract in `src/contract/` is **frozen reference** — a record of what the
old app's data layer could do, used as a checklist so nothing is dropped —
not an interface new code must implement. No Holochain code exists yet; the
first slice is group permissions
([ADR-0003](docs/adr/0003-holochain-as-leg-2-protocol-candidate.md)). These
rules apply to the Holochain zomes, the client modules that call them, and
the Svelte shell.

## Four things not to do

1. **No canonical version of relationship or identity data.** Different
   whānau, hapū, or people hold genuinely conflicting accounts of the same
   relationship; none is automatically correct. No last-write-wins, no
   single-source-of-truth, no overwrite-on-conflict — including during sync
   and in how entries are updated or linked on Holochain. If a task seems to need a
   canonical value, stop and flag it; the answer is usually "represent
   both," not "pick one." Choosing which version to show is a render-layer
   decision, per viewer.

2. **Relationships are assertions from a source, not editable edges.**
   They're modelled as "source X asserts relationship Y," with multiple
   sources coexisting. This is deliberately more complex than a graph edge.
   Do not let a zome, a client module, or the shell simplify it toward an
   overwrite-on-write model for efficiency — that is the most likely
   regression here, because it's the normal pattern everywhere else in
   software. Any work touching relationship storage needs an explicit note
   on how it preserves multi-source assertions.

3. **No assumed central authority.** The architecture assumes no server
   holds anyone's canonical copy. Requests to add a "primary" database,
   centralise storage, or treat one node or agent as the source of truth are
   almost always a misread of the requirement — flag rather than build.
   This has come up with external stakeholders before, on the original Āhau
   project.

4. **Identity is not session auth.** No email/password, no sessions. Don't
   port JWT/OAuth/session patterns into a zome, client, or the shell without
   checking they map onto the key-based identity model (on Holochain, an
   agent's public key). A device holding a
   key is not "a logged-in user" — code that assumes it breaks under
   multi-device use in ways single-device testing won't show.

When a request touches any of these, say so in your response before writing
code — e.g. "this touches conflict resolution; last-write-wins would violate
the no-canonical-source rule, so I'm doing X instead."

## High-risk areas — "it works" is not sign-off

No Holochain code exists yet, so these are risks to design against, not
code to audit — revisit this section once the first slice lands.

- **Sync and conflict resolution** — concurrent offline edits are the normal
  case for a decentralised system. Any conflict-handling logic needs
  two-devices-offline-then-sync test coverage against a real conductor
  (Tryorama or Sweettest), not just single-device flows.
- **Access control and permissions** — permissions must hold at sync time
  and cache time, not just read time. On Holochain that means enforcing them
  in validation rules and capability grants, not only in the UI or a client
  check. A revoked member's already-synced local data is a real leak vector,
  not a theoretical one.
- **Merge-sensitive mutations** — Holochain's append-only source chains and
  DHT give their own consistency guarantees, and mutation patterns that look
  safe in isolation (e.g. "update" as replace-the-latest) can break them or
  erase a source's assertion. Type-checking does not tell you a design is
  merge-safe.
- **Holochain is not a database** — DHT reads can be stale or incomplete,
  and nothing is ever erased (removal is retraction —
  [docs/contract-decisions.md](docs/contract-decisions.md) §1). Don't write
  shell or client code that treats a zome call like a database query. Keep
  zome calls inside per-feature client modules so components never call
  Holochain directly.
- **The frozen contract is not the spec** — don't make Holochain code match
  `src/contract/` operation-for-operation; that reintroduces SSB's shapes
  (ADR-0006). Use it to check nothing the old app did has been dropped.

## Working norms

- **Flag, don't decide.** Anything outside a task's explicit scope —
  including "helpful" adjacent cleanup — goes in the PR description, not the
  diff.
- **Small "obvious" fixes are where regressions hide.** A rename or
  entry-shape tweak that quietly touches sync, permissions, or
  relationship storage gets the same scrutiny as a large change. The risk
  doesn't scale with the size of the diff.
- **Before merging AI-generated code in a high-risk area**, the author
  should be able to answer, unaided: Why not the conventional alternative?
  What happens under a two-device-offline-then-conflicting-edit scenario?
  What does this do to already-synced data if permissions change afterward?
  Passing tests confirms it works, not that it's right for this data model.
- **Read first, prompt second.** For anything touching relationship data,
  sync, or access control, read the relevant existing code, ADRs, and this
  file before prompting.
- **Tests assert real behaviour**, not mocked sync state or brittle
  selectors. Green CI on mocked sync data is not evidence sync logic is
  correct. Kaupapa rules — including "two sources can assert conflicting
  relationships and both survive", which has no test yet — need Holochain
  tests against a real conductor, and multi-device / offline-then-sync
  scenarios need explicit coverage.

If a task touches relationship data, sync, or access control and this file
doesn't clearly cover it — flag it. Don't infer the kaupapa-consistent
answer by pattern-matching the rest of the codebase.

## Agent skills

### Specs and changes: OpenSpec

Work is scoped, specified and built with OpenSpec (`/opsx:*` skills,
`openspec/`). `/opsx:explore` to think a problem through, `/opsx:propose`
to write the change, `/opsx:apply` to build it, `/opsx:verify` and
`/opsx:archive` to close it. `openspec/config.yaml` restates the kaupapa
rules above for every artifact; this file is the source of truth, so change
both together. See `docs/agents/openspec.md`.

Don't use the Matt Pocock planning skills here (`wayfinder`, `to-spec`,
`to-tickets`, `triage`, `implement`): OpenSpec replaces them. The ones still
in use are `diagnosing-bugs`, `domain-modeling`, `grilling`, `research` and
`prototype`.

### Issue tracker

GitHub issues in `ahau01/ahau-v2` (via `gh`) are the backlog and intake:
bugs, ideas, open questions, and decisions waiting on a person. Picking one
up turns it into an OpenSpec change that links the issue; the PR closes it.
No maps or child tickets. See `docs/agents/issue-tracker.md`.

### Triage labels

`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: `CONTEXT.md` + `docs/adr/` at the repo root (created lazily as needed). See `docs/agents/domain.md`.
