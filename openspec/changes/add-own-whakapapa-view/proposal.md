# Proposal

No issue yet: this comes from the whakapapa exploration whose decisions are recorded here. It follows [#47](https://github.com/ahau01/ahau-v2/issues/47) (edit your profile), which must ship before this is built, and it replaces the Whakapapa empty state added in the landing-and-shell slice.

**Kaupapa rules this bears on.** This change touches **relationship data** and **identity data**, so it bears on all four rules, and most sharply on **rules 1 and 2**:

- **Rule 2 (relationships are assertions from a source, not editable edges).** Every relationship is stored as an immutable entry saying "this source asserts `parent-of(A, B)`". There is no link to rewrite and no edge to overwrite. The source is the entry's Holochain author, not a field, so an assertion cannot claim to come from someone else. The read model carries that source for every person and every relationship it returns, even though this slice shows only one source's account.
- **Rule 1 (no canonical version of relationship or identity data).** A `Person` is one source's description of someone, not that person's identity and not owned by the person described. Two sources describing the same person are two `Person` entries; nothing in this change merges them, dedupes them, matches them by name, or picks one as correct. A correction is a new retraction entry naming the assertion it retracts, so the original record stays and only that source's own projection changes ([contract-decisions §1](../../../docs/contract-decisions.md)). One source's retraction cannot touch another source's assertions.
- **Rule 4 (identity is not session auth).** The one place a `Person` is tied to an identity is the author's own self-`Person`, and the tie is the agent key that authored it — nothing else. The details then come from that agent's `Profile` by projection at read time, so there is no second copy to drift. Identity is never inferred from a matching name.
- **Rule 3 (no assumed central authority).** Reads come from the agent's own source chain, so the tree does not depend on the DHT or on any one node. There is no whakapapa-record object to own, name or permission.

**How multi-source assertions are preserved.** The stored shape is the full multi-source one from day one; only the *view* is narrowed. An assertion names its source and the two people it relates, and the projection is "the active assertions authored by source S". Adding a second source later means widening the filter, not changing the entries: a second source's conflicting assertions sit alongside the first's and both survive. The delta spec covers that with a scenario, and a conductor test asserts it even though no screen shows it yet.

## Why

A person who goes to Whakapapa today reads "still to come". Whakapapa is the reason Āhau exists, and the relationship model is the part of this rebuild most likely to be got wrong — so it needs to be built in the smallest honest slice, as storage and a reader, before any editing, importing, sharing or permissions pile assumptions on top of it. Doing the read side first means the assertion shape is settled and tested against a real conductor while nothing depends on it.

## What Changes

- **A `Person` representation, distinct from `Profile`.** A `Profile` is an agent's own account of themselves; a whakapapa is mostly about ancestors and others who are not Āhau agents, and cannot be. A `Person` is a source's description of someone. It is not owned by the person it describes and is not their identity.
- **Relationships as immutable assertions.** `parent-of(parent, child)`, `partner-of(a, b)` and `sibling-of(a, b)`, each an entry whose author is its source. No mutable link, no editable edge.
- **Correction by retraction.** A source corrects its own mistake by appending a retraction naming the assertion it retracts, and if it wants, a replacement assertion. The retracted record stays; that source's current projection leaves it out. Never an in-place rewrite.
- **Yourself in your own whakapapa, projected from your profile.** When an assertion names the author's own self-`Person`, the details shown come from their current `Profile` at read time, so a later profile edit shows through with no second copy to sync. Personal information (email, phone, address, postcode, city, country) is never part of it. This never extends to anyone else's `Profile`.
- **A read-only tree at `#/me/whakapapa`.** The tree descends from a focus ancestor — a person this source asserts no parent for — computed from the source's active assertions. With no whakapapa data it shows an honest empty state that doesn't pretend the person has no whakapapa and offers no control that does nothing.
- **A whakapapa client module and a whakapapa zome**, with the walk behind that boundary. No Svelte component calls Holochain or walks assertions itself.
- **Entries are private to the agent's own source chain** in this slice, so nothing is published and there is nothing to permission yet.
- **No whakapapa-record object.** The old app's `#/me/whakapapa` was a list of named, separately-permissioned whakapapa records with a NEW WHAKAPAPA RECORD button (`docs/old-app-capture/13-personal-whakapapa-empty.png`). A person's own whakapapa here is simply their own active assertions, so there is nothing to list, name or share.
- **Removed:** the Whakapapa "still to come" empty state and its exemption from calling Holochain.
- **Production data stays empty** until a later write slice. Tests use fixtures written directly through the zome; no user-facing write path appears.

## Capabilities

### New Capabilities

- `own-whakapapa`: a person viewing their own whakapapa — what the tree is built from, that it shows one source's account with the source kept in the read model, how a `Person` differs from a `Profile`, how the author's self-`Person` is projected from their profile, what a retraction does to the projection and what it does not do to other sources, and the empty state when there is nothing yet.

### Modified Capabilities

- `navigation`: Whakapapa is no longer a section "without designed data". The two requirements that grouped it with Archive and the tribe list — the honest "still to come" empty state, and making no Holochain calls — are replaced by narrower ones covering only those two sections. Whakapapa's own empty state belongs to `own-whakapapa`.

## Impact

- **Code:**
  - new `dnas/ahau/zomes/integrity/whakapapa/`: `Person`, `Assertion`, `Retraction` entry types and their validation
  - new `dnas/ahau/zomes/coordinator/whakapapa/`: create calls for fixtures, and the walk that returns the tree
  - new `src/whakapapa/`: the client module (zome calls, the read model) and the projection from active assertions to a tree, in plain TypeScript
  - `src/app/shell/WhakapapaPage.svelte`: the tree and the empty state, replacing `StillToCome`
  - `dnas/ahau/zomes/coordinator/profiles/`: a call returning only the public half of this agent's profile, so personal information never crosses into the whakapapa zome
  - `src/profile/client.ts`: `ZOME`/`PROFILE_FUNCTIONS` are profile-specific; the new client needs its own zome name and its own grant list (see #42)
  - `dnas/ahau/workdir/dna.yaml` and `dnas/ahau/test/workdir/dna.yaml`: the new zome pair
- **The DNA hash changes**, so dev profiles created before this change won't load. Dev-only today (#65), so no migration is owed.
- **Dependencies:** none added.
- **Docs:** `CONTEXT.md` gains Person, source, assertion, retraction and whakapapa; `docs/capability-inventory.md`'s Single whakapapa rows get a Keep? answer for the ones this slice covers.
- **Builds:** `npm run build:happ`, `npm run test:zomes` and `npm run test:conductor` all gain the new zome. `production-build.test.ts` must stay green.

## Flagged, not done

- **Any user-facing way to add or change whakapapa** — adding a parent, partner, child or sibling, editing a person, removing someone from a whakapapa, deleting a person, and CSV import. The write path is the next slice; this one only reads.
- **Multi-source conflict UI.** Storage keeps every source's assertions and the read model names the source, but no screen shows two accounts side by side or lets a viewer choose between them. Which account a viewer sees is a render-layer decision per viewer (rule 1) and needs its own slice.
- **Tribe scope, sharing, kaitiaki permissions and submit-for-review.** Entries stay private to the author's chain, so there is nothing shared to permission. When whakapapa becomes shareable, permissions have to hold at sync and cache time, not just read time — that is the group-permissions slice's work, not a UI check added here.
- **Moving the tree's focus to another ancestor, search, filters (e.g. hide deceased), the table view, and CSV/SVG export.** All read-side capabilities in the inventory, all deferrable past a first tree.
- **Choosing where a person who appears twice is drawn** (the old app's "important relationship"). This slice draws them under each parent that asserts them, which is honest but can repeat a subtree. Picking one place is a canonical-value decision about someone else's relationships, so it is an open question, not a default.
- **Opening a person in the tree to see their profile.** A `Person` is not a `Profile`, and what a person-detail panel should show from a single source is unsettled.
- **Named whakapapa records, and more than one of them.** See "no whakapapa-record object" above.
- **Multi-device.** A second device has its own agent key, so it is a different source with its own chain and sees none of this (the same limit `own-profile` already has). Nothing here assumes one device, but nothing here fixes it either.
- **Parity screenshots of a populated tree.** `docs/old-app-capture/` has only the old empty whakapapa-records page, and that page is not being rebuilt. Capturing the old app's tree needs whakapapa data in a running old app; see design, "Risks".

## Open Questions

- **More than one focus ancestor.** When a source's assertions have several people with no asserted parent, this change shows each as its own tree rather than choosing one, because choosing would be inventing a canonical root. Whether that is the right reading of "a tree from a focus ancestor", or whether a person should pick and keep a focus, is for the slice owner.
- **Where `sibling-of` is drawn** when no shared parent is asserted. The design draws them beside their sibling; a tree of descent has no natural place for them.
- **What the empty state says, in te reo Māori and English.** The spec fixes what it must and must not say; the wording is the slice owner's.
