# Holochain group permissions: primitives, patterns, data-flow models

> **Research note, not a decision.** Written 2026-10-03 for the first
> Holochain slice ([plans/group-permissions.md](../plans/group-permissions.md)),
> the single Holochain adapter being built and evaluated against a
> capability-specific exit criterion. It
> collects what Holochain's primary sources say about group permissions and
> sets out data-flow options against the kaupapa constraints in
> [CLAUDE.md](../../CLAUDE.md). Under "flag, don't decide", choices are left
> to humans (see §6).

**Baseline.** Holochain **0.7.0** (tag `holochain-0.7.0`, commit
`84cdce7`, 2026-07-30), with **hdk 0.7.0** and **hdi 0.8.0**
([HC Cargo][hc-cargo-hdk], [hdi][hc-cargo-hdi]). 0.7.1 and 0.8.0 exist only
as rc/dev tags ([tags][hc-tags]). There is **no data migration path into
0.7**: DNA hashes change and existing data must be cleared
([upgrade 0.7][dp-up07]). Everything below was checked against 0.7.0 source
or the docs source at `holochain/docs-pages@aff1076` (2026-09-01).

**How claims are marked.** **[V]** means verified from a primary source
(linked). **[I]** means my inference from verified facts, not stated by
Holochain. **[C]** means a community pattern or module, not official.
developer.holochain.org, docs.rs and holochain.org (which hosts the
whitepaper) were blocked from this environment. I read the **docs site's own
source** in `holochain/docs-pages` instead. Each docs link below goes to the
Markdown source at a pinned commit; the live page is
`https://developer.holochain.org/<same path>/`.

---

## Summary: key takeaways

1. **Capability grants are the wrong primitive for group write permissions.**
   They gate *calls into one agent's own cell* and nothing else. They do not
   gate who can write to, or read from, the shared DHT **[V]**
   ([capabilities][dp-cap]). Group permissions are enforced by
   **integrity-zome validation plus a membrane** **[V]**
   ([validation concepts][dp-c7-usecases]). The Holochain exit criterion is
   worded around "Holochain's capability-grant system". **Flag (§6, Q1).**
2. **Every member of a DNA can read every public entry in it.** A DNA is a
   network with one shared DHT. "Private" entry visibility is per-author, not
   per-group: the action is still published **[V]** ([DHT][dp-c4-private]).
   Without the unstable sharding feature, a 0.7 node holds either the full
   arc or none **[V]** ([Cargo.toml][hc-sharding]). In practice each
   participating member therefore stores the whole group DHT **[I]**. Group
   confidentiality needs a **separate DNA (clone cell) per group**, and/or
   **encryption** **[V/I]** ([cloning][dp-clone-keyed], [dnas][dp-dnas-seed],
   [crypto][dp-crypto]).
3. **Validation can't prove "not revoked".** `must_get_*` ignores links,
   updates and deletes **[V]** ([must_get][dp-mustget]). A missing dependency
   gives *UnresolvedDependencies* (retry), never *Invalid* **[V]**. Action
   timestamps are author-supplied and forgeable. The docs themselves call
   revocable privileges "challenging" **[V]**
   ([validation concepts][dp-c7-ts]). So a removed member who cites
   pre-removal role state can still author ops that pass validation **[I]**.
   The plan's Milestone 1 metric (§4.6) needs restating, or a model that cuts
   the removed member off at the network level.
4. **No app-level ejection exists in 0.7.** `block_agent`/`unblock_agent`
   were removed in 0.7.0-dev.8. Blocking is now "system-level behavior,
   triggered by warrants" **[V]** ([CHANGELOG][hc-cl-block]). Warrants are
   issued only for invalid ops or chain forks **[V]**
   ([agent status][dp-status], [CHANGELOG][hc-cl-forkwarrant]). A removed
   member who writes nothing invalid keeps gossiping and receiving new data
   in a shared DNA **[I]**. The only hard read cut-offs are a **new network**
   (re-clone with a new seed or membrane, called an "epoch" below) or
   **key rotation** for encrypted data **[I]**.
5. **Removal is retraction, and the source docs agree.** Delete marks data
   and erases nothing. "It is impossible to force another person to delete
   data once they have seen it" **[V]** ([entries][dp-entries-delete]). This
   matches [contract-decisions §1](../contract-decisions.md). A revoked
   member's already-synced copy is beyond the reach of any Holochain
   mechanism.
6. **One agent key equals one device.** DPKI was removed in 0.6 **[V]**
   ([upgrade 0.6][dp-up06-dpki]). Running one key on two devices forks the
   chain. Chain-fork warrants are stable since 0.7.0-dev.13, and warrants
   trigger network blocking **[V]**
   ([CHANGELOG][hc-cl-forkwarrant], [CHANGELOG][hc-cl-block]). Multi-device
   people therefore need **several agent keys linked at the app level**, and
   roles must be granted and revoked per key **[I]**. This is CLAUDE.md
   rule 4 made concrete.
7. **The nearest real implementation is Moss** (`lightningrodlabs/moss`)
   **[C]**. It uses a progenitor key in DNA properties, delegated
   `StewardPermission` entries cited by hash, and an open membrane where the
   network seed is the invite. Its permissions **cannot be deleted**, only
   expire, and expiry is checked against the author's own timestamp
   ([moss steward_permission.rs][moss-sp]). The older
   `holochain-open-dev/membrane-roles` has its validation **commented out**
   ([lib.rs][mr-lib]). `membrane-invitations` validates nothing
   ([lib.rs][mi-lib]). No maintained, official "roles" module exists.
8. **Testing: Sweettest is official, Tryorama is now community-run.**
   Tryorama has not been an official package since 0.6 **[V]**
   ([tryorama guide][dp-tryorama]). The `@holochain-open-dev/tryorama`
   0.20.x line targets 0.7 ([README v0.20.0][try-020]). Sweettest has
   `shutdown`/`startup`, manual `exchange_peer_info` and `await_consistency`
   **[V]** ([sweet_conductor.rs][hc-sweet-cond],
   [sweet_consistency.rs][hc-sweet-cons]), which is enough for
   offline-then-sync scenarios (§5).

---

## 1. Holochain primitives relevant to permissions

### 1.1 DNA, modifiers, clones

- A network is "keyed by the hash of all its integrity zomes and DNA
  modifiers". Cloning keeps the integrity code and forms a new network
  **[V]** ([cloning][dp-clone-keyed]). In 0.7 the modifiers are
  `network_seed` and `properties` **[V]** ([dna_modifiers.rs][hc-dnamod]).
  `origin_time`/`quantum_time` were removed in 0.5 **[V]**
  ([upgrade 0.5][dp-up05-origin]).
- **Coordinator zomes are not part of the DNA hash** **[V]**: only integrity
  zomes and modifiers are ([cloning][dp-clone-keyed]). Holochain has a
  regression test for "two apps, same DNA hash, different coordinators"
  ([test][hc-test-coord]). Any check that lives in a coordinator zome or in
  the client is therefore **advisory**, because a member can run a different
  coordinator against the same network **[I]**. Enforcement must live in
  integrity-zome validation.
- DNA properties are readable in validation and hashed into the DNA, so they
  are a fixed, trusted root for a network's rules, such as a progenitor or
  issuer key **[V]** ([cloning][dp-clone-props]).
- A network seed alone is "a moderately private space". It "shouldn't be
  considered a truly secret space", because anyone with the seed or the DNA
  hash can join and read **[V]** ([dnas][dp-dnas-seed]).
- Clones are created from the app API or the HDK (`create_clone_cell`). The
  input carries `modifiers` and an optional `membrane_proof` **[V]**
  ([clone.rs][hc-clone-input]). Disabling a clone stops it responding, but
  "the cell remains in the database". Uninstalling the app, or calling
  `delete_clone_cell`, removes local data **[V]**
  ([cloning][dp-clone-disable]). Other peers' copies are untouched **[I]**.

### 1.2 Membrane proofs

- A membrane proof is written into the genesis `AgentValidationPkg` record.
  It "can be basic, like an invite code, or … a signature from an agent that
  has authority to admit members" **[V]** ([genesis self-check][dp-gsc]).
- `genesis_self_check` runs **before network access**, so it can't read the
  DHT. It exists to catch user error. If it fails, the cell isn't created
  **[V]** ([genesis self-check][dp-gsc], [validation concepts][dp-c7-gsc]).
- **Real enforcement happens in `validate`** on the `AgentValidationPkg` op.
  That path can use `must_get_*`, e.g. to fetch an invitation record **[V]**
  ([validate callback][dp-vc-join]). In 0.7 this is still
  `ActionData::AgentValidationPkg` **[V]** ([action.rs][hc-action]).
  `validate_agent_joining` is a scaffolding convention, not an HDI API
  **[V]** ([validate callback][dp-vc-join]).
- Official signed-certificate example: the issuer key sits in DNA
  properties, and the proof is the issuer's Ed25519 signature over the
  joiner's agent key **[V]** ([genesis self-check][dp-gsc]). The example
  signs only the agent key. If Āhau reuses an issuer across groups or epochs,
  the certificate should also bind the DNA hash or network seed, or it can be
  replayed in another network **[I]**.
- Membrane proofs can be supplied after install. `allow_deferred_memproofs`
  keeps the app disabled until `ProvideMemproofs` is called **[V]**
  ([happs][dp-happs-memproof], [app_interface.rs][hc-provide-memproofs]).
  The docs say this is "an advanced topic which we'll write about in the
  future" **[V]**.
- **A membrane is checked once, at join.** Holochain has no primitive to
  re-check or withdraw membership later **[I]**, from the absence of any
  such API in 0.7 and the removal of `block_agent`.

### 1.3 Validation: what can and can't be checked

- Validation must be deterministic: "always yield the same true/false
  outcome … regardless of who is validating them and when". Holochain
  blocks non-deterministic host functions in validation **[V]**
  ([validation][dp-val-det]).
- Dependencies must be addressable and in the **same DHT**. If one can't be
  fetched, validation returns an indeterminate result and retries **[V]**
  ([validation][dp-val-deps]). Group-state rules for a group DNA must
  therefore live inside that DNA. Validation can't consult another DNA
  **[I]**.
- `must_get_*` "ignore any metadata that may change its state, such as
  links, updates, and deletes" **[V]** ([must_get][dp-mustget]).
  `must_get_valid_record` refuses a record "if ANY authority … believes it
  INVALID" **[V]** ([hdi entry.rs][hc-mgvr]).
- `must_get_agent_activity` returns a bounded, contiguous chain slice "from
  a single authority". The docs advise using it only when validating an
  `AgentActivity` op **[V]** ([must_get][dp-mustget-aa]).
- Writes in one zome call are atomic on the author's chain, but they are
  "not validated together". An action can depend only on *earlier* actions
  **[V]** ([validation][dp-val-atomic]). So "remove member and remove role"
  must each be valid alone.
- **Revocation and time.** "Action timestamps come from the author's local
  clock and can be forged. This makes it challenging to implement validation
  for cases where a privilege may be revoked." The docs suggest two
  patterns: a third-party signed timestamp, or "a signed proof from the
  administrator that the privilege is still active" **[V]**
  ([validation concepts][dp-c7-ts]). Both need a trusted party to be online
  at write time, which sits uneasily with CLAUDE.md rule 3 and with
  offline-first use **[I]**.
- "An agent's state is not deterministic, so it's not something you can
  check in a `validate` callback." Warrants and forks are checked in zome
  functions instead **[V]** ([agent status][dp-status-nondet]).
- Inductive validation (trust validated dependencies) is safe in small
  networks. It depends on the share of honest validators as networks grow
  **[V]** ([validate callback][dp-vc-inductive]).
- **Stale docs:** the concepts page still lists "rate limiting via a
  weight field" **[V]** ([validation concepts][dp-c7-rate]). The
  `rate_limit` module and action weights were removed in 0.7 **[V]**
  ([upgrade 0.7][dp-up07-ratelimit]).

### 1.4 Warrants and blocking

- A warrant proves an agent broke a rule. It is signed by the validator who
  found it and published to the offender's agent address **[V]**
  ([agent status][dp-status]). Invalid-op warrants have been stable since
  0.6.0-rc.0; chain-fork warrants since 0.7.0-dev.13 **[V]**
  ([CHANGELOG][hc-cl-opwarrant], [CHANGELOG][hc-cl-forkwarrant]).
  **Stale docs:** the agent-status page still says "Chain forks will be
  warranted in the future" ([agent status][dp-status-forkstale]).
- Integrating a warrant blocks the agent at the network layer **[V]**
  ([integrate_dht_ops_workflow.rs][hc-block-integrate]). Apps can't block
  or unblock directly any more **[V]** ([CHANGELOG][hc-cl-block]). The
  concepts page still describes "application-level blocking" as an
  unimplemented future feature **[V]** ([validation concepts][dp-c7-block]).
- Consequence: the only ejection is "write something invalid and get
  warranted". A removed member who doesn't misbehave can't be ejected from a
  shared DNA **[I]**.

### 1.5 Capability grants and claims

- Grants protect **zome function calls into the grantor's own cell**.
  `CapAccess` is `Unrestricted`, `Transferable { secret }` or
  `Assigned { secret, assignees }` **[V]** ([grant.rs][hc-capaccess],
  [capabilities][dp-cap]). Same-key callers get the implicit author grant
  **[V]** ([capabilities][dp-cap-author]). "A capability only covers one
  cell" **[V]** ([capabilities][dp-cap-cell]).
- Grants are private source-chain entries. Revoking one means deleting it,
  and `is_valid` checks function, agent and secret **[V]**
  ([grant.rs][hc-capgrant]).
- **What they do not do [I]:** they never take part in DHT validation, so
  they can't stop a member writing to the group DHT or reading gossiped
  data. Their real uses in a group design are: (1) restricting which remote
  agents may call `recv_remote_signal` or a "send me private data" function
  on *my* cell (model d); (2) delegated authoring through *my* cell (the
  docs' `create_movie_delegate` example). In (2) the write is still
  validated as *my* action ([capabilities][dp-cap]).

### 1.6 Private entries

- `visibility = "private"` keeps the entry on the author's chain and never
  publishes it **[V]** ([entries][dp-entries-private]). "The record's action
  portion is still shared" **[V]** ([DHT][dp-c4-private]). This is
  personal privacy, not group privacy. Validators of the action can't see the
  entry content **[I]**.

### 1.7 Countersigning

- Countersigning writes one entry atomically to several chains, optionally
  with an enzyme and M-of-N witnesses. All parties must be online, and the
  docs describe it as "finished within a few seconds" **[V]**
  ([countersigning][dp-cs]). It is **unstable and off by default**: hdk
  feature `unstable-countersigning` **[V]** ([hdk lib.rs][hc-hdk-cs],
  [countersigning][dp-cs-unstable]).
- It could make "kaitiaki A and B jointly remove C" a single atomic record.
  But it needs both online at once and an unstable feature. That fails
  offline-first, and relying on an unstable feature leans towards the
  Holochain exit criterion's falsification signal **[I]**.

### 1.8 Identity and devices

- DPKI/DeepKey was removed in 0.6 **[V]** ([upgrade 0.6][dp-up06-dpki]).
  No first-party mechanism in 0.7 links several device keys to one person
  **[I]**, from the absence of one in the 0.7 HDK modules
  ([hdk lib.rs][hc-hdk-mods]).
- One key on two live devices produces two actions with the same
  `prev_action`. That is a chain fork, which is warranted and leads to a
  block **[V]** ([CHANGELOG 0.4.0-dev.9][hc-cl-forkauthor],
  [validation concepts][dp-c7-fork]). The docs admit accidental forks
  happen, e.g. after restoring a backup **[V]**.
- A **source-chain restore** design (re-hydrate a key's public chain on a
  new node) is in the repo as a design doc. Private entries and cap claims
  are explicitly not recoverable **[V]** ([source_chain_restore.md][hc-restore]).
  It is for moving to a new node, not concurrent multi-device use **[I]**.

---

## 2. Confidentiality: what Holochain says

- "Every DNA has its own private, encrypted network of peers." That network
  holds "a distributed database of all public data" **[V]**
  ([DHT][dp-c4-net]). Transport encryption protects data from outsiders,
  **not from other members of the same DNA** **[I]**.
- Holochain's own model for private spaces is **separate networks**:
  "useful for creating separate spaces inside a single hApp — individual
  project workspaces or private chat channels" **[V]**
  ([architecture][dp-c2-cells]). A chat app with private rooms "cloned from
  a single `chat_room` DNA" is the given example **[V]**
  ([dnas][dp-dnas-priv]).
- Encryption primitives are libsodium box (X25519) and secretbox
  (XSalsa20-Poly1305). Keys stay in Lair. A shared key moves between agents
  with `x_salsa20_poly1305_shared_secret_export`/`_ingest`. The docs
  recommend dedicated X25519 keys over agent keys, and warn that ciphertext
  stored permanently on a chain or DHT may later be broken by quantum
  computers **[V]** ([crypto][dp-crypto]).
- **Remote calls** "allow agents … to interact privately without publishing
  any data to the DHT", over an end-to-end encrypted direct connection
  **[V]** ([calls & capabilities][dp-c8-private]). `send_remote_signal` is
  fire-and-forget and needs a grant for `recv_remote_signal` **[V]**
  ([hdk p2p.rs][hc-remote-signal]).

---

## 3. Membership and role patterns

### 3.1 Patterns found

| Pattern | Source | Status |
|---|---|---|
| **Signed joining certificate.** Issuer key in DNA properties; membrane proof is the issuer's signature over the joiner's key | Official docs example ([genesis self-check][dp-gsc]) | **[V]** official example |
| **Invitation on the DHT.** Membrane proof is the hash of an `Invitation` naming the joiner, checked with `must_get_valid_record` | Official docs example ([validate callback][dp-vc-join]) | **[V]** official example. Needs an existing member, so it fits joining an existing DNA, not bootstrapping one **[I]** |
| **Progenitor plus delegated stewards.** `progenitor: Option<AgentPubKeyB64>` in DNA properties. Stewards hold `StewardPermission { for_agent, permission_hash, expiry }`, and each write cites its permission's hash. Validation walks one hop with `must_get_valid_record`. Permissions can't be updated or deleted; expiring ones can't delegate. With no progenitor, everything is valid | Moss `group` DNA ([steward_permission.rs][moss-sp], [lib.rs][moss-lib]) | **[C]**, maintained (hdi 0.7 / hdk 0.6) |
| **Open membrane, seed as invite.** `validate_agent_joining` always returns Valid; the invite link carries `network_seed` and `progenitor` | Moss ([lib.rs][moss-lib-join], [utils.ts][moss-invite]) | **[C]** |
| **Progenitor list plus role links.** `progenitors: Vec<AgentPubKeyB64>` in properties; role assignment by links | `holochain-open-dev/membrane-roles` ([progenitor.rs][mr-prog]) | **[C]**, last commit 2021-05-17. **Its `validate` is commented out** ([lib.rs][mr-lib]), so it enforced nothing |
| **Clone recipes plus invitations.** `CloneDnaRecipe { original_dna_hash, properties, network_seed, … }` stored as a **public entry in the parent DNA**, with links to invitees and remote signals | `holochain-open-dev/membrane-invitations` ([lib.rs][mi-lib]) | **[C]**, hdk 0.1-era. `validate` returns Valid for everything. Every parent-DNA member can read the recipe, seed included **[I]** |

I did not reach darksoil-studio's role and linked-device modules: the repo
names I tried don't exist, and the org listing doesn't show them. I did not
examine Acorn, hREA or profiles/peer-status in depth. None is a known
access-control reference.

### 3.2 Chain of authority and multi-admin

- **Chain of authority [I]**, generalising Moss. A role grant is an entry
  authored by someone who cites *their own* authority, either the root in
  DNA properties or an earlier grant's ActionHash. Each hop is checked with
  `must_get_valid_record`. Every grant then chains back to the DNA-property
  root, so validation stays deterministic.
- **Multi-admin, no single root [I].** Put a *set* of founding kaitiaki keys
  in DNA properties, as membrane-roles' `Vec` did, or a threshold rule. This
  avoids one key, or one device, being the authority (CLAUDE.md rules 3–4).
  But properties are fixed per DNA hash. Changing founders means a new
  network (§4, epochs).
- **Who can revoke [I].** In an append-only model a revocation is a new
  `RoleRevocation { grant: ActionHash }` entry, validated like a grant: the
  author cites their authority. Nothing is deleted, which matches
  contract-decisions §1. Moss chose not to support revocation at all.

### 3.3 What revocation can and can't do

| Wanted effect | Achievable? | Basis |
|---|---|---|
| Revoked member can't *read* data written before removal | **No.** Already gossiped; full-arc nodes hold everything | [entries][dp-entries-delete], [Cargo.toml][hc-sharding] **[V/I]** |
| Revoked member can't *read new* data | **Not in a shared DNA.** No ejection primitive. **Yes** via a new epoch network or encryption-key rotation | [CHANGELOG][hc-cl-block] **[I]** |
| Validators reject a revoked member's new writes | **Only if the write must cite group state that already shows the removal.** A member citing stale state can't be rejected, because absence of a revocation is unprovable and timestamps are forgeable | [must_get][dp-mustget], [validation concepts][dp-c7-ts] **[V/I]** |
| Honest clients stop writing after removal, and readers can see post-removal writes | **Yes.** The render layer compares writes against role state each viewer knows. That fits CLAUDE.md rule 1 (per-viewer rendering) | **[I]** |
| Revoked member's writes are hidden from other members | **Per viewer, at the render layer.** Nothing is erased | **[I]** |
| "Last kaitiaki" protection | **Not under concurrency.** Two offline kaitiaki can each remove the other, and each action is valid against what its author saw | [validation][dp-val-atomic] **[I]** |

---

## 4. Proposed data-flow models

The models are combinable, not exclusive. In each, "group" means an Āhau
tribe or sub-group.

### (a) One DNA per group, via cloning
A group is a clone of a `group` DNA, with a random `network_seed` and
properties holding founding kaitiaki keys. Joining needs a membrane proof,
such as a kaitiaki-signed certificate binding agent key and DNA hash,
validated on `AgentValidationPkg`. All group content lives in that DHT.
- Data flow: author → own chain → gossip to members of *that* DNA only.
- Confidentiality from non-members is structural **[V]**
  ([architecture][dp-c2-cells]).
- Discovery data (Āhau's public group profile,
  [contract-decisions §3](../contract-decisions.md)) has to live in a
  separate shared DNA. Invitations must not publish the seed publicly, as
  membrane-invitations does **[I]**.

### (b) Shared DNA with role entries and validation
One DNA holds many groups. `GroupRole`/`RoleRevocation` entries form a
chain of authority, and every content write cites the author's role grant
and the group's permission setting.
- Gives write enforcement only. Every member of the DNA can read every
  group's data **[V]**. It does not meet Āhau's "members-only" requirement
  unless combined with (c) **[I]**.

### (c) Encryption for sensitive data
Group content is secretbox-encrypted under a group key. Each member gets the
key boxed to their X25519 key, via `shared_secret_export`/`_ingest`, with
keys held in Lair **[V]** ([crypto][dp-crypto]). Removal rotates the key
and re-shares it to the remaining members **[I]**.
- Validators can't read ciphertext, so content-level rules (e.g. "this is a
  well-formed whakapapa record") become unenforceable. Only envelope rules
  (author role, group id) remain **[I]**.
- Ciphertext sits on the DHT forever, with the quantum caveat **[V]**. Key
  distribution is itself sync-sensitive: a concurrent rotation by two
  kaitiaki yields two keys **[I]**.

### (d) Remote calls and signals for direct sharing
Sensitive items stay as private entries on the holder's chain. Other members
fetch them with `call_remote`, gated by an `Assigned` grant or by a check in
the called function against the caller's role **[V]**
([capabilities][dp-cap], [calls & capabilities][dp-c8-private]).
- The holder must be online, and data persists only where it is copied.
  Revocation is real for *future* requests: delete the grant, or stop
  answering **[I]**.
- Fits per-person sovereignty ("I share my record with whom I choose")
  better than group-wide content **[I]**.

### (e) Epoch rotation: a hybrid of (a) plus validation
Model (a), and on removal kaitiaki create a **new clone** (new seed,
`epoch: n+1` in properties). They issue certificates to the remaining
members only, and members copy forward or re-reference what they keep.
- The removed member keeps epoch *n* (retraction, as expected) but can't
  join *n+1*, so the cut-off is hard and enforced by validation **[I]**.
- Cost: data migration, invitation churn, and history spread across
  networks. Two kaitiaki removing each other offline produce **two
  successor networks**. That honours "represent both", but it splits the
  group and needs human reconciliation **[I]**.

### 4.1 Comparison

| | (a) DNA per group | (b) Shared DNA plus roles | (c) Encryption | (d) Remote calls | (e) Epoch rotation |
|---|---|---|---|---|---|
| Non-members can read | No **[V]** | **Yes** **[V]** | Ciphertext only | No | No |
| Removed member reads *new* data | Yes, until (e) | Yes | No, after rotation | No, if denied | **No** |
| Removed member reads *old* data | Yes | Yes | Yes (has old key) | Yes, if copied | Yes |
| Write rule enforced by validation | Yes (role chain inside the DNA) | Yes | Envelope only | n/a (no DHT write) | Yes |
| Revocation race (stale citation) | Soft (render layer) | Soft | Soft | n/a | Hard for the new epoch |
| Multi-source assertions survive (rule 2) | Yes. Append-only; design entries as sourced assertions | Yes | Yes | Copies may diverge | Yes, but split across epochs |
| No central authority (rule 3) | Yes, if multi-kaitiaki roots | Yes, same | Key-rotation coordinator needed | Each holder is the authority over their own data | Who starts an epoch? Concurrent epochs fork |
| Multi-device (rule 4) | Each device key needs a certificate and role | Role per device key | Each device key needs the group key | Grant per device key | Re-certify every device |
| Offline-first | Good | Good | Good after key receipt | **Poor** (holder online) | Epoch change needs a live certificate handover |
| Protocol risk | Low: documented features | Low | Low–medium: crypto design is on us | Low | Medium: migration is app-built; `unstable-migration` exists but is unstable ([Cargo.toml][hc-unstable-mig]) |

### 4.2 How Āhau's plan maps, and the gaps

- **Group = paired public profile plus members-only record**
  ([contract-decisions §3](../contract-decisions.md)). This maps to a shared
  discovery DNA for profiles plus (a) for the private side. A single
  atomic paired write across two DNAs isn't possible: atomicity holds only
  within one cell's call **[I]**. The `atomicMultiWrite` reasoning needs
  revisiting.
- **Milestone 1, "the removed agent can no longer write"** (Success
  Metrics). Under (a)/(b) this is testable for an honest client, i.e. one
  that cites the latest role state. It is **not** deterministically
  enforceable against a client that cites stale state (§3.3). Under (e) it
  is enforceable for the new epoch. The current wording risks the
  "A permission enforced only in the UI gets counted as a pass" row in the
  plan's own Risks table **[I]**.
- **Milestone 2, "whakapapa creation set to kaitiaki-only"**. The setting is
  mutable group state, so it has the same stale-citation issue. A member
  citing the earlier "all members" setting passes validation **[I]**. A
  setting that is *fixed per DNA* (a property) is fully enforceable, but
  changing it means a new network.
- **"Two kaitiaki remove each other offline"** (Open Questions). Both
  revocations are valid and both survive (append-only). Deciding what the
  group is now is a render-layer or human decision. That is consistent with
  CLAUDE.md rule 1. Nothing in Holochain forces last-write-wins here **[I]**.
- **"Removed member's already-synced data"** (Open Questions). Holochain
  can't recall it ([entries][dp-entries-delete]). The UI copy should say so.
- **The Holochain exit criterion** names capability grants. The enforcement
  mechanism is actually validation plus membrane (§1.5). See §6, Q1.
- **Kaitiaki identity across devices.** Kaitiaki on several devices means
  several keys with separate grants. Revoking a person means revoking every
  device key. No first-party device-linking exists in 0.7 (§1.8).

---

## 5. Testing

- **Sweettest** (Rust, `holochain` crate, `sweettest` feature) is the
  official harness. The scaffolded test location moved to
  `dnas/<dna>/zomes/coordinator/<zome>/tests` in 0.6 **[V]**
  ([upgrade 0.6][dp-up06-tryorama], [Cargo.toml][hc-sweettest-feat]).
  Useful APIs in 0.7 **[V]**:
  - `SweetConductor::shutdown`/`startup`, which keep state across restart
    ([sweet_conductor.rs][hc-sweet-cond])
  - `exchange_peer_info`, and `SweetConductorConfig::rendezvous(false)`,
    which disables bootstrap ([sweet_conductor_config.rs][hc-sweet-cfg])
  - `await_consistency`, which waits for op integration
    ([sweet_consistency.rs][hc-sweet-cons])
  - `disable_self_validation`, a tuning parameter "intended only for testing
    warrants" that lets a test author invalid data ([conductor.rs][hc-disable-selfval])
  - Sweettest docs are on docs.rs since 0.7.0-dev.28
    ([CHANGELOG][hc-cl-sweetdocs]).
- **Tryorama** (TypeScript) is community-maintained since 0.6 **[V]**
  ([tryorama guide][dp-tryorama]). `@holochain-open-dev/tryorama` v0.20.x is
  "compatible with … Holochain v0.7.x" ([README v0.20.0][try-020]). The
  guide's offline example uses `conductor.shutDown()`/`startUp()` plus
  `dhtSync` **[V]** ([tryorama guide][dp-tryorama-offline]).
- **Two-agents-offline-then-sync, suggested shape [I]:**
  1. Start two conductors with bootstrap disabled and no peer exchange. That
     gives a partition in which both can still *author*. `shutdown` alone
     doesn't let the offline side write.
  2. Kaitiaki A removes B, while B removes A.
  3. Call `exchange_peer_info`, then `await_consistency`.
  4. Assert that **both** revocations exist, neither was overwritten, and
     the render-layer projection is what the group decided.
- **Revocation tests [I]:**
  - Honest path: after removal, the removed agent's normal zome call fails
    validation.
  - **Adversarial path:** install a different *coordinator* on the same DNA
    hash ([regression test][hc-test-coord]) that writes while citing the
    pre-removal grant. Document the outcome; per §3.3 it is expected to
    pass validation.
  - Warrant path: use `disable_self_validation` so the agent authors
    something invalid, then assert a warrant appears via
    `get_agent_activity`.
- **Sweettest vs Tryorama for this repo [I].** Sweettest keeps tests in the
  zome crate and is the official path. Tryorama matches the TS shell but is
  community-run and trails releases (0.19.x was 0.6-only). CLAUDE.md
  requires "a real conductor", which either satisfies.

---

## 6. Open questions: flag, don't decide

1. **The Holochain exit criterion names capability grants.** Should it be
   restated as "validation rules plus membrane deliver enforced permissions
   without protocol workarounds"? As written, a literal reading tests the
   wrong primitive.
2. **What does "removal" promise?** (i) Honest clients stop writing and
   readers see later writes flagged. (ii) A hard cut-off from new data,
   which means epoch rotation or key rotation. (iii) Something else. This
   decides between (a)/(b) and (e)/(c).
3. **Milestone 1 metric wording.** Should it distinguish an honest client
   rejected by validation from an adversarial stale-citation write, which
   validation can't reject?
4. **Root of authority per group.** Options: a set of founding kaitiaki keys
   in DNA properties, or a threshold. A single progenitor (Moss) conflicts
   with rule 3, and with rule 4 when that one key lives on one device. Who
   can found a new epoch?
5. **Devices versus people.** Āhau needs an app-level device-linking design.
   Granting roles to "a person" requires deciding which keys speak for them,
   and how a lost or compromised device is revoked.
6. **Concurrent kaitiaki actions.** Mutual removal, "last kaitiaki", and two
   successor epochs: what does the group want rendered, and who reconciles?
7. **Encryption scope.** Does any data class (e.g. tapu whakapapa) need
   (c), given ciphertext permanence, the quantum caveat, and losing
   content validation?
8. **Discovery leakage.** What may live in a shared discovery DNA (group
   profile, invitations) without exposing a group's seed or membership?
9. **Unstable features.** Should using `unstable-countersigning`,
   `unstable-migration` or `unstable-sharding` count as a "protocol
   workaround" against the Holochain exit criterion?
10. **Verification gaps in this note.** Live developer.holochain.org, docs.rs
    and the whitepaper weren't reachable. I read docs source, not rendered
    pages. The partition recipe in §5 is inferred and should be confirmed in
    a spike.

---

## Sources

Holochain source, tag `holochain-0.7.0`, commit
`84cdce7d4df17b95189324d5cecc3f1bfd5db30f`. Docs source,
`holochain/docs-pages@aff10767059a103cea49a1a356fc91638ac100cf`
(2026-09-01). Moss `@4a87b935` (2026-07-23). membrane-roles `@c2932271`
(2021-05-17). membrane-invitations `@173e54f6` (2023-05-30). Tryorama
`@9a6e1837` (2026-05-14) and tag `v0.20.0` (2026-07-31).

**Unreachable from this environment:** developer.holochain.org (read via
docs-pages source instead), docs.rs, holochain.org (whitepaper 2.0 PDF),
crates.io, and darksoil-studio role/linked-device repos (not found).

[hc-tags]: https://github.com/holochain/holochain/tags
[hc-cargo-hdk]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/hdk/Cargo.toml
[hc-cargo-hdi]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/hdi/Cargo.toml
[hc-sharding]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/holochain/Cargo.toml#L231-L234
[hc-unstable-mig]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/holochain/Cargo.toml
[hc-sweettest-feat]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/holochain/Cargo.toml
[hc-cl-block]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/holochain/CHANGELOG.md?plain=1#L232
[hc-cl-forkwarrant]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/holochain/CHANGELOG.md?plain=1#L187
[hc-cl-opwarrant]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/holochain/CHANGELOG.md?plain=1#L299
[hc-cl-forkauthor]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/holochain/CHANGELOG.md?plain=1#L916
[hc-cl-sweetdocs]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/holochain/CHANGELOG.md
[hc-dnamod]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/holochain_integrity_types/src/dna_modifiers.rs
[hc-clone-input]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/holochain_zome_types/src/clone.rs
[hc-action]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/holochain_integrity_types/src/action.rs#L476-L496
[hc-provide-memproofs]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/holochain_conductor_api/src/app_interface.rs#L272
[hc-mgvr]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/hdi/src/entry.rs#L93-L105
[hc-capaccess]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/holochain_integrity_types/src/capability/grant.rs#L153-L168
[hc-capgrant]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/holochain_integrity_types/src/capability/grant.rs
[hc-hdk-cs]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/hdk/src/lib.rs#L364-L365
[hc-hdk-mods]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/hdk/src/lib.rs
[hc-remote-signal]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/hdk/src/p2p.rs#L123-L148
[hc-block-integrate]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/holochain/src/core/workflow/integrate_dht_ops_workflow.rs#L108
[hc-restore]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/docs/design/source_chain_restore.md
[hc-test-coord]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/holochain/tests/tests/regression/two_apps_same_dna_hash_different_coordinators.rs
[hc-sweet-cond]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/holochain/src/sweettest/sweet_conductor.rs#L612-L700
[hc-sweet-cfg]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/holochain/src/sweettest/sweet_conductor_config.rs#L73-L80
[hc-sweet-cons]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/holochain/src/sweettest/sweet_consistency.rs#L30-L60
[hc-disable-selfval]: https://github.com/holochain/holochain/blob/84cdce7d4df17b95189324d5cecc3f1bfd5db30f/crates/holochain_conductor_api/src/config/conductor.rs#L665
[dp-up07]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/resources/upgrade/upgrade-holochain-0.7.md
[dp-up07-ratelimit]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/resources/upgrade/upgrade-holochain-0.7.md?plain=1#L259
[dp-up06-dpki]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/resources/upgrade/upgrade-holochain-0.6.md?plain=1#L528-L545
[dp-up06-tryorama]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/resources/upgrade/upgrade-holochain-0.6.md?plain=1#L142-L146
[dp-up05-origin]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/resources/upgrade/upgrade-holochain-0.5.md?plain=1#L257-L262
[dp-cap]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/capabilities.md
[dp-cap-author]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/capabilities.md?plain=1#L17
[dp-cap-cell]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/capabilities.md?plain=1#L23-L24
[dp-gsc]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/genesis-self-check-callback.md
[dp-vc-join]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/validate-callback.md?plain=1#L168-L254
[dp-vc-inductive]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/validate-callback.md?plain=1#L174-L178
[dp-val-det]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/validation.md?plain=1#L43
[dp-val-deps]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/validation.md?plain=1#L44
[dp-val-atomic]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/validation.md?plain=1#L45
[dp-mustget]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/must-get-host-functions.md?plain=1#L16-L22
[dp-mustget-aa]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/must-get-host-functions.md?plain=1#L69-L75
[dp-status]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/getting-an-agents-status.md?plain=1#L20-L44
[dp-status-nondet]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/getting-an-agents-status.md?plain=1#L40
[dp-status-forkstale]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/getting-an-agents-status.md?plain=1#L31
[dp-c7-usecases]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/concepts/7_validation.md?plain=1#L253-L261
[dp-c7-rate]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/concepts/7_validation.md?plain=1#L261
[dp-c7-ts]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/concepts/7_validation.md?plain=1#L269
[dp-c7-fork]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/concepts/7_validation.md?plain=1#L281-L287
[dp-c7-gsc]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/concepts/7_validation.md?plain=1#L289-L295
[dp-c7-block]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/concepts/7_validation.md?plain=1#L297-L305
[dp-c4-private]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/concepts/4_dht.md?plain=1#L37-L41
[dp-c4-net]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/concepts/4_dht.md?plain=1#L45-L47
[dp-c2-cells]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/concepts/2_application_architecture.md?plain=1#L78
[dp-c8-private]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/concepts/8_calls_capabilities.md?plain=1#L55-L56
[dp-cs]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/concepts/10_countersigning.md
[dp-cs-unstable]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/concepts/10_countersigning.md?plain=1#L5-L6
[dp-clone-keyed]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/cloning.md?plain=1#L11
[dp-clone-props]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/cloning.md?plain=1#L25-L31
[dp-clone-disable]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/cloning.md?plain=1#L253-L255
[dp-dnas-seed]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/dnas.md?plain=1#L140-L141
[dp-dnas-priv]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/dnas.md?plain=1#L137
[dp-happs-memproof]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/happs.md?plain=1#L89
[dp-entries-private]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/entries.md?plain=1#L67
[dp-entries-delete]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/entries.md?plain=1#L285-L299
[dp-crypto]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/cryptography-functions.md?plain=1#L122-L290
[dp-tryorama]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/testing-with-tryorama.md?plain=1#L8
[dp-tryorama-offline]: https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/testing-with-tryorama.md?plain=1#L318-L356
[moss-sp]: https://github.com/lightningrodlabs/moss/blob/4a87b935f013491714f347b0c609c391886b969b/dnas/group/zomes/integrity/group/src/steward_permission.rs
[moss-lib]: https://github.com/lightningrodlabs/moss/blob/4a87b935f013491714f347b0c609c391886b969b/dnas/group/zomes/integrity/group/src/lib.rs#L23-L26
[moss-lib-join]: https://github.com/lightningrodlabs/moss/blob/4a87b935f013491714f347b0c609c391886b969b/dnas/group/zomes/integrity/group/src/lib.rs#L58-L66
[moss-invite]: https://github.com/lightningrodlabs/moss/blob/4a87b935f013491714f347b0c609c391886b969b/src/renderer/src/utils.ts#L857
[mr-prog]: https://github.com/holochain-open-dev/membrane-roles/blob/c29322713f1ee042d1a3818b41797bc98d31e88f/zome/zomes/membrane_roles/src/progenitor.rs
[mr-lib]: https://github.com/holochain-open-dev/membrane-roles/blob/c29322713f1ee042d1a3818b41797bc98d31e88f/zome/zomes/membrane_roles/src/lib.rs#L45-L74
[mi-lib]: https://github.com/holochain-open-dev/membrane-invitations/blob/173e54f63ea9d32ae0f1c08e8b27ee348ea49d43/crates/integrity/src/lib.rs
[try-020]: https://github.com/holochain-open-dev/tryorama/blob/v0.20.0/README.md
