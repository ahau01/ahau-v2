# Decentralized backend research

Primary-source research for Leg 2, done ahead of any adapter work. Two
questions: whether other genealogy software has already solved the
backend-agnosticism problem this repo is solving, and how the three named
decentralized candidates — plus SSB, the incumbent — actually behave against
this contract's shape (69 operations, 14 domains, capability negotiation,
retraction-not-deletion, enforcement levels).

Every claim below cites a primary source: protocol specs, official docs, or
source repos. Secondary commentary is marked as such and used only for
maintenance-status signals a primary source wouldn't state (e.g. "is this
project still active").

**Status of the claims below**: none of this has been tested against the
contract. It is reading, not experiment. Where Leg 2 disagrees with something
here, the disagreement is evidence, not an error in this document.

---

## Part 1 — Genealogy software: pluggable backends and decentralization attempts

### Summary table

| Project | Storage architecture | License | Maintenance | Decentralized backend work |
|---|---|---|---|---|
| [Gramps](https://github.com/gramps-project/gramps) | Tightly coupled: a Python object model + pluggable *local* backends (SQLite, BSDDB, or an XML-in-directory "Gramps XML" tree) selectable per family tree, but no network/pluggable-protocol layer | [GPL-2.0-or-later](https://www.gramps-project.org/wiki/index.php/Project_License) | Active (desktop app, 20+ years) | None found |
| [Gramps Web](https://www.grampsweb.org/development/frontend/architecture/) / [Gramps.js](https://github.com/gramps-project/gramps-web) | REST API ([web-api](https://github.com/gramps-project/web-api)) in front of a Gramps database; frontend talks only to the API, not to a storage engine directly | GPL-2.0-or-later (same project) | Active | None found |
| [webtrees](https://webtrees.net/) | PHP app on a SQL database (MySQL/MariaDB/PostgreSQL/SQLite via Laravel's Illuminate query builder); GEDCOM import/export is the interchange format, not the live store | [GPL-3.0-or-later](https://github.com/fisharebest/webtrees) | Active | None found |
| [WikiTree](https://www.wikitree.com/wiki/Help:API_Documentation) | Centralized single-instance wiki; the [WikiTree API](https://github.com/wikitree/wikitree-api) is read-mostly HTTP/JSON over the one dataset, gated by WikiTree's own [Trusted List](https://www.wikitree.com/wiki/Help:API_Documentation) model, not a backend abstraction | API code MIT; site data under WikiTree's own [terms](https://www.wikitree.com/about/terms.html) (not portable/GPL) | Active | None found — API is a read layer over one server, not a swappable transport |
| [FamilySearch GEDCOM X](https://github.com/FamilySearch/gedcomx) | A *data model and interchange spec* (conceptual model + XML/JSON/RS serializations), not a running system. It is the closest prior art to this repo's contract in spirit — model independent of protocol — but it never had to survive a decentralized backend | Apache-2.0 | Effectively dormant; superseded operationally by GEDCOM 7 (last conceptual-model activity years ago, per repo history) | None — it predates the decentralized-protocol conversation entirely |
| [GEDCOM 7](https://gedcom.io/specs/) | A *file format*, not an architecture. Its [`RESN`](https://gedcom.io/terms/v7/RESN) structure (`CONFIDENTIAL`/`LOCKED`/`PRIVACY`) is the field-level privacy flag it offers — advisory, honored by exporting/importing software, not enforced by any protocol | Free spec, maintained by FamilySearch | Active (v7.0.18, Feb 2026 per [gedcom.io](https://gedcom.io/)) | None — GEDCOM is transport-agnostic by never specifying a transport |

### What did not turn up

- **No Holochain hApp for genealogy or whakapapa.** Searching Holochain's own
  org repos ([github.com/holochain](https://github.com/holochain),
  [github.com/holochain-apps](https://github.com/holochain-apps)), the hApp
  directory (`happ-index`/`happ-store`), and the current
  [hAppenings Community](https://happeningscommunity.substack.com/) ecosystem
  writeups turned up project-management, messaging, video, publishing and
  reputation hApps (Acorn, Vines, Presence, HummHive, Sacred Capital) but no
  genealogy or family-tree hApp, published or discussed. This repo's own PRD
  history (`docs/history/leg1/ahau-v2-repo-foundation.prd.md`) references a
  `~/projects/Holochain/ahau_holo` **tutorial exercise**, explicitly flagged
  there as "not a starting point. Ignore." — i.e. prior Āhau work touched
  Holochain only as a learning exercise, not as a genealogy-hApp attempt worth
  reusing.
- **No nostr NIP models genealogical/kinship data.** The
  [NIPs repo](https://github.com/nostr-protocol/nips) has proposals for
  everything from fruit trees (a literal plant NIP, issue
  [#990](https://github.com/nostr-protocol/nips/issues/990)) to reviews, but
  nothing for parent/child, ancestor/descendant, or family-group relationships.
  The closest primitives — [NIP-02](https://github.com/nostr-protocol/nips/blob/master/02.md)
  (follow lists) and [NIP-51](https://github.com/nostr-protocol/nips/blob/master/51.md)
  (generic lists) — model *social* graph edges (follow/mute/pin), which are
  directionless-enough and revocable-enough that they do not carry kinship
  semantics (a "follow" is not a "parent of"). This is a genuine gap, not a
  search miss.
- **No ATProto lexicon for family/relationship graphs beyond the generic social
  graph.** ATProto's core identity lexicons handle DIDs/handles; Bluesky's
  `app.bsky.graph.*` lexicons handle follows, blocks and lists (see
  [atproto.com/guides/social-graph](https://atproto.com/guides/social-graph)).
  Nothing in the [Lexicon overview](https://atproto.com/guides/lexicon) or the
  [bluesky-social/atproto](https://github.com/bluesky-social/atproto) repo
  models kinship. Any genealogy app on ATProto would define its own lexicon
  from scratch — which the protocol explicitly supports (see Part 2) but which
  nobody has published yet.

### The closest thing to a pluggable-backend genealogy precedent

Gramps Web is the one project in this space with an architecture resembling
this repo's contract-then-adapter shape: [Gramps Web API](https://github.com/gramps-project/web-api)
is a defined REST surface, and the [Gramps.js](https://www.grampsweb.org/development/frontend/architecture/)
frontend is written against that surface rather than against a database
directly. But the abstraction stops at "REST over one Gramps database
instance" — nobody has swapped the store underneath for anything decentralized,
and the API was not designed with capability negotiation between backends of
different strengths, which is the specific problem this repo's contract
exists to solve. GEDCOM X and GEDCOM 7 are worth naming for the same reason
this repo names its own decisions record: they show that a genealogy-specific
data model *can* be specified independent of any storage engine — GEDCOM X
explicitly separates a conceptual model from its serializations
([conceptual-model-specification.md](https://github.com/FamilySearch/gedcomx/blob/master/specifications/conceptual-model-specification.md)) —
but neither has ever had to answer to a backend that can't guarantee
deletion, atomicity, or enforced permissions, which is exactly the terrain
`contract-decisions.md` is mapping.

---

## Part 2 — Decentralized frameworks as backend candidates

Four systems, in the order this repo's own history raised them: SSB (the
incumbent, per the README's "GraphQL-over-Scuttlebutt"), then Holochain and
nostr (the two named in `ahau-v2-frontend-rebuild.prd.md`'s experiment set),
then ATProto (raised by Dominic Tarr's assessment, per the same PRD, as
untested). A short pass over other decentralized frameworks follows for
completeness.

### Comparison table

| | **SSB** | **Holochain** | **nostr** | **ATProto** |
|---|---|---|---|---|
| Core model | Per-agent append-only signed log ([protocol guide](https://ssbc.github.io/scuttlebutt-protocol-guide/)) | Per-agent source chain + shared validated DHT, one per hApp/DNA ([architecture concept](https://developer.holochain.org/concepts/2_application_architecture/), [DHT concept](https://developer.holochain.org/concepts/4_dht/)) | Signed events broadcast to independent relays; no shared ledger ([NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md)) | Signed per-account repo (Merkle Search Tree) on a PDS, aggregated by App Views ([atproto.com/guides/overview](https://atproto.com/guides/overview)) |
| Deletion | Tombstone appended to the log; original replicated data is not erased ([leg1-contract.md](leg1-contract.md#cross-cutting-semantics)) | `Delete` action on the source chain; original entry remains, addressable by history ([DHT concept](https://developer.holochain.org/concepts/4_dht/)) | Deletion *request* ([NIP-09](https://github.com/nostr-protocol/nips/blob/master/09.md)); relays may honour, ignore, or never see it | Repo commits are mutable/rewritable by the account owner on their own PDS, but anything already federated to a relay/App View or cached by a third party is out of the owner's control |
| Access control / permissions | None at protocol level; visibility is a social convention enforced by the follow graph and by whom a message is encrypted to | Capability grants on the source chain — unrestricted, transferable (token), or assigned (token + signature) — revoked by deleting/updating the grant entry ([capabilities concept](https://developer.holochain.org/concepts/8_calls_capabilities/)) | None; relays enforce only what they choose to (`AUTH` per [NIP-42](https://github.com/nostr-protocol/nips/blob/master/42.md) is relay-side, not record-side) | DID separates signing keys (day-to-day) from rotation keys (account recovery/migration); no protocol-level per-record ACL — permissions are an app-lexicon concern |
| Offline-first | Yes — local-first by design; peers gossip on reconnect via EBT ([protocol guide](https://ssbc.github.io/scuttlebutt-protocol-guide/)) | Yes — hApp runs fully locally; DHT sync resumes on reconnect ([architecture concept](https://developer.holochain.org/concepts/2_application_architecture/)) | Partial — clients can queue signed events, but reads depend on relay connectivity; no protocol-level local replica | No — PDS is the source of truth; a client without PDS connectivity has whatever it cached, not a synchronizing local copy |
| Query / graph traversal | Client-side; server "walks" only in that the client's own indexer does ([leg1-contract.md](leg1-contract.md#cross-cutting-semantics)) | `get_links` per hop from an anchor/base; multi-hop walks are written into a zome, not given for free by the DHT ([DHT concept](https://developer.holochain.org/concepts/4_dht/) — links/anchors are the next topic in that doc series, confirmed absent from DHT-level guarantees) | None natively; `REQ` filters (tag/author/kind, [NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md)) let a client fetch candidates, then walk client-side; `COUNT` ([NIP-45](https://github.com/nostr-protocol/nips/blob/master/45.md)) is the only relay-side aggregation | AppViews provide indexed, queryable aggregation (e.g. Bluesky's own service) — but that is a centralizing convenience layer built *on top of* an otherwise append-only repo, not a protocol guarantee every PDS offers |
| Maturity / SDKs | Mature but stalling — see below | Public 1.0 mainnet reached; ecosystem is early-production ([hAppenings 2025 review](https://happeningscommunity.substack.com/p/the-holochain-ecosystem-in-2025-a), secondary source) | Mature protocol, huge client ecosystem, JS/TS SDKs first-class ([nostr-protocol/nips](https://github.com/nostr-protocol/nips)) | Mature for Bluesky's own use; growing third-party app ecosystem ([TechCrunch survey, June 2025](https://techcrunch.com/2025/06/13/beyond-bluesky-these-are-the-apps-building-social-experiences-on-the-at-protocol/), secondary source); official TS packages under `@atproto/*` |

### SSB — the incumbent baseline

Per the [Scuttlebutt protocol guide](https://ssbc.github.io/scuttlebutt-protocol-guide/),
each identity is an Ed25519 keypair whose feed is a strictly append-only,
hash-chained log — "once a message is posted it cannot be modified." Consent
has no protocol representation: what a peer replicates is decided by that
peer's own follow graph, and private messages are asymmetric-encrypted to an
explicit recipient list the sender chooses (recipients cannot even discover
each other unless named in the plaintext). There is no capability system,
no relay-style access gate, nothing resembling this contract's
`EnforcementLevel` — access control is entirely social and entirely
client-side. This matches `contract-decisions.md`'s description of SSB
tombstones and is consistent with `ahau-v2-repo-foundation.prd.md`'s
recorded assessment from Dominic Tarr, SSB's original author (paraphrased,
per that PRD, as relayed to the product owner): SSB was a proof of concept
and future work should look at nostr or ATProto instead. Independently,
SSB's own creator community appears to agree in practice — André Staltz, a
lead SSB/Manyverse developer, is building
[PPPPP](https://github.com/staltz) as a from-scratch successor rather than
an SSB upgrade (secondary source: the SSB Wikipedia history section and
Staltz's own repos), citing a scaling flaw where clients must download
gigabytes of history to participate. That is external corroboration of the
"ecosystem stall" this repo's PRD already flagged as a reason to move off
SSB, not a new finding.

### Holochain

Holochain is **agent-centric**, not server-centric: per the
[application architecture concept doc](https://developer.holochain.org/concepts/2_application_architecture/),
each participant runs a **cell** — an agent identity paired with a **DNA**
(the app's shared validation rules and data schema) — and maintains their own
**source chain**, a personal hash-chained history. Cells in the same DNA
network form a **DHT** that shards storage of published entries and their
metadata across peers, with authorities validating incoming data against the
DNA's rules before integrating it; violations produce **warrants** that
propagate so peers can block bad actors (the
[DHT concept doc](https://developer.holochain.org/concepts/4_dht/) calls this
an "immune system" response). Deletion is a `Delete` action recorded on the
chain; the original entry is not erased, only marked retracted — which is
exactly the behaviour `contract-decisions.md` already assumes when it says
"Holochain commits a Delete action... the original entry remains."

Access control is genuinely per-function and revocable: Holochain's
[capability-based security](https://developer.holochain.org/concepts/8_calls_capabilities/)
lets an agent grant `unrestricted`, `transferable` (bearer token), or
`assigned` (token + signature) access to specific zome functions, as an entry
on their own source chain that they can delete or update to revoke. This maps
onto this contract's `enforced`/`advisory`/`unsupported` distinction more
naturally than any of the other three candidates, because Holochain's grants
are actually enforced by the conductor rather than advisory-by-convention.
Offline-first is native — a hApp runs fully locally against the agent's own
source chain and re-syncs the DHT on reconnect. The open question is
traversal: the DHT concept doc frames links and anchors (Holochain's
mechanism for `get_links`-based graph walks) as a *separate* topic from the
DHT's own guarantees, meaning multi-hop walks — "descendants of X," "common
ancestors of X and Y" — are something a zome author writes, not something the
protocol gives for free. That is consistent with `contract-decisions.md`'s
own framing of traversal as "a multi-hop walk written into a zome."

Maturity: Holochain reached its RSM (1.0-class) mainnet, and the current
hApp ecosystem (per the [hAppenings Community's 2025 review](https://happeningscommunity.substack.com/p/the-holochain-ecosystem-in-2025-a),
a secondary but well-informed source) lists production and near-production
tools — Moss's Vines (messaging), Acorn (project management, in alpha), Unyt
(accounting), HummHive (publishing) — but nothing genealogy-specific, and the
ecosystem's own writers describe it as small and still consolidating. SDK
support is Rust for the conductor/zome side; client-side calls are made over
WebSockets, with JS/TS client libraries (`@holochain/client`) existing but
the zome logic itself is not TypeScript, unlike the reference implementation
in this repo.

### nostr

Per [NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md), the
entire data model is: a signed JSON `event` (author pubkey, kind, tags,
content, signature), published by a client to one or more relays, which
independently accept or reject it. There is no shared ledger and no
DHT — each relay is just a server the client chose to trust for that publish.
This is why `contract-decisions.md` treats a nostr write as genuinely
partial-by-default rather than a `committed`/`partial` binary matching
SSB and Holochain: "an event is offered to several relays that accept or
refuse independently." Deletion is [NIP-09](https://github.com/nostr-protocol/nips/blob/master/09.md),
a *request* event (`kind: 5`) a relay may or may not honour — there is no
enforcement path back to relays that never saw the request or chose to keep
serving the original event anyway.

Access control is structurally absent at the protocol level: nostr has no
concept of a record-level ACL. The nearest thing to "consent" is
[NIP-42](https://github.com/nostr-protocol/nips/blob/master/42.md), relay-side
authentication that gates *connections*, not individual records; encryption
([NIP-44](https://github.com/nostr-protocol/nips/blob/master/44.md), superseding
the deprecated NIP-04, plus [NIP-59](https://github.com/nostr-protocol/nips/blob/master/59.md)
gift-wrapping for metadata privacy) is how nostr apps *simulate* per-record
privacy, entirely client-side and entirely opt-in per event. This is the same
gap `ahau-v2-frontend-rebuild.prd.md` names directly: "nostr has no native
access control, is public-by-default, and treats deletion as a request relays
may ignore," and the same PRD asks outright whether nostr could ever host
whakapapa in production given tribal data sovereignty concerns — that
question remains open and is not answered by this research; it is a Leg 2
question with an experiment already scoped to answer it.

Social-graph primitives exist ([NIP-02](https://github.com/nostr-protocol/nips/blob/master/02.md)
follow lists, [NIP-51](https://github.com/nostr-protocol/nips/blob/master/51.md)
generic lists) but model *symmetric-enough, revocable* social edges
(follow/mute/pin) — nothing like a directed, permanent, provenance-bearing
"is a parent of" edge. An adapter would have to invent that edge type as an
application-defined event kind, same as it would for anything else nostr
doesn't standardize. Traversal is entirely client-side: `REQ` filters
([NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md)) fetch
candidate events by author/kind/tag, and the client walks them — which is
exactly the shape `contract-decisions.md` describes ("the adapter fetches and
walks internally") and the one place it notes nostr can actually *outperform*
Holochain: `getAllStoriesByMentions`-style tag lookups are what relays already
do natively, versus Holochain needing links explicitly maintained on every
write. Maturity and TS support are both strong — nostr's client ecosystem is
large and mostly JavaScript/TypeScript-first, which is the best SDK-language
match to this repo's stack of the three named candidates.

### ATProto

Per the [AT Protocol overview](https://atproto.com/guides/overview) and
[social graph guide](https://atproto.com/guides/social-graph), each account
has a **Personal Data Server (PDS)** hosting a signed **repository** — "like
a git repo but for database records" — structured as a Merkle Search Tree, so
any two replicas can diff and sync efficiently. Records are typed by
**Lexicon** schemas (a global, versioned schema namespace –
[atproto.com/guides/lexicon](https://atproto.com/guides/lexicon)), which is
the one candidate here that gives an adapter a first-class way to *define its
own record types* (e.g. a `nz.ahau.person` or `nz.ahau.link` lexicon) rather
than overloading a generic event/entry shape — closer in spirit to this
repo's own typed contract than nostr's untyped event kind numbers or
Holochain's per-DNA entry types (which are equally typed, just Rust-typed
rather than published-as-a-network-schema).

Identity is DID-based, with signing keys (day-to-day repo commits) separated
from rotation keys (DID document changes, e.g. changing PDS or recovering an
account) per the overview doc. This buys account portability between PDS
providers, but there is **no protocol-level per-record access control**:
a PDS serves what it has, and anything indexed by a relay or App View is
effectively public once federated, the same practical problem nostr has once
an event reaches even one relay. Bluesky's own `app.bsky.graph.*` lexicons
model follows/blocks/lists, not kinship, and no family/relationship lexicon
exists anywhere in the ecosystem searched for this document — an adapter
would be first to define one, same situation as nostr. Query/indexing is the
one place ATProto's architecture differs materially: **App Views** (the layer
Bluesky itself is built on) provide the indexed, queryable aggregation that
nostr and Holochain leave to the client or to a bespoke zome — but that
capability is an *application-layer convenience* someone has to run, not a
guarantee every PDS gives for free, and it reintroduces something close to a
central index for anything wanting fast graph queries. Offline-first is the
weakest of the three: the PDS is the durable source of truth and a client
without connectivity to it has only whatever it cached — no local source
chain, no local replica of the whole thing the way SSB and Holochain give.
Maturity is real (Bluesky itself, plus a growing set of third-party ATProto
apps per a June 2025 [TechCrunch survey](https://techcrunch.com/2025/06/13/beyond-bluesky-these-are-the-apps-building-social-experiences-on-the-at-protocol/),
secondary source), and the official SDK is TypeScript-first
(`@atproto/*` packages), the closest language match to this repo of all four.

### Other decentralized frameworks considered and set aside

- **Solid Protocol.** Per-user "Pods" with per-resource
  [Web Access Control](https://solidproject.org/TR/wac) — the most
  fine-grained, protocol-level, per-record ACL model found in this whole
  survey, genuinely closer to `enforced` field-level permissions than
  anything Holochain/nostr/ATProto offer natively. But Solid has no
  content-addressed sync model, no offline-first story comparable to SSB or
  Holochain (it's plain HTTP against a pod server), and no primary source
  found ties it to genealogy work specifically. Worth a longer look only if
  Leg 2's finding is that per-field consent enforcement matters more than
  offline operation.
- **Ceramic Network / ComposeDB.** Looked promising as a "GraphQL over a
  decentralized event log" model similar in shape to the old
  GraphQL-over-Scuttlebutt this repo is replacing — but the project
  [announced in 2025](https://blog.ceramic.network/the-future-of-ceramic-focusing-on-recall/)
  (secondary source, Ceramic's own blog) that ComposeDB and its Anchor
  Service are being shut down as the team pivots to an unrelated AI-agent
  product ("Recall"). Not a live candidate.
- **IPFS/OrbitDB, ActivityPub.** Neither surfaced any primary-source
  genealogy work, and neither offers something the four systems above don't
  already cover more directly for this contract's shape: IPFS/OrbitDB is
  content-addressed storage without an opinion on identity or access control
  (an adapter would have to build both from scratch, more work than any of
  the four candidates), and ActivityPub is federation between *servers*
  (inboxes/outboxes), which is a worse fit for whakapapa's kaitiaki/whānau
  permission model than any of the four — it assumes a server per
  account/community with no native per-record enforcement of its own, similar
  in that respect to nostr but with none of nostr's simplicity or
  TypeScript-ecosystem maturity.

---

## Synthesis — this researcher's read, not a repo decision

This is one researcher's assessment from primary sources, offered as input to
whoever runs Leg 2, Milestone 1 — not a call this repo has made. The PRDs are
explicit that the production backend choice is deliberately deferred past the
Holochain/nostr experiment, and nothing here should be read as pre-empting
that.

With that said: **none of the three named candidates is a clean fit**, and
the contract's own decisions record already knew this before this research
started — that's exactly why `capabilities` exists as a negotiated surface
rather than a lowest-common-denominator requirement.

- **Holochain** is the best match to what this contract's `EnforcementLevel`
  concept wants to express. Its capability grants are *actually enforced*,
  which is the one thing nostr and ATProto cannot offer natively, and its
  agent-centric, fully-offline model matches "community members without
  reliable connectivity" better than a relay- or PDS-dependent design. The
  cost is real: Rust for the actual validation/business logic (not
  TypeScript), a smaller and still-consolidating app ecosystem, and — per the
  contract's own traversal decision — multi-hop graph walks that have to be
  hand-written into a zome rather than given by the DHT. For a system built
  around kaitiaki permissions and tribal data sovereignty, "enforced" instead
  of "advisory" is not a nice-to-have; it is close to the whole point.
- **nostr** is the best match to this repo's own stack (TypeScript-first,
  mature client ecosystem, closest match on `maxTraversalDepth`-style
  client-side walking already assumed in the contract). But it is
  structurally public-by-default with deletion-as-request and no
  record-level access control, which sits badly against whakapapa's cultural
  protocols around who may see or edit what — the frontend PRD's own open
  question, "could nostr ever host whakapapa in production," reads to this
  researcher as likely "no" for anything beyond public, already-shareable
  facts, unless every sensitive field is client-encrypted, which pushes real
  complexity into every adapter and every UI screen that touches it.
- **ATProto** sits between the two: typed records via Lexicons (a genuinely
  good match to a 69-operation, 14-domain typed contract, arguably a better
  schema fit than nostr's numbered event kinds), TypeScript SDKs, real
  production usage beyond one company's own app — but no protocol-level
  per-record permission model, an indexing story that depends on someone
  running an App View, and the weakest offline story of the three. It reads
  as a stronger candidate than nostr on data-modeling fit, and a weaker one
  than Holochain on consent enforcement.
- **Solid** is the one system found whose access-control primitive
  (per-resource WAC) is closer to what tribal-record consent actually needs
  than any of the three named candidates — but it was never in the named
  experiment set, has no offline-first story, and nothing here demonstrates
  it against graph traversal at whakapapa's likely scale. Worth flagging as a
  fourth candidate worth a deliberate look, not worth substituting for the
  Holochain/nostr experiment already scoped.

If forced to rank for a Leg 2 target given this contract specifically: **Holochain
first**, because enforcement-not-advisory is the one property this contract
treats as load-bearing for kaitiaki permissions, and it is also the direction
this repo's own PRDs say was already reached independently. **nostr second**,
run anyway as scoped, precisely because its permission and deletion model is
the sharpest possible stress test of whether the contract's capability
negotiation is real or decorative — which is the PRD's own stated purpose for
including it. **ATProto** is the strongest case for a *third* adapter once two
exist, not a substitute for either: it would test the contract against a
typed-schema, PDS-hosted model that neither Holochain nor nostr represents,
and Dominic Tarr's recorded steer toward it should not be dropped just
because it wasn't in the original experiment set.
