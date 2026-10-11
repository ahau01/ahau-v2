# Design

## Context

See proposal.md for why, and `specs/own-whakapapa/spec.md` for what. The state this builds on:

- **One zome pair exists.** `dnas/ahau/zomes/{integrity,coordinator}/profiles/`. `Profile` is public, `PersonalInformation` is a private entry, there is no owner field (the author is the owner), updates must point at the first version and deletes are refused outright. `get_my_profile` reads the agent's own chain with `query`, never the DHT. That is the pattern this change follows.
- **One client boundary per feature.** `src/profile/client.ts` owns every profiles zome call and names the exact functions it calls (`PROFILE_FUNCTIONS`), which is also the dev grant list. Components take data as props; none calls Holochain. `src/own-profile/sections.ts` is the plain-TypeScript "what the page shows" function, tested without Svelte.
- **The shell.** `src/app/shell/` has one component per page; `WhakapapaPage.svelte` is `StillToCome`, deliberately with no client module at all so no relationship shape was fixed early (archived design D4). The profile is read once at launch and passed down (archived D5); there is no loading or failure state inside the shell yet.
- **Decisions already recorded.** Removal is retraction and promises only that this source's later reads won't return the record ([contract-decisions §1](../../../docs/contract-decisions.md)). Traversal is exposed as a walk with a depth the backend may decline, not as a filter over links (§4).
- **The old app's page is not the one being rebuilt.** `#/me/whakapapa` there was a list of named whakapapa records (`docs/old-app-capture/notes.md`, `13-personal-whakapapa-empty.png`). There is no record object here, so there is no list.
- **Sequencing.** Code starts after #47 (edit your profile). The self-projection below is what makes a profile edit show through in the whakapapa, so #47 is what makes that demonstrable.

## Goals / Non-Goals

**Goals:**

- Store the full multi-source shape now, and narrow only the view, so adding a second source later is a change to a filter and a screen, not to any stored entry.
- Make "a source cannot be forged", "an assertion cannot be rewritten" and "a retraction binds only its own source" properties of the integrity zome, not of the client or the page.
- Make "no user-facing write path" structural: writes exist for tests, and nothing the app can reach calls them.
- Keep the walk and the depth cap in the zome, and the tree shaping in plain TypeScript, so both are tested without a browser.
- Make it impossible for Personal information to reach the whakapapa read model, rather than remembering to strip it.

**Non-Goals:**

- Any shared, published or permissioned whakapapa. Every entry here is private to the author's chain.
- Any merge, dedupe or identity resolution between two sources' people.
- A pretty tree. Layout beyond "descent down, partners and siblings beside" is the slice owner's, and has no parity baseline yet (Risks).
- Re-reading the whakapapa while the page is open, or live updates.

## Decisions

### D1. `Person` is a separate entry type, and never carries an owner

A whakapapa is mostly about people who are not Āhau agents and never will be: ancestors, people who have died, people who don't use the app. `Profile` cannot represent them — it is defined as the author's account of themselves, enforced by one-profile-per-key and author-only updates. So the whakapapa integrity zome gets its own entry:

```rust
pub enum Person {
    /// The author themselves. Carries no details: they come from the
    /// author's own Profile when the whakapapa is read (D5).
    Myself,
    /// Someone the author describes. Their account of that person, not
    /// that person's own, and not that person's identity.
    Described(PersonDetails),
}
```

- **No owner, subject or `agent` field on `Described`.** The author is the source, taken from the action, exactly as `Profile` does it. A field naming whose person this is would be a claim about someone else's identity that the person could not contest, and it would be the hook a future "canonical person" model hangs off (rule 1).
- **`Myself` is the only tie between a `Person` and an agent key**, and it is the authoring key itself, not a key written into the entry. So a source cannot assert that someone *else* is an Āhau agent, and identity is never inferred from a matching name (rule 4).
- **Why a variant rather than a boolean `isMe` on `PersonDetails`?** A boolean would leave two sources of truth for the author's own details — the copied fields and the profile — and "keep them in sync" would then be real work that can drift. The variant has nowhere to copy to.
- **Two sources describing the same human are two `Person` entries**, with no link between them. Nothing in this change dedupes them.
- `PersonDetails` starts as the non-personal `Profile` fields a whakapapa needs (name, full name, also-known-as, gender, date and place of birth, birth order, description) and no contact details. #55 ("one place for the profile field list") is where the two lists stop being written out twice; this change does not take that on.

### D2. An assertion is an immutable entry, addressed by `ActionHash`

```rust
pub struct Assertion {
    pub kind: AssertionKind,       // ParentOf | PartnerOf | SiblingOf
    pub subject: ActionHash,       // the Person create action
    pub object: ActionHash,
}
```

`ParentOf` reads `subject` is the parent of `object`; `PartnerOf` and `SiblingOf` are symmetric and stored as written.

- **Why an entry, not a Holochain link?** A link is the editable-edge model in Holochain's clothing: it has a deletable existence, it is keyed on a base, and "move this child under a different parent" becomes delete-link-plus-create-link, which is overwrite-on-write (rule 2). An entry on the author's chain can only be appended to and retracted; there is nothing to rewrite. Private entries also cannot be link bases, so a link model would force publishing whakapapa the moment it is stored.
- **Why `ActionHash` and not `EntryHash` for the people?** Two sources who describe an ancestor identically would produce the same `EntryHash`, so an entry-hash reference would silently collapse two sources' descriptions into one address — the exact merge rule 1 forbids, arrived at by accident. An `ActionHash` is unique per author and per write, so "which source's description of Hine" is always answerable.
- **Why not one entry per relationship *pair* with both directions?** Nothing needs it. The walk reads both directions out of the same set in memory, and a second entry would be a second thing to retract.
- **Trade-off:** a `Person` written by mistake cannot be "renamed". Correcting a description means retracting the assertions that use it and asserting against a new `Person`, or waiting for the write slice to design description corrections. The read-only slice does not feel this; the write slice must answer it, and should answer it as retraction too, not as an update.

### D3. Updates and deletes are refused in validation; correction is a `Retraction` entry

```rust
pub struct Retraction {
    /// The assertion this source is taking back.
    pub assertion: ActionHash,
}
```

The integrity zome refuses, for every entry type in it:

- any `Update` — an assertion that could be updated is an editable edge
- any `Delete` — removal is retraction (contract-decisions §1); nothing here is erased
- a `Retraction` whose named assertion was authored by anyone other than the retractor, checked with `must_get_action` on the retracted action, the same shape `validate_update` in the profiles zome already uses for authorship

The projection is then "assertions authored by S that S has not retracted".

- **Why not Holochain's own `Delete` action as the retraction?** A `Delete` is chain metadata, not a statement, and two things follow. It reads as "gone" to anything using ordinary `get` semantics, which is the lie §1 was written to avoid. And when assertions later become visible to other sources, "S took back their claim" has to be a thing another source can *see and point at* — an entry can be read, quoted and dated; a tombstone on someone else's action is far weaker. Keeping retraction as an entry also means the write slice can add a reason to it without changing the shape.
- **Why refuse update rather than treat the latest version as current?** That is replace-the-latest, and it is the single most likely regression here (CLAUDE.md rule 2). "The latest version wins" is last-write-wins by another name: it throws away what the source said before, and once two sources are in play it is the mechanism by which one account quietly overwrites another. Refusing it in validation means no coordinator, client or page can reintroduce it, and no accidental `update_entry` call compiles into a working feature.
- **Why can't one source retract another's assertion?** Because that is a claim of authority over someone else's account (rules 1 and 3). The check is in validation, so it holds for every authority that stores the op, not just for the conductor that wrote it.
- **Double retraction and retracting a retraction** are accepted as ordinary appends and have no further effect on the projection: an assertion is either retracted by its source or not. The reader must not care how many times.

### D4. The zome exposes a walk from a focus, with a depth cap

`get_my_whakapapa(max_depth)` returns:

```
{ roots: [ActionHash],
  people: [{ id, source, details }],          // details projected for Myself (D5)
  relationships: [{ id, source, kind, subject, object }],
  truncated: bool }
```

It queries the author's own chain once (`query`, as `get_my_profile` does), builds the active-assertion set, finds the roots — people with no active asserted parent — and walks out from each, keeping a visited set and stopping at `max_depth`. Everything it returns is stamped with the source taken from the action's author.

- **Why a walk and not a filter the client applies?** contract-decisions §4: the boundary exposes "give me the descendants of X", because a filter-shaped boundary pushes graph logic into the frontend and that is what breaks when the data stops being local. Today every entry is on one chain, so the walk is cheap and the distinction looks academic — which is exactly why it is worth fixing now, while it costs nothing. `max_depth` is §4's `maxTraversalDepth`: the zome may decline a deep walk rather than hang, and says so with `truncated`.
- **Why flat people and relationships rather than a nested tree?** Which tree a viewer sees is a render-layer decision, per viewer (rule 1). A nested tree from the zome would bake one drawing — one chosen parent per person, one chosen root — into the data layer. Flat and source-stamped is also what a multi-source read returns, so the second source widens a filter instead of reshaping a response.
- **Roots are not stored.** There is no focus field and no whakapapa record to hold one, so nothing persists a choice of ancestor. Every parentless person in the source's active assertions is a root (spec, "Each tree starts from a focus ancestor"). Choosing one of several roots would be inventing a canonical starting point; see Open Questions.
- **Cycles.** `parent-of(A, B)` and `parent-of(B, A)` are both storable — neither is invalid on its own, and refusing the second would mean validation reading the author's whole whakapapa and deciding which claim is wrong. The walk's visited set handles it instead: a cycle terminates and nothing is drawn twice down one path.

### D5. The author's own details are projected from their profile, and personal information cannot reach the whakapapa

For a `Person::Myself`, the coordinator fills `details` by calling the profiles coordinator zome in the same cell, when the whakapapa is read. There is no copy of the author's details in any whakapapa entry.

- **The profiles coordinator gains a call returning only the public `Profile`**, with no `PersonalInformation`. `get_my_profile` returns `MyProfile`, which flattens both halves together; passing that across and stripping a field would make the whakapapa zome responsible for remembering. A call that cannot return personal information makes the leak impossible by construction, and it is a few lines next to the existing read. A test still asserts no contact-detail key appears anywhere in the whakapapa read model, so a later `Profile` field that turns out to be personal is caught.
- **The mapping is an explicit field-by-field list**, not a spread or a flatten, for the same reason: a new `Profile` field should have to be added here deliberately.
- **Why projection rather than prefill-and-sync?** Prefilling copies the fields into the `Person` entry and then owes a sync on every profile edit — a merge-sensitive mutation, on an entry type whose whole point is that it is never mutated. Projection has no second copy, so "keeps in sync with later profile edits" is free and cannot drift. The cost is that the author's details are only readable where their profile is, which in this slice is the same chain; when whakapapa becomes shareable, what another viewer sees of a self-`Person` is a question for that slice, and the honest answer is likely "what their profile shows you", which projection already expresses.
- **This never generalises.** The projection applies only to `Person::Myself`, whose source is the reading agent. No other person's `Person` is ever filled from a `Profile`, and no name is ever matched against one.
- **If the profile is missing**, the reader returns the person with no details rather than inventing any. The shell is only reachable with a profile, so this is a guard, not a flow.

### D6. Private entries, and what that buys later

Every whakapapa entry type is `#[entry_type(visibility = "private")]`, as `PersonalInformation` is. Nothing is published, so:

- No other agent can read any of it, whether by asking the network or by calling the zome from a rogue cell — the same promise `own-profile` already makes, tested the same way (`dnas/ahau/test/zomes/rogue_profiles/` gets a whakapapa sibling).
- **Permissions at sync time and cache time:** there is nothing to enforce because there is nothing to sync and nothing anyone could have cached. That is the point, not an omission. Published Holochain entries cannot be unpublished, so any whakapapa this slice gossiped would be permanently outside the reach of whatever permission model the group-permissions slice settles on. Publishing nothing until that model exists is the only choice that keeps it open.
- When whakapapa does become shareable, the enforcement has to be validation rules and capability grants over what is published, and a revoked member's already-synced copy stays readable to them for good — which is a reason to design sharing around what may be published at all, rather than around revocation. That belongs to the group-permissions slice; it is named here so the next person does not read "private entries" as a temporary shortcut.
- **Capability grants:** the dev-path grants list exactly the functions the client calls (`PROFILE_FUNCTIONS` today, which #42 is already about). The whakapapa client lists only its read call, so the write calls in D7 are not granted to the app at all. The cross-zome call in D5 is local to the cell and needs no grant.

### D7. Writes exist for tests, and nothing the app can reach calls them

The coordinator has `create_person`, `create_assertion` and `create_retraction`. They are real, validated write calls, used by conductor tests to build fixtures. They are:

- not in the whakapapa client's function list, so they are not in the grant list and the page cannot reach them
- not wrapped by any client-module function, so no component can call one even by accident
- covered by a test asserting the client's function list holds only the read call

That is what makes "no user-facing creation in this slice" a property of the code rather than a promise about the UI. The alternative — building fixtures by writing entries through a test-only zome — buys nothing, since these calls must exist for the write slice anyway and testing them now is testing the validation rules that matter most.

### D8. Two devices, offline edits, and conflicts

- **Today each device has its own agent key**, so two devices are two sources with two chains. Neither reads the other's whakapapa, both accounts survive in full, and there is nothing to merge. The same limit `own-profile` has (archived design D5).
- **Offline-then-sync cannot produce a conflicting edit here at all.** There is no update: a source only ever appends assertions and retractions to its own chain, and a chain cannot fork without being invalid. Two sources appending contradictory assertions is the normal case, not a conflict to resolve — both are stored, both name their source, and the spec's "Conflicting accounts from two sources both survive" scenario is the test.
- **When multi-device identity arrives**, the projection becomes "active assertions authored by any of my keys". Two devices that asserted different parents for the same person then both appear, because the union of two append-only sets needs no conflict rule. There is deliberately no place where a timestamp or a sequence number decides between them.
- **What is not covered**, and is the write slice's to answer: a source retracting an assertion on one device while asserting something built on it on another. Both writes stand; the projection just excludes the retracted one. That is correct but may read oddly on screen, and the read-only slice cannot produce it.

### D9. The tree is shaped in plain TypeScript, and the page only draws

- `src/whakapapa/client.ts`: the only code that makes whakapapa zome calls, following `src/profile/client.ts` — its own `ZOME` and function list, its own types, a read model with `source` on every person and relationship.
- `src/whakapapa/tree.ts`: plain TypeScript, no Svelte, no Holochain. Takes the read model, returns the trees to draw: for each root, the person, their partners and directly-asserted siblings beside them, and their children below, repeated per asserting parent, with its own visited guard so a cycle in a fixture cannot hang a test. Same role `own-profile/sections.ts` plays for the profile page, and tested the same way.
- `WhakapapaPage.svelte` renders what `tree.ts` returns, plus the reading, empty and failed states. It makes no zome call and does no walking.
- **The page reads on open**, not at launch, and not again while open. Whakapapa can be large and is one of three sections, so reading it at launch would make every launch pay for it. Nothing can change it while the page is open in this slice.
- **Siblings and partners both land "beside"**, which a tree of descent has no natural slot for. The rule is: a `sibling-of` whose two people already share an asserted parent needs no extra drawing — the descent puts them side by side. One that does not is drawn beside its sibling with no parent above it. See Open Questions.

### D10. Vocabulary

`CONTEXT.md` gains, via `domain-modeling`: **Person** (a source's description of someone, not their identity and not their account of themselves — the counterpart to **Profile**), **source** (the agent who authored a record; derived from authorship, never a field), **assertion** (an immutable statement by a source that two people are related), **retraction** (an appended statement by a source taking back one of its own assertions; the original record stays) and **whakapapa** (as the app uses it: the people and relationships a source has asserted, drawn from a focus ancestor). The terms to avoid matter as much: *edge*, *link*, *record owner*, *canonical person*, *merge*.

### D11. Tests

- **Zome unit tests** (`cargo test`), against `validate` with a mocked host as the profiles zome does: a retraction of another author's assertion is refused; an update of each entry type is refused; a delete of each is refused; a `Myself` person is accepted and a `Described` one is accepted; an assertion referencing a person is accepted whoever wrote the person.
- **Conductor tests** (`npm run test:conductor`), the ones that carry the kaupapa rules:
  - two agents assert different parents for the same child; both assertions remain, each naming its own source, and neither agent's read shows the other's
  - a source retracts its own assertion; its tree changes, the retracted record is still on its chain, and another source's identical assertion is untouched
  - an agent cannot retract another agent's assertion
  - a rogue cell cannot read another agent's whakapapa entries
  - the whakapapa read model contains no email, phone, address, postcode, city or country, for a profile that has all six
  - a self-`Person`'s details follow a profile edit, with no whakapapa write between
  - a cycle fixture terminates; a fixture deeper than `max_depth` comes back `truncated`
- **Plain TypeScript** (`node --test` over `dist`): `tree.ts` against the spec's drawing scenarios — three generations, a child asserted under two parents, two unconnected roots, partners, a sibling with no shared parent, a retracted assertion absent, a cycle.
- **Vitest**: the page's empty, failed and populated states; no write controls in any of them; the client's function list holds only the read call.

There are no two-devices-offline-then-sync tasks, and the reason is D8: nothing is published, so there is no sync, and nothing is updated, so there is no conflicting edit to merge. The two-agent conflict test above is what that rule is protecting here, and it runs against a real conductor.

## Risks / Trade-offs

- **No parity baseline for a populated tree.** `docs/old-app-capture/` has only the old empty whakapapa-*records* page, which is not being rebuilt. → The look is judged against the old app's tree component by code reading, and the slice owner decides whether capturing the old app with whakapapa data is worth it. An agent does not make that call; the task list stops at the decision.
- **A person asserted under two unconnected parents is drawn twice**, and their whole subtree with them, so a modest whakapapa can draw large. → Honest and correct for this slice; `max_depth` and `truncated` bound it. Choosing one place to draw them is the old app's "important relationship", and it is a canonical-value decision about someone else's relationships, so it stays an open question rather than a default.
- **A whakapapa is not a tree.** Partners with separate ancestries, siblings with no shared parent, and repeated people all make the drawing approximate. → Accepted: descent down, partners and siblings beside. Anything cleverer is layout work with no spec consequence.
- **The DNA hash changes**, so dev profiles created before this change stop loading. → Dev-only (#65); `hc sandbox clean` and create a profile again.
- **A future `Profile` field could be personal and get projected.** → D5's explicit field list plus the conductor test that no contact-detail key appears in the read model. #55 would remove the duplicated list entirely.
- **`Person` descriptions cannot be corrected in this slice** (D2). → Read-only, so nothing can be written wrong through the app. The write slice must design description correction as retraction, not as an update, and this design says so where it will be read.
- **#47 has to ship first**, and it may change how the profile is read in the shell. → The projection in D5 goes through the profiles coordinator, not through whatever the shell holds, so an editing slice that changes the shell's read does not change the whakapapa's.

## Migration Plan

No stored data to migrate: there is no whakapapa data anywhere yet, and production data stays empty until a write slice (proposal). The new zome pair changes the DNA hash, so an existing dev conductor needs `hc sandbox clean` and a fresh profile. Rollback is reverting the change; nothing outside this repo holds whakapapa entries. `production-build.test.ts` must stay green, and `npm run build:happ`, `npm run test:zomes` and `npm run test:conductor` all have to be updated for the new zome before anything else lands.

## Open Questions

Each of these can be answered by the slice owner without changing the specs, this design or the task list:

- **More than one focus ancestor.** D4 shows every parentless person as their own tree. Whether a person should instead pick and keep a focus is a product question; picking one automatically is not an option (it would invent a canonical root).
- **Where a `sibling-of` with no asserted shared parent is drawn** (D9), and whether siblings in that position should be visibly distinguished from siblings the descent already puts together.
- **The value of `max_depth`.** It needs a number that no real whakapapa hits and no test fixture has to work around.
- **The empty state's wording**, in te reo Māori and English. The spec fixes what it must and must not say.
