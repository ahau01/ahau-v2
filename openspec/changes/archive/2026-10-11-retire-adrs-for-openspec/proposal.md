# Proposal

## Why

ADRs and OpenSpec have grown into two parallel systems for recording project
direction, each requiring the other to be consulted. `docs/agents/openspec.md`
instructs that "lasting decisions still go in ADRs" alongside a change's own
artifacts, and `docs/agents/domain.md` requires reading `docs/adr/` before
every `/opsx:explore`. That loop re-creates itself on every change: write a
spec/design, then write an ADR too; read specs, then read ADRs too.

The two most recent ADRs (0007, 0008) are already fully and more precisely
expressed as live requirements in `openspec/specs/own-profile/spec.md` —
proof the dual system is now pure overhead, not added safety. OpenSpec
becomes the sole driver of project direction going forward: `docs/adr/` is
removed completely, not frozen in place.

This does not touch relationship data, sync, access control, or identity —
it is a documentation/process change only. None of the four CLAUDE.md rules
apply.

## What Changes

- Remove the ADR-writing instruction from `docs/agents/openspec.md`'s
  "Decisions and vocabulary" section. Lasting decisions are captured in a
  spec's requirements or a change's `design.md`; nothing else is written in
  parallel.
- Remove the mandatory ADR-read requirement and the "Flag ADR conflicts"
  section from `docs/agents/domain.md`. `openspec/specs/` and in-flight
  changes become the sole thing to read before exploring.
- Consolidate ADR-0002 through ADR-0006 — the narrative of why
  `ahau-monorepo`'s SSB architecture was abandoned and what shape this
  rewrite took (Holochain candidacy, the Svelte shell, the no-migration
  stance, the frozen Leg 1 contract) — into one new historical document under
  `docs/history/`. This is the "initial days of the project" context being
  preserved, relocated rather than lost.
- **Delete `docs/adr/` entirely**: all eight ADR files and `docs/adr/README.md`.
- Rewrite every citation of an ADR in a currently-maintained ("living", per
  `docs/INDEX.md`) doc so it states the relevant fact inline instead of
  linking to a file that no longer exists. This touches `CLAUDE.md`,
  `README.md`, `openspec/config.yaml`, `openspec/specs/own-profile/spec.md`,
  `docs/INDEX.md`, `docs/capability-inventory.md`,
  `reference/leg1-contract/README.md`,
  `reference/leg1-contract/contract-source/README.md`,
  `docs/research/2026-10-04-rust-holochain-learning-tickets.md`,
  `docs/research/holochain-group-permissions.md`,
  `docs/research/pataka-always-online-peer.md`, and
  `docs/plans/group-permissions.md`.
- **Not rewritten**: ADR citations inside material `docs/INDEX.md` already
  classifies as frozen history (`docs/history/leg1/`, `docs/history/handoffs/`)
  and inside the already-archived
  `openspec/changes/archive/2026-10-11-add-landing-and-shell/`. These become
  dead references, consistent with this project's existing practice of
  leaving unfixed references inside frozen material rather than retroactively
  editing it (see `docs/INDEX.md`'s note on `history/leg1/` paths).
- **BREAKING** (documentation navigation only, no code/runtime effect):
  `docs/adr/` no longer exists; nothing in the live docs set references ADR
  numbers afterward.

## Capabilities

No spec-level behaviour changes. `own-profile`'s requirements already state
everything ADR-0007/0008 decided; this change only drops a now-dangling
citation from that spec's overview text, not its requirements.
`.openspec.yaml` sets `skip_specs: true` accordingly.

### New Capabilities
(none)

### Modified Capabilities
(none — see above)

## Impact

See "What Changes" for the full file list. Net effect: `docs/adr/` (9 files)
deleted; one new file under `docs/history/`; ~12 living docs edited to drop
ADR citations; zero frozen/archived docs touched.

## Flagged, not done

- `docs/contract-decisions.md` and `docs/history/knowledge-base/` are out of
  scope — neither currently cites an ADR, and both are already scoped as
  "consult when touching this specific thing," not part of the ADR
  dependency this change removes.
