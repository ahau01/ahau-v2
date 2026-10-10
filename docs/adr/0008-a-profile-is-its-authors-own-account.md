# ADR-0008: A profile is its author's own account, which only its author can add versions to

**Date**: 2026-10-10
**Status**: accepted
**Deciders**: taiao.kawiti.wbhs@gmail.com

## Context

First launch (#14) creates a profile but offers no way to edit one. The
validation written for it already let the author update their `Profile` and
`PersonalInformation`, while refusing deletes from everyone "until retraction
is designed with editing". The whole-slice review of #14 asked whether
updates should be blocked the same way until editing is designed.

They are different cases. Deletes are blocked because a deleted profile reads
back as none, and the one-profile rule would never let its author make
another. An update has no such trap. And an agent's source chain has one
writer, so "the latest version on my own chain" is not last-write-wins
between sources (CLAUDE.md rule 1): there is only one source.

Any change to these rules changes the integrity zome, and so the DNA hash: a
new network. With no real network yet, deciding now is free; deciding later
is a migration either way.

## Decision

A profile, with its personal information, is its author's own account of
themselves. Updating it adds a version to that account's history; earlier
versions stay on the chain. For both `Profile` and `PersonalInformation`,
validation enforces:

- only the original author may update it (as before);
- every update points at the original Create of the same entry type, never
  at an earlier update, so every version hangs off one place and none can be
  orphaned on a fork.

Reading the author's own profile takes the latest entry on their own chain.
When reading another person's profile is built, it shows the update with
the author's highest chain position (`action_seq`), not the newest timestamp
(the author sets it) and not whichever update arrived last (that differs
between peers). A reader that has seen only some updates shows an older
version: that's history, not an error or a conflict.

The app offers no editing yet: there is no coordinator update function until
an editing issue (#47) designs it, screen included. The conductor tests that
update through a test zome pin the validation rule, not an app feature.

## Alternatives Considered

### Alternative 1: Block updates the same way as deletes
- **Pros**: nothing is allowed that the app doesn't offer; symmetric with deletes.
- **Cons**: no one can correct their profile until editing ships; lifting the block later costs a network migration.
- **Why not**: the reason deletes are blocked doesn't apply to updates, so the block would be a rule we already expect to remove.

### Alternative 2: Design and ship editing now
- **Pros**: the allowed update is also offered.
- **Cons**: grows #14 after all its sub-issues closed.
- **Why not**: editing gets its own issue (#47), which builds the read for other people's profiles on the rule above rather than deciding it again.

### Alternative 3: Let an update point at the previous version
- **Pros**: each version names the one it replaces.
- **Cons**: finding the newest means walking the chain; one missed hop splits the versions into a fork.
- **Why not**: pointing every update at the original keeps every version findable from one lookup, which matters once the DHT is read.

## Consequences

### Positive
- People's corrections will need no rule change once editing ships.
- Every version of a profile can be found from its original, in order.

### Negative
- The validation allows something no screen does, so it's held up only by
  tests through a test zome until editing exists.
- Validation can't check the contents of a `PersonalInformation` update
  (private ops carry none), only who wrote it and what it points at.

### Risks
- **One person, two devices.** A second device has its own agent key, so it
  can create its own profile, updatable only by that key: two accounts for one
  person (CLAUDE.md rule 4). Choosing between them is a per-viewer
  render-layer decision (rule 1), deferred with multi-device identity. It
  needs two-device / offline-then-sync coverage against a real conductor.
