# Contract decisions

Why the cross-cutting semantics of the Āhau v2 data-access contract are shaped
as they are. Each governs many operations, so each was settled before any
operation was written.

Recorded as reasoning rather than as conclusions on purpose. The contract is
being designed without a screen consuming it and without a backend implementing
it — the PRD calls this twice-blind and lists it as the top risk. When Leg 2
attaches a real protocol and something here proves wrong, the next person should
be able to re-derive the decision rather than re-guess it.

**Status of the protocol claims below**: they rest on the documented behaviour of
Holochain's delete and link model and nostr's NIP-09 and relay semantics, made
without an adapter in hand. They are the most likely thing here to need
correction at Leg 2, Milestone 1.

---

## 1. Deletion is retraction

**Decision.** Removal is modelled as retraction. The contract promises exactly
one thing: subsequent reads from this backend will not return the record. It
does not promise the data is gone, nor that parties already holding it will
forget it. A `retractionPropagates` capability says whether the retraction
reaches anyone else.

**Governs** nine accessors: `deletePerson`, `deleteSettings`, `deleteTribe`,
`deleteSubGroup`, `deleteStory`, `deleteCollection`, `DELETE_ARTEFACT`,
`tombstoneSubmission`, `proposeTombstone`.

**Not governed**: `deleteAhau`, despite the name, is not a retraction. It
deletes the local database and resets the application, so it removes a
*store* rather than a *record*. What survives it — on peers, on relays, or in
a Holochain DHT — is untouched by it, and the contract must not let the two
ideas share a shape.

**Why.** None of the candidate backends erases anything.

| Backend | What removal actually is |
|---|---|
| SSB | A tombstone appended to an append-only log; the original is replicated and stays |
| Holochain | A Delete action on the source chain; the original entry remains on the chain |
| nostr | A deletion *request* (NIP-09) that relays may honour, ignore, or never see |

All three are append-only or effectively so, and all three implement removal as
a new record asserting it. A contract promising deletion would be promising
something no adapter could deliver.

**What it costs.** The UI can no longer say "deleted" and mean gone. That cost
is already paid: the current frontend selects `tombstone.date` in person
queries, so soft deletion is visible on screen today.

**Alternative rejected.** A boolean `delete` that throws on failure. Cheaper
across 9 operations, but it lies, and for whakapapa the lie matters — people
will reasonably assume removal means removal.

---

## 2. Writes acknowledge as committed or partial

**Decision.** Every write returns `{ id, acknowledgement }`, where
acknowledgement is `committed` or `partial` with counts and failures.

**Governs** all 40 write operations.

**Why.** The identifier means different things and arrives at different times.

| Backend | Identifier | What it implies |
|---|---|---|
| SSB | Message key | Written to the local log |
| Holochain | ActionHash | Committed to the agent's source chain, readable back immediately |
| nostr | Event id | Nothing — it is a content hash known *before* publishing |

Two states rather than three. SSB and Holochain are both `committed` from the
application's point of view; onward propagation is the network's concern. nostr
differs in kind, because an event is offered to several relays that accept or
refuse independently, so partial acceptance is a genuine outcome.

**What it costs.** Forty call sites handle more than "it worked".

**Alternative rejected.** Returning a bare id and throwing on failure. It
matches what the current frontend expects and is far less invasive, but it makes
partial acceptance invisible — the UI would report success for a write that
reached zero relays. That is a correctness bug, and catching this class of thing
early is what Leg 2 exists for.

---

## 3. Paired writes are one operation, with atomicity declared

**Decision.** A paired write is a single contract operation. Callers never
orchestrate the pair. An `atomicMultiWrite` capability says whether the halves
move together; where it is false the operation reports which parts succeeded.

**Governs** `deleteTribe`, `updateTribe`, `deleteSubGroup` — in the contract,
`retractGroup`, `updateGroup`, and subgroup membership removal.

**Why.** An Āhau group is a paired record: a discoverable public profile and a
members-only private one. How many records an operation touches is the adapter's
business, and letting that pairing reach the frontend would be the same mistake
the rebuild is correcting elsewhere.

Holochain commits multiple entries in one zome call and gets atomicity. nostr
publishes two independent events and cannot, so a client crashing between them
leaves a group half-updated or half-retracted — observable, and worth surfacing
rather than hiding.

**What it costs.** A caller that cares must check the result shape. Most do not.

**Alternative rejected.** Requiring atomicity outright. It would disqualify
nostr before the Leg 2 experiment runs, which defeats the point of running it.
Requiring nothing was also rejected: it pushes half-completed-state handling
into every caller.

---

## 4. Traversal stays a walk

**Decision.** Graph traversal is expressed as a walk — "give me the descendants
of X" — not as a filter over links. A backend that cannot traverse natively
still exposes a walk; its adapter fetches and walks internally. A
`maxTraversalDepth` capability lets an adapter decline a deep walk rather than
hang on it.

**Governs** `getDescendantLinks`, `getFamilyLinks`, `getAllStoriesByMentions`.

**Why.** This was initially recorded during triage as the sharpest threat to
Leg 2's zero-frontend-changes metric, on the reasoning that nostr cannot
traverse, so the contract would have to become filter-shaped and push walking
into the frontend.

That was the pessimistic reading, and it is wrong. A nostr adapter *can*
implement a walk — it fetches candidate links and walks them itself. The
complexity lands in the adapter, which is exactly where this project's thesis
wants it: a protocol experiment should cost an adapter, not a rewrite. The
filter-shaped contract is the option that would have broken the metric, by
moving graph logic frontend-side.

| Backend | How a walk is served |
|---|---|
| SSB | Server walks and returns links |
| Holochain | `get_links` per hop, with the multi-hop walk written into a zome |
| nostr | Adapter fetches candidate links and walks them client-side |

**What it costs.** The nostr adapter does real work, with performance
characteristics unlike the others, and may need caching.

**Counterweight.** `getAllStoriesByMentions` runs *better* on nostr than on
Holochain, since tag filtering is what relays do natively while Holochain would
need links maintained on every write. The capability ordering genuinely inverts
between operations, which is the strongest argument in the corpus for
negotiation over a lowest-common-denominator design.
