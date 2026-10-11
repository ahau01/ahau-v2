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
- **The kind of relationship travels with the assertion**, including **whāngai**. A parent assertion carries `birth | whangai | adopted | unknown` and whether the adoption was legal; a partner assertion carries `partners | married | divorced | unknown`. These are the values Āhau shipped ([docs/research/whakapapa-spec-2021.md](../../../docs/research/whakapapa-spec-2021.md) §5), and whāngai is a relationship form the model has to be able to hold, not one to add later. The kind is unset until a source says otherwise, and unset never reads as `birth`.
- **Correction by retraction.** A source corrects its own mistake by appending a retraction naming the assertion it retracts, optionally with a reason, and if it wants, a replacement assertion. The retracted record and the reason both stay; that source's current projection leaves the assertion out. Never an in-place rewrite — correcting the *kind* of a relationship is also a retraction plus a new assertion, not an overwrite.
- **Yourself in your own whakapapa, projected from your profile.** When an assertion names the author's own self-`Person`, the details shown come from their current `Profile` at read time, so a later profile edit shows through with no second copy to sync. Personal information (email, phone, address, postcode, city, country) is never part of it. This never extends to anyone else's `Profile`.
- **A read-only tree at `#/me/whakapapa`.** The tree descends from a focus ancestor — a person this source asserts no parent for — computed from the source's active assertions. With no whakapapa data it shows an honest empty state that doesn't pretend the person has no whakapapa and offers no control that does nothing.
- **A whakapapa client module and a whakapapa zome**, with the walk behind that boundary. No Svelte component calls Holochain or walks assertions itself.
- **Entries are private to the agent's own source chain** in this slice, so nothing is published and there is nothing to permission yet.
- **No named, shared or permissioned whakapapa record in this slice.** The old app's `#/me/whakapapa` was a list of such records with a NEW WHAKAPAPA RECORD button (`docs/old-app-capture/13-personal-whakapapa-empty.png`). A person's own whakapapa here is simply their own active assertions, so there is nothing to list, name or share — but the *lens* those records also carried is a real and distinct concept, and this change does not discard it. A lens is one viewer's saved way of drawing the graph: where to start, whom to leave out, and which parent counts where someone has several. It holds no relationship data. Āhau had it as its own record type, and our frozen contract still does (`reference/leg1-contract/contract/types/records.ts:121-148`: "A saved lens over the whakapapa — not the graph itself. The graph is the links."). Nothing to build here — with one source and no stored preferences, every parentless person is a root — but the lens is where a stored focus and the drawing of a person who appears twice belong when they arrive, per viewer, never on a relationship (rule 1).
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
- **A lens, and the two things that live on it.** No saved view, no stored focus, and no resolution of a person who appears twice (the old app's "important relationship"). This slice draws such a person under each parent that asserts them, which is honest but can repeat a subtree. Both belong on a lens, per viewer — picking one place and storing it on a relationship would be a canonical-value decision about someone else's whakapapa (rule 1).
- **Opening a person in the tree to see their profile.** A `Person` is not a `Profile`, and what a person-detail panel should show from a single source is unsettled.
- **Named whakapapa records, and more than one of them**, with their own names, images and permissions. See above.
- **Drawing a whakapapa upwards.** The shipped lens had a `mode` of `ancestors` or `descendants`; this slice draws descent only.
- **Multi-device.** A second device has its own agent key, so it is a different source with its own chain and sees none of this (the same limit `own-profile` already has). Nothing here assumes one device, but nothing here fixes it either.
- **Parity screenshots of a populated tree.** `docs/old-app-capture/` has only the old empty whakapapa-records page, and that page is not being rebuilt. Capturing the old app's tree needs whakapapa data in a running old app; see design, "Risks".

## Open Questions

- **Where `sibling-of` is drawn** when no shared parent is asserted. The design draws them beside their sibling; a tree of descent has no natural place for them. The trade-off behind having the type at all is recorded in design D9.
- **What the empty state says, in te reo Māori and English.** The spec fixes what it must and must not say; the wording is the slice owner's.

Answered and deferred, rather than open: **several focus ancestors** (each starts its own tree here; a person picking and keeping a focus is a lens, above) and **where a person who appears twice is drawn** (under each asserting parent here; choosing is a lens).
