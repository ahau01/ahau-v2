# CLAUDE.md — Āhau v2

Read this before changing the repo. It defines the kaupapa rules that shape
the architecture and the working norms for AI-assisted contributions. These
apply to Holochain zomes, feature client modules, and the Svelte shell.

Āhau v2 is a rebuild around what people need to do, not a port of the SSB-era
app. [`openspec/specs/`](openspec/specs/) defines current product requirements.
Proposed changes are specified in their OpenSpec change directories until
implemented and archived. The [capability inventory](docs/capability-inventory.md)
and [frozen reference](reference/leg1-contract/README.md) are checks against
dropped capabilities, not designs to copy. See the
[OpenSpec guide](docs/agents/openspec.md) for workflow details.

## Four things not to do

1. **Don't make one version canonical.** People and communities can hold
   conflicting accounts of identity or relationships. Preserve each version;
   don't use last-write-wins, overwrite-on-conflict, or a single source of
   truth, including during sync. Choosing what to display belongs to the
   viewer's render layer. If a task seems to need a canonical value, flag it.

2. **Keep relationships as sourced assertions.** Model “source X asserts Y,”
   so multiple sources can coexist. Don't simplify this into an editable graph
   edge or replace-the-latest write. Work that changes relationship storage
   must state how multiple assertions survive.

3. **Don't assume central authority.** No server or node holds everyone's
   canonical copy. Flag requests to centralise storage or designate a primary
   source instead of implementing them by default.

4. **Keep identity separate from session auth.** Holochain identity is based
   on an agent's public key, not an email/password account or login session.
   Don't port JWT/OAuth/session patterns without checking them against
   key-based and multi-device identity.

When a task touches one of these rules, explain the relevant constraint and
your approach before coding.

## High-risk areas

- **Sync and conflicts:** offline concurrent edits are normal. Validate
  conflict handling with two devices editing offline and then syncing, using
  a real conductor (Tryorama or Sweettest), not only single-device flows.
- **Permissions:** enforce authorisation through appropriate Holochain
  validation rules and capability grants at sync and cache time. Consider
  what happens when permissions change after data has been replicated. UI or
  client checks alone cannot enforce access restrictions on data already held
  by another agent; do not assume revocation erases previously synced data.
- **Mutations and reads:** Holochain source chains and the DHT are not a
  conventional database. Reads can be stale or incomplete; removal is
  represented through retraction, not erasure ([contract decisions](docs/contract-decisions.md#1)).
  Check that mutations preserve source assertions and merge safely. Keep zome
  calls in feature client modules, not components.
- **Legacy contract:** use the frozen contract as a capability checklist;
  don't reproduce its operations or data shapes one for one.

## Working norms

- **Stay in scope.** Flag adjacent work for the PR description instead of
  slipping it into the diff.
- **Read before prompting.** For relationship, sync, or access-control work,
  inspect the relevant implementation and OpenSpec specs before proposing a
  solution.
- **Check behaviour, not just green tests.** Mocks and type checks don't
  prove sync or merge correctness. Cover the relevant real-conductor
  scenarios. Test kaupapa invariants explicitly, including that conflicting
  relationship assertions from different sources both survive.
- **Flag gaps.** If a task touches these areas and the rules don't clearly
  answer it, ask rather than infer a design from nearby code.

## Repo workflows

- **Changes and specs:** use the `openspec-*` skills. See the
  [OpenSpec guide](docs/agents/openspec.md).
- **Backlog and triage:** use GitHub issues. See the
  [issue tracker](docs/agents/issue-tracker.md) and
  [triage-label documentation](docs/agents/triage-labels.md).
- **Domain vocabulary:** read or update `CONTEXT.md` following the
  [domain documentation guidance](docs/agents/domain.md).
