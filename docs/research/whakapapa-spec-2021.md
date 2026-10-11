# What the 2021 whakapapa spec got right, and what we dropped

Read on 2026-10-11 while [#79](https://github.com/ahau01/ahau-v2/pull/79)
(the `add-own-whakapapa-view` change) was open for review, to check the v2
relationship model against the one Āhau actually shipped.

Claims are traced to source, each pinned to the commit it was read at (see
**Sources**). **Dates matter here and are not all 2021**: the spec repo's
README is November 2021, but `ssb-whakapapa` and `ssb-profile` were read at
their current HEADs (2023-12 and 2024-04), so they show where Āhau *ended
up*, not where it started. Nothing below was run; it is all reading.

---

## 1. TL;DR

Three findings change what we should build, in order of how much:

1. **We dropped the view, and with it the only home for render-layer
   decisions.** The 2021 model had three record types, not two: profiles,
   links, and a `whakapapa/view` that holds the focus, which profiles to
   ignore, and which parent counts as primary where someone has several.
   #79's proposal says there is "no whakapapa-record object", which is right
   about the *named, shared, permissioned record* but also discarded the
   lens. Both of #79's flagged open questions — which root is the focus, and
   where a person who appears twice is drawn — are view questions, and they
   became open questions precisely because we left nowhere to put them.
   CLAUDE.md rule 1 says choosing which version to show is "a render-layer
   decision, per viewer"; the 2021 design had a record type for exactly that.
2. **`relationshipType` is missing from our `Assertion`, and it carries
   whāngai.** The shipped child link is
   `birth | whangai | adopted | unknown` plus a `legallyAdopted` boolean, and
   the partner link is `partners | married | divorced | unknown`. Our
   assertion has a kind and two people and nothing else, so a fixture cannot
   express a whāngai relationship — a specifically Māori relationship form,
   dropped by omission rather than by decision.
3. **Retraction wants a reason.** Removal in the shipped plugin is
   `tombstone: { reason, date }`, and the record still reads back with it.
   #79's design says a reason could be added later "without changing the
   shape"; the shipped version shows it was wanted in practice from the
   start.

Two things we should keep doing, now with evidence behind them (§4), and one
documented near-miss that is the best argument in the project's own history
for CLAUDE.md rule 1 (§3.4).

## 2. What the 2021 spec says

Three record types (`whakapapa-spec` README, 2021-11-22):

| Concept | Type | What it is |
|---|---|---|
| People | `profile/person`, `profile/person/admin` | a profile per person, per scope |
| Relationships | `link/profile-profile/child`, `.../partner` | child is directed parent → child; partner is described as *undirected* |
| Views | `whakapapa/view` | "defines the focus — where to start drawing and some other rules, like how to resolve duplication" |

By 2023–24 the person types had grown to four — `public`, `group`, `admin`
and `source`, the last being "a personal profile for you alone, your 'source
of truth'" (`ssb-profile` `spec/person/source.js`). So the same human was
routinely described by several records in several scopes. Multiple
descriptions of one person was the normal state of that system, not an
anomaly.

## 3. Findings that bear on #79

### 3.1 The view is a lens, and it is in the drop-nothing checklist

`whakapapa/view`'s shipped shape (`ssb-whakapapa` `spec/whakapapa-view.js`):
`name`, `description`, `image`, `focus`, `recordCount`, and under an explicit
`/* rules */` comment: `mode` (`ancestors | descendants`), `permission`
(`view | edit | submit`), `ignoredProfiles` (a set), and
`importantRelationships` (a map of profile → the relationships that count).

This also survived into our own frozen Leg 1 contract, which CLAUDE.md
treats as the checklist so nothing is dropped —
`reference/leg1-contract/contract/types/records.ts:121-148` carries
`WhakapapaView` with `focus`, `ignoredProfiles` and `importantRelationships`,
and its doc comment states the separation outright: *"A saved lens over the
whakapapa — not the graph itself. The graph is the links."*

**What to do.** Nothing needs building in a read-only personal slice: with
one source and no stored preferences, computing every parentless person as a
root is fine. But #79 should stop implying the concept is gone, and should
name the lens as where focus and duplicate-drawing live when they arrive —
per viewer, never stored on a relationship. That reframes both of its open
questions from "unanswered" to "answered, deferred", and it keeps the next
person from solving them on the assertion, which is the regression rule 2
warns about.

### 3.2 Immutable endpoints, mutable metadata

The shipped link specs split their fields two ways: `staticProps` for
`parent` and `child` (`required: true`, fixed at creation) and `props` for
`relationshipType` and `legallyAdopted`, which are mutable through
`@tangle/overwrite`.

So *who a relationship is between* was already immutable in the shipped
model — the same property #79's design D2 argues for. What was mutable was
only the characterisation. That is a middle path our design does not have,
and does not need: with retraction, correcting `birth` to `whangai` is a
retraction plus a new assertion, which is more honest than an overwrite and
costs one extra entry.

### 3.3 A relationship is sensitive independently of the people it relates

Links select their own recipients. The Leg 1 contract says why
(`records.ts:105-112`): *"Carries its own visibility rather than inheriting
either person's. A relationship can be more sensitive than either individual
on its end."*

The spec repo's NOTE C shows this was learnt the hard way: they refused to
allow whakapapa links to profiles in a parent group because *"which group
should the link be encrypted to? the current standard is to encrypt to the
child... but then that could reveal a birth relationship that is only for
kaitiaki to know"*.

**For the group-permissions slice**, not this one: visibility must not be
inherited from either person. #79 publishes nothing, so it cannot get this
wrong, but a later slice that permissions people and lets relationships
follow would reveal exactly what NOTE C describes.

### 3.4 The duplicate-on-registration problem, and the pull toward erasure

The spec repo's NOTE B records an unsolved problem: a kaitiaki creates an
"unowned" profile for someone (a profile with no `link/feed-profile` tying it
to a device key), that person later registers, and registration creates a
second profile for the same human. The options written down were *"delete the
unowned profile from whakapapa"* or *"detect the duplicate during
registration, and handle it automatically — tombstone + redirect?"*

Both are erasure of one account of a person in favour of another. This is the
clearest instance in the project's own history of the pressure CLAUDE.md
rule 1 exists to resist, and it arrived not as a bad decision but as the
obvious next step once two records described one human.

The v2 answer, in #79, is that there is no problem to solve: a `Person` is a
source's description, two sources describing one human are two descriptions,
and nothing matches them by name or merges them. The one identity tie —
`Person::Myself` — is the authoring key itself, so it cannot be asserted
about anyone else. Note the inversion: "unowned" was an anomaly to be
resolved in the old model, and is the normal case in ours.

Worth keeping: the old model tied a profile to a key with a written record
(`link/feed-profile`, feedId → profile), which raises "who may write that
link". Deriving it from authorship removes the question rather than answering
it.

## 4. Where we already match, with evidence

- **Source on every read.** The shipped `get` returns `originalAuthor`
  alongside the link's fields (`ssb-whakapapa` README; `test/method/link/tombstone.test.js`).
  #79's read model stamping every person and relationship with its source is
  what the old system already did.
- **Removal does not erase.** A tombstoned link still reads back, carrying
  `tombstone: { reason, date }` (same test). This is `contract-decisions` §1
  observed in a shipped implementation, not only argued.
- **Conflicts surfaced, not resolved.** Read results carry `conflictFields`
  and `states` — where concurrent writes disagreed, the reader was told, and
  the competing states were listed rather than one being picked. Field-level
  "represent both", in production, in 2021.
- **Partner is symmetric.** The spec calls the partner link *undirected* —
  though its stored fields are still named `parent` and `child`
  (`spec/link/profile-profile/partner.js`), so the names lie for half the
  link types. #79's `subject`/`object` avoids that; worth not copying.

## 5. Gaps this opens for the write slice

Not #79's scope — it writes nothing — but each is a field the entry shapes
will need, and each is cheap to add now and awkward later:

- `relationshipType` on assertions, including **whāngai** (§1.2).
- A `reason` on retractions (§1.3).
- **No `sibling-of` link existed.** The shipped model had only child and
  partner; siblings were implied by a shared parent. #79 adds `sibling-of` as
  a third kind, which is why it has to ask where a parentless sibling is
  drawn. The trade-off is real both ways: deriving siblings instead means
  inventing a placeholder parent nobody described, which is its own rule-1
  problem. Ours is probably the better of the two, but it was not a
  considered choice and should become one.
- **Death and life span.** `profile/person/source` carries `deceased`,
  `placeOfDeath`, `buriedLocation` and an `aliveInterval` string, where our
  `Profile` has only `date_of_birth`. The old app's "hide deceased" filter
  needs `deceased`, and a whakapapa of ancestors needs death dates. Note that
  Āhau moved from separate dates to a single interval, which is the opposite
  direction from our `PartialDate` — worth understanding before copying
  either (see #55, one place for the profile field list).
- **`mode: ancestors | descendants`.** The old view could draw upward as well
  as down. #79 draws descent only and does not flag direction as deferred.

## Sources

Each read at the commit named. Dates are the commit dates.

| Source | Commit | Date |
|---|---|---|
| `gitlab.com/ahau/spec/whakapapa-spec` README | `25c5e50` | 2021-11-22 |
| `gitlab.com/ahau/ssb-whakapapa` (`spec/`, `method/`, `test/`, README) | `04e0b5d` | 2023-12-11 |
| `gitlab.com/ahau/ssb-profile` (`spec/`) | `64cc2da` | 2024-04-11 |
| `reference/leg1-contract/contract/types/records.ts` | this repo | frozen reference |

The two plugin repos are years newer than the spec repo, so where they
disagree with it, they are the later word on how Āhau worked — and neither is
evidence of how Āhau works *today*, which was not checked.
