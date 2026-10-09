# ADR-0007: A person's contact details are a private entry on their own source chain

**Date**: 2026-10-09
**Status**: accepted
**Deciders**: taiao.kawiti.wbhs@gmail.com

## Context

The old app's create-profile form (#19) has a "Personal information" section:
email, phone, address, postcode, city and country. On SSB these sat on the
person's profile with the rest of it. On Holochain, a public entry is
published to the DHT and held by other peers, so storing contact details
the same way would hand everyone on the network a copy that can never be
erased (contract-decisions.md §1). #19 asked for the fields, not for a
storage design, so this decision was made while building it (PR #44).

## Decision

Contact details are a separate `PersonalInformation` entry type with
`visibility = "private"`. It stays on the author's own source chain; only
the action that created it is published. `create_my_profile` writes the
public `Profile` and the private `PersonalInformation` in one zome call.
Validation, which every authority runs, enforces:

- only the original author may update it (checked on every update op);
- no one may delete it, until retraction is designed;
- it can only be created after that agent's `Profile`, and only once.

## Alternatives Considered

### Alternative 1: Contact details on the public `Profile`
- **Pros**: one entry, one read; matches the old app's shape.
- **Cons**: every peer holding the profile holds the contact details, for good.
- **Why not**: a privacy leak that can't be undone once synced.

### Alternative 2: Encrypt contact details inside the public `Profile`
- **Pros**: one entry; could later be shared by sharing a key.
- **Cons**: ciphertext still spreads and can't be erased; needs key management that doesn't exist yet.
- **Why not**: more machinery than first launch needs, and a weaker guarantee than never publishing.

## Consequences

### Positive
- No one else can read the contents, even bypassing the app: the
  conductor tests try it from a rogue zome.
- The screen can honestly say "Only you can see this."

### Negative
- **One device only.** The entry lives on one agent key's chain. A second
  device has its own agent key and will not see it (CLAUDE.md rule 4: a
  device holding a key is not "a logged-in user"). Multi-device identity
  is not designed yet; when it is, this entry needs a way across.
- **No sharing.** Kaitiaki or whānau can't be shown these details yet.
  Sharing needs its own design, probably via capability grants or an
  encrypted copy.
- Validation can't check the contents (private ops carry none), only who
  wrote it and when.

### Risks
- Changing this shape once real people are on a network is one-way:
  nothing on a chain is erased. Revisit before the first real network.
