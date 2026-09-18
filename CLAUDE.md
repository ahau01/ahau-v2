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
principles aren't visible in a typed contract or a diff, so a model
optimising for "works, efficient, standard" will quietly violate them. The
result isn't a bug — it's correct-looking code aimed at the wrong objective,
which review and demos don't catch.

This repo is the backend-agnostic rewrite: Leg 1 (a typed data-access
contract, in-memory reference implementation, conformance suite, and Svelte
shell) is complete; Leg 2 (real protocol adapters — Holochain, Nostr, or
others — and the proof they're interchangeable) has not started. These rules
apply to the contract, every adapter that will implement it, and the shell
that consumes it — regardless of which protocol ends up behind an adapter.

## Four things not to do

1. **No canonical version of relationship or identity data.** Different
   whānau, hapū, or people hold genuinely conflicting accounts of the same
   relationship; none is automatically correct. No last-write-wins, no
   single-source-of-truth, no overwrite-on-conflict — including during sync,
   however a given adapter implements it. If a task seems to need a
   canonical value, stop and flag it; the answer is usually "represent
   both," not "pick one." Choosing which version to show is a render-layer
   decision, per viewer.

2. **Relationships are assertions from a source, not editable edges.**
   They're modelled as "source X asserts relationship Y," with multiple
   sources coexisting. This is deliberately more complex than a graph edge.
   Do not let the contract, an adapter, or the shell simplify it toward an
   overwrite-on-write model for efficiency — that is the most likely
   regression here, because it's the normal pattern everywhere else in
   software. Any work touching relationship storage needs an explicit note
   on how it preserves multi-source assertions.

3. **No assumed central authority.** The architecture assumes no server
   holds anyone's canonical copy. Requests to add a "primary" database,
   centralise storage, or treat one adapter/node as the source of truth are
   almost always a misread of the requirement — flag rather than build.
   This has come up with external stakeholders before, on the original Āhau
   project.

4. **Identity is not session auth.** No email/password, no sessions. Don't
   port JWT/OAuth/session patterns into the contract or an adapter without
   checking they map onto the key-based identity model. A device holding a
   key is not "a logged-in user" — code that assumes it breaks under
   multi-device use in ways single-device testing won't show.

When a request touches any of these, say so in your response before writing
code — e.g. "this touches conflict resolution; last-write-wins would violate
the no-canonical-source rule, so I'm doing X instead."

## High-risk areas — "it works" is not sign-off

No adapter exists yet, so these are risks to design against, not code to
audit — revisit this section once Leg 2 adapters land.

- **Sync and conflict resolution** — whatever protocol a Leg 2 adapter
  targets, concurrent offline edits are the normal case for a decentralised
  system. Any adapter's conflict-resolution logic needs
  two-devices-offline-then-sync test coverage in the conformance suite, not
  just single-device flows.
- **Access control and permissions** — the contract's access-control
  operations must hold at sync time and cache time, not just read time,
  once an adapter implements them. A revoked member's already-synced local
  data is a real leak vector, not a theoretical one.
- **Merge-sensitive mutations** — an adapter's own merge/CRDT-equivalent
  guarantees can be broken by mutation patterns that look safe in isolation.
  Type-checking the contract does not tell you an adapter implementation is
  merge-safe.
- **Adapter boundaries** — the contract exists so adapters are swappable.
  Don't let contract or shell code quietly assume one backend's semantics
  (e.g. treating a DHT call like a database read) — that defeats Leg 2's
  agnosticism proof, which is the whole point of this repo.

## Working norms

- **Flag, don't decide.** Anything outside a task's explicit scope —
  including "helpful" adjacent cleanup — goes in the PR description, not the
  diff.
- **Small "obvious" fixes are where regressions hide.** A rename or
  contract-shape tweak that quietly touches sync, permissions, or
  relationship storage gets the same scrutiny as a large change. The risk
  doesn't scale with the size of the diff.
- **Before merging AI-generated code in a high-risk area**, the author
  should be able to answer, unaided: Why not the conventional alternative?
  What happens under a two-device-offline-then-conflicting-edit scenario?
  What does this do to already-synced data if permissions change afterward?
  Passing tests confirms it works, not that it's right for this data model.
- **Read first, prompt second.** For anything touching the contract, sync,
  or access control, read the relevant existing code and this file before
  prompting.
- **The conformance suite asserts real behaviour**, not mocked sync state or
  brittle selectors. Green CI on mocked sync data is not evidence an
  adapter's sync logic is correct. Multi-device / offline-then-sync
  scenarios need explicit coverage once adapters exist.

If a task touches the contract, sync, or access control and this file
doesn't clearly cover it — flag it. Don't infer the kaupapa-consistent
answer by pattern-matching the rest of the codebase.

## Agent skills

### Issue tracker

Issues and specs live as GitHub issues in `ahau01/ahau-v2`, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context layout: `CONTEXT.md` + `docs/adr/` at the repo root (created lazily as needed). See `docs/agents/domain.md`.
