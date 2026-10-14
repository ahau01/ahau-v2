# Pātaka on Holochain: do we still need an always-online peer?

Research for [issue #22](https://github.com/ahau01/ahau-v2/issues/22). It
covers what the old pātaka did, what Holochain gives us today, and each of
the issue's open questions (Q1–Q5). It ends with a recommended sequence: what
to do during the group-permissions slice, what to defer, and what should
trigger building it.

Claims are traced to primary sources: Holochain and kitsune2 source at the
versions this repo pins, the Holochain developer docs source, and the source
of hc-http-gw, Edge Node and file-storage. The **Sources** section lists each
source with the commit it was read at. Anything not verified against a
primary source is marked **(unverified)**.

**Pinned versions.** `flake.lock` pins Holochain `holochain-0.6.3`
(`448a36ef`), kitsune2 `v0.4.1` (`b33fa556`) and lair `v0.6.3`, through
holonix `main-0.6`. Everything about Holochain behaviour below is read at
those versions unless it says otherwise. Holochain 0.7.0 has since been
tagged, and Edge Node and the docs site have already moved to it. Where 0.7
changes something relevant, this note says so.

**Where this file lives.** The only earlier research note
(`docs/history/leg1/decentralized-backend-research.md`) sits under
`history/`, which is for finished work. Living docs go at the top of `docs/`
(`docs/INDEX.md`), so this note goes in a new `docs/research/`. `INDEX.md`
hasn't been updated to list it. That should be done when this is merged.

**Status.** This is reading, not experiment. Nothing here has been run
against a conductor. Every claim about runtime behaviour should be confirmed
by a Sweettest/Tryorama test before a design depends on it (CLAUDE.md,
"Tests assert real behaviour").

---

## 1. TL;DR

- **Yes, an always-on peer is still worth having, but not yet, and not as a
  separate app.** On Holochain 0.6 a group can exist with no server. What a
  pātaka still adds is *availability*: a small whānau group made of sleeping
  phones goes dark when nobody is online. Holochain's own docs say the fix
  for this is "always-on nodes" ([operating-a-happ.md](#src-docs-operating)).
- **Shape it as the same hApp run headless, with the node joining as an
  ordinary member agent.** That is the issue's suggested direction, and the
  sources support it. Edge Node (Holo's open-source container) is exactly
  this pattern, and the conductor can run it without extra code. On 0.6
  every node with a non-zero storage arc holds a **full** copy, because
  sharding is compiled out ([§3](#3-what-holochain-gives-today)).
- **Q1 is the decision that matters, and the honest answer is "only with
  app-level encryption".** A member node can read all public DHT data in its
  network. Holochain has the building blocks for encryption (lair-held
  X25519 keys and secretbox/box host functions), but its own docs warn that
  encrypted data "cannot be validated effectively by the public DHT". So "the
  pātaka can't read" has a cost: validation can only check the cleartext
  envelope. Whether a pātaka may read group data is a **hapū trust
  decision**. **Flag, don't decide.**
- **Q2 (non-person members) has to be designed for now.** It's the same hook
  as multi-device identity: on Holochain a member is an *agent key*, not a
  person. `docs/plans/group-permissions.md` doesn't model this yet. The hooks
  are listed in [§5.1](#51-now-during-the-group-permissions-slice).
- **Q4 (removal) is worse than "already-copied data stays".** Since
  Holochain 0.6.1 apps can no longer block an agent: `block_agent` was
  removed, and blocking now happens only when a warrant is issued for an
  invalid op. A removed member or pātaka whose membrane proof is still valid
  can probably keep *receiving* new public data until something else stops
  it. The group-permissions success metrics only cover *writes*. This
  applies to people too, not just pātaka.
- **The integrity zome is the deadline.** Adding encrypted entries later
  changes the integrity zome, which changes the DNA hash and so creates a new
  network. Make the Q1 decision before the first real whānau group network
  exists. It doesn't need to be made before the group-permissions spike.
- **Web registration (Q5) needs its own issue and a stakeholder check.**
  `hc-http-gw` is GET-only and read-oriented, so a sign-up form needs a small
  custom POST endpoint. Form answers should be encrypted in the browser to
  the kaitiaki's keys, so the node only ever holds ciphertext.
- **Bootstrap and relay servers are plumbing, not a pātaka.** They never hold
  group data. They do see metadata: who is in which network, network
  addresses, and when. The pinned defaults point at the Holochain
  Foundation's test bootstrap server and n0's public iroh relay, and neither
  is meant for production. Choosing who runs them is a sovereignty decision
  too, though a smaller one.

---

## 2. What pātaka did in the old app

From the migrated knowledge base. These notes are mostly MR changelogs, so
they show *that* features existed more than *how* they worked. Issue #22's
own summary (taken from `ahau-monorepo` READMEs that weren't migrated) fills
in the rest.

| Capability | Evidence |
|---|---|
| A separate, always-on SSB app with its own UI (dashboard, password, port handling, network selection) | `repos/ahau-pataka.md`: !6 "Pataka ports", !10 "Host hacks", !11 "Password", !12 "force select network"; CLI/Docker variant in `repos/ahau-lib-pataka-cli.md` (!6 "Docker release", open CORS issue #2) |
| Invite codes, local or internet | `ahau-pataka.md` !2 "allow user to generate local or internet codes", !18 "added email codes button"; frozen contract `storehouse.acceptInvite` (`src/contract/operations/storehouse.ts`) |
| Peers list and block/unblock | `ahau-pataka.md` !21 "show online peers"; contract `storehouse.listConnectedPeers`, `blockStorehouse`, `unblockStorehouse` (`src/contract/operations/sources.ts:98-102`) |
| Full copies of files ("Pataka mode"), replicating only for followed peers | `repos/ahau-lib-ssb-plugins-ssb-hyper-blobs.md` !7 "Pataka friends": the pātaka checks whether it follows a peer before replicating their drive; normal peers auto-prune (!6, !8) |
| Held encrypted group data without the group key | Issue #22 summary (source READMEs not migrated); consistent with SSB's recipient-encryption model in `decentralized-backend-research.md` |
| Web registration (e.g. `register.wph.nz`) | `repos/ahau-lib-ssb-plugins-ssb-pataka.md` !5/!8 "Web reg", !10 "Custom fields", !13 (only tested against the WPH tribe), !16 (files temporarily hidden from the form), !20 (empty-submission bug); `ahau-pataka.md` !20, !26 "fix web reg" |
| Fragility | `ahau-lib-ssb-plugins-ssb-pataka.md` #1: pasting a pātaka invite code crashes a dev Āhau instance; `ahau-lib-artefact-store.md` #1: the hyper-* bootstrap nodes were retired and "recreating them is undocumented and difficult" |

The last row is worth remembering. The old file layer broke because it
depended on bootstrap infrastructure that someone else ran and then retired.
That is relevant to the bootstrap/relay discussion in [§4.6](#46-bootstrap-and-relay-plumbing-not-a-pātaka).

The frozen contract kept `storehouse.*` "because a community running its own
storehouse is central to what Āhau means by data sovereignty"
(`storehouse.ts` header). That's a capability to keep, not an
API to copy, per the redesign around user capabilities rather than old-app
behaviour. A rough mapping to Holochain:

- `acceptInvite` becomes joining with a membrane proof.
- `blockStorehouse` becomes removing the node from the group. There is no app-level block any more (§4.4).
- `listStorehouses` becomes listing members whose agent kind is "node".
- `listConnectedPeers` becomes network stats or peer info from the conductor.

---

## 3. What Holochain gives today

### Availability is the app's problem, and always-on nodes are the documented fix

> "A DHT only exists if agents are actively running cells instantiated from
> that DHT … a real-world network is likely to suffer from poor round-the-clock
> availability … The solution to this is **always-on nodes**. You can run a few
> hApp instances on devices you own (or in the cloud), or you can encourage
> some users to leave their devices turned on."
> — [operating-a-happ.md](#src-docs-operating), "Keeping a DHT alive"

This is the issue's "small groups go dark" gap, stated by Holochain itself.

### Storage arcs on 0.6: full or nothing

- The conductor setting `network.target_arc_factor` defaults to `1`. Its doc
  comment says: "In normal operation, leave this as the default 1. For
  leacher nodes that do not contribute to gossip, set to zero."
  ([conductor.rs L321–325](#src-hc-conductor)).
- Every local agent joins with a target arc of `DhtArc::FULL`
  ([spawn/actor.rs L1461–1466](#src-hc-actor)). A factor above 1 is rejected
  at runtime: "not yet allowed until sharding is implemented!"
  ([local_agent.rs L130–138](#src-hc-localagent)).
- In kitsune2 v0.4.1, partial arcs only exist behind a `sharding` cargo
  feature. Without it, an agent's storage arc moves straight from empty to
  `FULL` once it has synced ([storage_arc.rs L75–105](#src-k2-storagearc)).
  The 0.4 upgrade guide says sharding is disabled by default and warns about
  "bugs in networks that have a mixture of unsharded … and sharded peers"
  ([upgrade-holochain-0.4.md](#src-docs-upgrade04)).

**What this means for us:**

1. On 0.6, every peer at factor 1 aims to hold a full copy of everything
   public in that network, phones included unless they're configured
   otherwise. The issue's line "phones may hold little or none of the data"
   is only true if phones run at **zero arc** (factor 0). In that case they
   hold nothing and depend completely on full-arc peers being online.
2. So "a full-arc always-on node" isn't a special feature. It's the default.
   Edge Node's 0.6.1 and 0.7.0 conductor templates don't set
   `target_arc_factor`, so it stays at 1 ([Edge Node docker/](#src-edgenode)).
3. The risky combination is **zero-arc phones plus a single full-arc
   pātaka**. That makes the pātaka the only node that can answer, which is
   what CLAUDE.md rule 3 forbids. The design should require at least two
   independent full-arc holders, or leave members' desktops at full arc.
   Whether mobile builds (e.g. via p2p Shipyard) default to zero arc is
   **(unverified)**.

### Joining: membrane proofs, validated by peers

- A DNA can require a **membrane proof** at genesis, "an invite code, or …
  a signature from an agent that has authority to admit members". It's
  checked locally by `genesis_self_check` and enforced by peers in
  `validate_agent_joining`
  ([genesis-self-check-callback.md](#src-docs-genesis),
  [validate-callback.md](#src-docs-validate)).
- Each DNA, and each **clone** (a new `network_seed`), is a separate network
  with its own membership and data ([cloning.md](#src-docs-cloning)). "Every
  DNA has its own private, encrypted network of peers"
  ([4_dht.md](#src-docs-dht)).

### Who can read what

- "Source chain entries can be private (kept on the user's device) or public
  (shared in the DHT). Source chain _actions_ are always public."
  ([4_dht.md](#src-docs-dht)). A private entry type is "never published to
  the DHT" ([entries.md](#src-docs-entries)).
- Nothing in the DHT model limits *reads* of public data to a subset of
  network members. Capability grants control **zome calls** into an agent's
  cell, not DHT gets ([8_calls_capabilities.md](#src-docs-caps)). Inside a
  network, any member can read all public entries, and every action's
  metadata (author, timestamp, entry type, hashes). **This is the core of
  Q1.**

### App-level encryption building blocks

From the HDK at 0.6.3 ([x_salsa20_poly1305.rs](#src-hdk-crypto)) and
[cryptography-functions.md](#src-docs-crypto):

- `create_x25519_keypair`: the "secret key never leaves lair".
- Secretbox: `x_salsa20_poly1305_shared_secret_create_random`,
  `…_encrypt`, `…_decrypt`. The zome only sees a key *reference*.
- Key distribution: `x_salsa20_poly1305_shared_secret_export` and
  `…_ingest` box-encrypt a shared key to a recipient's X25519 key, and the
  recipient stores it in their own lair. The docs say: "**Always use
  `x_salsa20_poly1305_shared_secret_ingest`**" rather than decrypting keys in
  WASM.
- `ed_25519_x_salsa20_poly1305_encrypt` encrypts to an agent's *signing* key.
  It carries a warning to "first understand the downsides".
- The HDK's own caveats: "encrypted data cannot be validated effectively by
  the public DHT"; "Consider using capability tokens and/or dedicated DHT
  networks to control access"; "Secretbox is designed for 'small' data,
  break large data into chunks"; "NOT quantum resistant". The docs page adds:
  "If this is a concern to you, avoid storing encrypted data permanently in a
  source chain or DHT."

### Removal and blocking

- `block_agent`/`unblock_agent` were **removed from the HDK in 0.6.1-rc.0**,
  "as blocking should be a system-level behavior triggered by warrants, not
  application-level logic". The host functions remain as no-ops
  ([holochain CHANGELOG L69](#src-hc-changelog-crate)). 0.7 removes them
  completely ([upgrade-holochain-0.7.md](#src-docs-upgrade07)).
- Blocking now happens to "authors of invalid ops after validation"
  (CHANGELOG L158, 0.6.0-dev.29). Blocks are enforced for incoming gets and
  gossip (L109) and for outgoing publish and gossip (L77, L156). Invalid-op
  warrants were stabilised (root CHANGELOG L951).
- So the only way to block an agent is for it to author something invalid.
  An agent that has been removed but stays quiet is not blocked.

### Infrastructure: bootstrap and relay

- 0.6.1-rc.0 made iroh the default transport ("Default to iroh transport for
  all binaries", crate CHANGELOG L75). The 0.6.3 config has `bootstrap_url`,
  `relay_url` and the legacy `signal_url`/`webrtc_config`. The defaults are
  `https://dev-test-bootstrap2.holochain.org` and n0's
  `https://use1-1.relay.n0.iroh-canary.iroh.link./`
  ([conductor.rs L292–302, L355–360](#src-hc-conductor)). 0.7 removes
  WebRTC/tx5 ([upgrade-holochain-0.7.md](#src-docs-upgrade07)).
- The kitsune2 bootstrap server "provides peer discovery, relay fallback …
  and optional authentication". Its public instance is "not appropriate for
  production hApps". Its state "is ephemeral and can safely be disposed of".
  "All agents in a DNA must use the same bootstrap and signal servers."
  ([running-network-infrastructure.md](#src-docs-infra),
  [operating-a-happ.md](#src-docs-operating)).
- A bootstrap entry (`AgentInfo`) carries the agent id, the **space id**
  (one per DNA or clone), timestamps, a transport **URL**, and the storage
  arc ([kitsune2 agent.rs L150–176](#src-k2-agent)).
- The iroh relay "temporarily rout[es] encrypted traffic until a direct, P2P
  connection is feasible" ([iroh-relay README](#src-iroh-relay)).
- Docs inconsistency: `operating-a-happ.md` still says Holochain "only
  officially supports WebRTC", but the 0.6.1+ default is iroh and 0.7
  removes WebRTC. Trust the CHANGELOG over that sentence.

### Always-on node options that exist today

| Option | What it is | Notes |
|---|---|---|
| Plain headless conductor | `holochain` with a conductor config, the hApp installed via the admin API | No extra dependency. We'd write our own install/membrane-proof tooling |
| **Edge Node** (Holo-Host, open source) | OCI container: conductor under s6, `install_happ` from a JSON config, optional hc-http-gw, optional h2hc-linker + Caddy for browser nodes ([README, USAGE.md, docker/README.md](#src-edgenode)) | **Main branch now ships Holochain 0.7.0**: "Data directories from 0.6.x images are not compatible". The config schema has a network seed and properties but **no membrane proof field**, so a pātaka joining a membrane-gated group needs extra work. Optional Unyt log-sender reports usage to a collector when `LOG_SENDER_ENDPOINT` is set. Runs on "a HoloPort, virtual machine, … any … OCI container" host |
| Holo's cloud deployment design | Edge Node VMs on Hetzner, joining service, UI and log-collector on Cloudflare ([deploy/DESIGN.md](#src-edgenode)) | A proposal for Holo-operated deployments. It brings in two third-party providers and a joining service. That's a poor sovereignty fit for whakapapa unless a hapū chooses it knowingly |
| holo.host "Always-On Node" guide | Holo's marketing and how-to page | **(unverified)**: the page couldn't be fetched (egress blocked). It's known only from search snippets, which describe Edge Node as "a dedicated member of your group that is always online … holding a copy of the group's data" |

### Large files

- Hard limit: `ENTRY_SIZE_LIMIT = 4 * 1000 * 1000` (4 MB) per entry
  ([entry.rs L30](#src-hc-entry)).
- The docs recommend chunking large blobs along natural boundaries
  ([6_crud_actions.md](#src-docs-crud)) and point to
  `holochain-open-dev/file-storage`, which "chunks, stores, and retrieves
  arbitrary binary data" ([resources/index.md](#src-docs-resources)).
- file-storage splits files into 256 KB chunks client-side. It also ships a
  **provider/gateway** split: provider agents announce themselves and grant
  an unrestricted capability, and consumers `call_remote` a provider to
  store or fetch chunks ([file-storage](#src-filestorage)). Its newest branch
  is `for-hdk-0.5.4` and `main` depends on `hdk 0.5.3`, so there is **no 0.6
  branch** as of `cae5c467` (Jul 2025).

---

## 4. The open questions

### 4.1 Q1: Can an always-on peer hold a group's data without being able to read it?

**Short answer:** not by default. Only with app-level encryption, and that
has a validation cost. The old pātaka could do it because SSB encrypted to
recipients by default. On Holochain the default is the reverse: a network
member reads everything public.

| Option | Pātaka can't read? | Cost / risk | Kaupapa check |
|---|---|---|---|
| **A. Ordinary full member, cleartext** | No. It reads everything a member reads | Simplest; matches Edge Node and the issue's suggestion. A step back from v1 on confidentiality | OK on rules 1, 2 and 4 if it can't author content. **Rule 3** risk only if the app starts treating its copy as authoritative. Readability is a hapū trust call: hardware a kaitiaki controls may be fine, a third-party cloud may not |
| **B. Ordinary member, group content encrypted with a group key** (secretbox; key exported to each member *agent* via `shared_secret_export`/`ingest`; never exported to the node) | Content: yes. **Metadata: no.** Actions, authors, timestamps, entry types, link structure and tags stay public | Validation can only check the **cleartext envelope** (author, role, type, group, key epoch), not content shape. Key rotation on every removal. Each *device* is its own agent with its own lair, so every device gets the key separately. Quantum caveat for permanent ciphertext. Larger integrity-zome design | Rule 1: unaffected, since conflicting assertions are still separate signed entries. Rule 2: the "source asserts" structure must sit in the envelope or the ciphertext, and content-level validation of assertions is lost. Rule 4: key distribution has to be per agent key, never "per logged-in user" |
| **C. Separate storage-only DNA** (role or clone): the group's main DNA stays members-only cleartext; members also write *ciphertext* backups into a second network that only holds blobs; the pātaka joins only that one | Yes for content. It doesn't even see the main network's metadata | Two writes per change, so drift between them. The pātaka is then a backup/mailbox, not a DHT peer of the main network. It doesn't fix "main network goes dark"; it only lets a returning member recover data. Similar in shape to file-storage's provider DNA | If members *fetch through* the pātaka, it becomes "nothing only it can answer" (rule 3). Keep the main network authoritative, and treat the store as recovery only |
| **D. Private entries** | n/a | Private entries are never published, so a pātaka can't hold them at all | Doesn't help availability |
| **E. Membrane / private network alone** | No | Keeps *outsiders* out. Does nothing about a member that can read | Needed anyway; not an answer to Q1 |

**Recommendation.** Don't pick between A and B in code yet. **Flag, don't
decide**: whether a pātaka may read whakapapa is the hapū's call, and it may
vary by group and by content type. The repo's job is to:

1. Make A safe. A node can't author content, isn't a kaitiaki, and no client
   code reads from "the pātaka" specifically.
2. Keep B possible. Decide the entry envelope before the first real group
   network. See §5.2 for why the integrity zome is the deadline.
3. Prefer B over C if confidentiality from the node is required. C solves
   backup rather than reachability, and adds a second source of truth to keep
   in sync.

One more input for the hapū: under B, metadata stays public (who wrote what
type of thing, when, linked to what). For whakapapa, the *shape* of the link
graph can itself be sensitive. **(Unverified** whether link tags and base/target
hashes could be made opaque enough to matter; this needs a spike.)

### 4.2 Q2: Can a group member be a non-person agent?

**Short answer:** on Holochain every member is already an agent key, not a
person. The real question is whether *our* permission model says "person"
where it means "agent". Today `docs/plans/group-permissions.md` doesn't
mention agents or devices at all.

Holochain facts that drive this:

- An agent is a key pair held in one device's lair
  ([3_source_chain.md](#src-docs-sourcechain)). The 0.6 conductor still has a
  `chc_url` (chain head coordinator), but 0.7 removes it
  ([upgrade-holochain-0.7.md](#src-docs-upgrade07)), so sharing one agent
  across devices isn't a path to plan on. A person with a phone and a laptop
  is **two agents**. CLAUDE.md rule 4 already warns about this.
- A membrane proof can be "a signature from an agent that has authority to
  admit members" ([genesis-self-check-callback.md](#src-docs-genesis)), so it
  can carry claims such as an agent kind.

**Gaps in `docs/plans/group-permissions.md`:**

1. **Membership subject.** "Remove a kaitiaki or member" and "the removed
   agent can no longer write" assume one key per member. Add an explicit
   model: *group membership is held by agent keys; an agent is either linked
   to a person (one of possibly several devices) or is a node with no
   person.*
2. **Agent kind and allowed roles.** A node must never hold the kaitiaki
   role, and should not be able to author whakapapa, stories or relationship
   assertions. If it does web registration, it may author only registration
   requests (Q5). This needs validation rules, not UI rules (CLAUDE.md, access
   control).
3. **"Last kaitiaki" protection** (an open question in the plan) must count
   *persons*, not agents. Otherwise a person's two devices, or a node, could
   satisfy it.
4. **Removal.** "Remove a person" needs to remove all of that person's agent
   keys. "Remove a node" is the same action with one key. The plan's risk
   "membership and role stored separately drift apart" gets a third leg:
   person↔agent links.
5. **Who can admit a node.** That's a kaitiaki act. Should it need more than
   one kaitiaki? **Flag, don't decide.**
6. **Membrane proof format.** Version it now and leave room for an agent
   kind and an issuing-kaitiaki signature, so adding nodes later doesn't
   change the integrity zome.
7. **The removal metric only covers writes.** See Q4.

**Recommendation.** Add these as an explicit "agent model" section and open
question in the plan before Milestone 1 is planned. Building node support
isn't needed; the hooks are only types and validation branches.

### 4.3 Q3: Who runs it, and where?

**This is a hapū data-sovereignty decision. Flag, don't decide.** The code
must work for every option below and must not assume any one of them.

| Where | Who physically holds the data | Notes |
|---|---|---|
| Marae / hapū hardware (NUC, Pi, old HoloPort running Edge Node) | The hapū | Best sovereignty fit. Needs someone local to keep it running, plus power, connectivity and backups. Lair keys sit on that disk: "Loss is permanent and unrecoverable" (Edge Node DESIGN.md) |
| Hapū-rented cloud VM | The hapū's account, on a provider's disk, in the provider's jurisdiction | Reliable. Region and provider choice matter. Under option A the provider's operators could read the disk (conductor databases are encrypted at rest, but the operator holds the passphrase) **(unverified** how lair/DB passphrases are handled in Edge Node) |
| Āhau-team hosted | The Āhau team | Turns the dev team into a de facto custodian, which is exactly what CLAUDE.md rule 3 says to flag. Acceptable only as an opt-in a hapū chooses, never a default |
| Holo/Edge Node cloud (Hetzner + Cloudflare design) | Third parties | Adds outside dependencies and a joining service. Same concerns, one step further removed |

Whoever runs it, the design rules don't change: nothing only the pātaka can
answer, no client code that targets it specifically, and at least two
independent full-arc holders.

### 4.4 Q4: What happens when one is removed?

**The realistic leak model** (the same for a removed person or a removed
pātaka):

1. **Everything already synced stays.** On 0.6 a full-arc node has a full
   copy. Nothing in Holochain erases it (`CLAUDE.md`:
   removal is retraction).
2. **It may keep receiving new data.** App-level blocking is gone (0.6.1).
   Blocking happens only to authors of invalid ops. A removed agent whose
   membrane proof is still valid and who authors nothing invalid isn't
   blocked, so it probably keeps gossiping and receiving new public entries.
   Validation can reject its *writes* after removal, but nothing in the
   sources gives a way to stop its *reads*. **(Inferred from source and
   CHANGELOG, not tested; this is the first spike in §5.)**
3. **Metadata always.** Even with encryption, actions stay public to
   whoever is still in the network.

**Mitigations, roughly in order of strength:**

- **Key rotation (option B).** On removal, generate a new group key epoch
  and export it to the remaining member agents only. New content becomes
  unreadable to the removed agent; old content stays readable. This is the
  only technical way to stop *future* reads inside the same network.
- **Re-found the network.** Remaining members move to a new clone (new
  `network_seed`). The removed agent keeps the old network's data but sees
  nothing new. It's heavy, since history doesn't move by itself, and it
  touches sync semantics (CLAUDE.md high-risk area). Treat it as a last
  resort.
- **Operational.** For a pātaka the hapū controls, wiping or decommissioning
  the disk. This is a social guarantee, not a technical one, and the UI must
  say so plainly — never present an unenforced rule as a lock.
- **Membrane change.** Making the membrane stricter changes the DNA, which
  is also a new network.

**Gap to add to `group-permissions.md`:** its success metric "the removed
agent's writes … are rejected" is right but incomplete. Add an open
question: *after removal, can the removed agent still read new data? If yes,
the UI must say so.* Also add a Sweettest that measures it.

### 4.5 Q5: Is web registration still wanted?

**Unknown. It needs a stakeholder answer before any design.** Evidence of use
is narrow: the custom-field work was "only tested against the WPH tribe"
(ssb-pataka !13), files were "temporarily" hidden (!16), and there was an
empty-submission bug as late as 2025 (!20).

If it's wanted, here is what's involved:

- **Something always on that serves a page and accepts a POST.**
  `hc-http-gw` doesn't fit as-is. It answers **GET only** (405 for anything
  else), takes payload as base64 JSON in a query string with a 10 KB default
  limit, and its zome calls are signed by credentials the gateway authorises
  for **its own** cell ([hc-http-gw spec.md](#src-gw)). It suits a read-only
  public page. A sign-up form needs a small custom HTTP service in front of
  the node's conductor. The gateway's compatibility table maps Holochain
  0.6.x to gateway 0.3.x and 0.7.x to 0.4.x.
- **Encrypt in the browser to kaitiaki keys.** The browser has no lair. It
  can use libsodium to box each answer to every current kaitiaki *agent's*
  X25519 public key, using an ephemeral sender key. The node stores only
  ciphertext. Kaitiaki decrypt in their own lair with
  `x_25519_x_salsa20_poly1305_decrypt`. **(Unverified)**: whether a
  browser-side libsodium box can be read by the HDK's
  `XSalsa20Poly1305EncryptedData` format (nonce framing). Spike before
  committing.
- **Validation.** The node agent may author only `RegistrationRequest`
  entries, and only kaitiaki may accept or decline them (ties to Q2's agent
  kinds).
- **Multi-kaitiaki and rotation.** Which kaitiaki keys get the encryption?
  All current kaitiaki devices. Newly appointed kaitiaki can't read older
  requests unless someone re-encrypts them.
- **Abuse.** A public endpoint that writes to a DHT needs rate limiting and
  size limits. The old form's files field is the hard part.
- **Alternative to ask about first:** a signed invite link that opens the
  app. That needs no always-on web service at all.

### 4.6 Bootstrap and relay: plumbing, not a pātaka

- They hold **no group data**. The relay forwards encrypted traffic. The
  bootstrap server holds ephemeral, signed agent infos.
- They **do** see metadata: which agent keys are in which space (one space
  per group network if groups are clones), transport URLs and IP-level
  information, and timing ([agent.rs](#src-k2-agent)). Whoever runs them can
  map who belongs to which group network and when they're online.
- **The defaults aren't for production.** The pinned conductor defaults to
  the Holochain Foundation's dev-test bootstrap server and n0's public iroh
  relay. The docs say the public bootstrap server "is not appropriate for
  production hApps".
- **Everyone in a network must use the same bootstrap server**, so choosing
  one is a per-network decision, not a per-device one.
- The old app's file layer broke when someone else's bootstrap nodes were
  retired (`artefact-store` #1). Self-hosting is cheap: one container, and
  disposable state.

**Recommendation:** have one deliberate "who runs network infrastructure"
decision before any real whānau uses v2. Self-hosting by the Āhau project or
by a hapū is fine on rule 3, *because* these servers hold no data and can be
swapped. Record that reasoning so it isn't later used to justify a data
server.

---

## 5. Recommended approach and sequencing

### 5.1 Now, during the group-permissions slice

No pātaka code. Only design hooks that are cheap now and expensive later:

1. **Agent model in the plan** (Q2 gaps 1–6): membership by agent key; an
   agent links to a person or is a `node`; nodes can't be kaitiaki or author
   content; last-kaitiaki counts persons; "remove person" removes all their
   agents.
2. **Versioned membrane proof** with room for an agent kind and an issuing
   kaitiaki's signature.
3. **Removal reads gap** (Q4): add the open question to the plan, and a
   Sweettest asserting what a removed agent can still `get` after removal.
   It doesn't need to pass; it needs to *measure*. This also checks the §4.4
   inference.
4. **Arc test**: one Sweettest with a zero-arc agent and a full-arc agent,
   where the full-arc agent goes offline. Confirms the "phones go dark"
   behaviour on 0.6.3 and gives the second (offline-then-sync) validation
   pass a starting point.
5. **Client modules never address a specific peer.** The per-feature client
   reads from "the network", never from a named node.

### 5.2 Before the first real whānau group network exists

- **Decide the entry envelope, i.e. Q1 A vs B, per content type.** Changing
  integrity-zome entry definitions or validation changes the DNA hash, which
  is a new network ([cloning.md](#src-docs-cloning): "keyed by the hash of
  all its integrity zomes and DNA modifiers"). Under the clean-slate stance
  (no SSB-to-v2 data migration) there is no data to migrate *yet*. Once a
  real group is on a network,
  switching to encrypted entries means re-founding it. One option to weigh:
  an envelope with a cleartext/sealed discriminator and a key epoch from day
  one, with validation only reading envelope fields. **Flag, don't decide**:
  this trades content validation for confidentiality.
- **Decide network infrastructure** (§4.6): who runs bootstrap and relay
  servers.

### 5.3 Deferred: build the pātaka when a trigger fires

Build triggers (any one of these):

- A pilot group whose members are mostly on phones reports missed or late
  data. Measure this; don't assume it.
- Files/media lands as a feature. On 0.6 every full-arc phone would store all
  media, which pushes phones toward zero arc, which in turn needs always-on
  holders.
- A hapū asks for backup or reachability, or for web sign-up (Q5).

When it's built, the shape should be: the same hApp, headless, joining as a
`node` agent at full arc. Run it in a plain conductor or Edge Node, matched
to our Holochain version (Edge Node main is 0.7, and its 0.6 data
directories aren't compatible), with our own membrane-proof install step.
No separate pātaka app and no dashboard rebuilt screen by screen — capabilities are designed the way Holochain does them best, not copied from the old app.
Kaitiaki tools needed: admit a node, see which nodes hold the group's data,
remove a node.

Files: chunk below the 4 MB limit (file-storage uses 256 KB). Port or
re-implement chunking for 0.6/0.7 ourselves, since file-storage has no 0.6
branch. Don't adopt its provider/gateway pattern without changes:
routing reads through named providers is the rule-3 anti-pattern.

### 5.4 ADRs and issues to write

| Kind | Title | When |
|---|---|---|
| Plan edit | `group-permissions.md`: agent model, node agents, removal-reads question | Before Milestone 1 planning |
| Issue (#13 follow-up) | Add to the capability inventory: "whānau data stays reachable when everyone's phone is off"; "a whānau can keep a backup they control"; "a kaitiaki can see and remove the always-on nodes holding group data"; "a person can sign up from a web page" | Now |
| Spike issue | Sweettests: removed-agent reads; zero-arc + full-arc offline; Edge Node or headless conductor joining with a membrane proof | During the second (offline-then-sync) validation pass |
| Issue (Q5) | Web registration: stakeholder check, then design | When a hapū asks |
| ADR | Pātaka readability and entry encryption (Q1 + Q4): A vs B per content type, key rotation on removal | Before the first real group network; needs hapū input |
| ADR | Network infrastructure: who runs bootstrap/relay, and why that isn't a central authority | Before the first real group network |
| Issue | Pātaka build (headless node agent, kaitiaki node management, file chunking) | When a §5.3 trigger fires |

---

## 6. Risks: things that would violate CLAUDE.md

- **Treating the pātaka as "the server".** For example, the client fetching
  from it first, a "sync from pātaka" button, or its copy being used to
  settle conflicts. That breaks rule 3, and rule 1 if its copy wins.
  Conflicting relationship assertions must survive on the pātaka exactly as
  on any peer.
- **Only one full-arc holder.** Zero-arc phones plus one pātaka means
  nothing else can answer.
- **Nodes authoring content or holding roles.** A node that can write
  whakapapa or be a kaitiaki stops being an ordinary member and becomes an
  authority. Enforce this in validation.
- **Presenting removal as erasure.** "Pātaka removed" must not suggest the
  data is gone, or (on 0.6) that the node can no longer read.
- **Key-per-person thinking.** Exporting a group key "to a person" instead
  of to each of their agent keys breaks rule 4 on the second device.
- **Āhau-hosted by default.** A default pātaka run by the dev team is a
  central custodian with extra steps.
- **Rebuilding the old pātaka app screen by screen**, instead of designing the capability natively for Holochain.
- **Picking Q1 or Q3 in code** without a recorded hapū decision.

---

## 7. Sources

Repo files read: `CLAUDE.md`; `docs/adr/0003`, `0005`, `0006`;
`docs/contract-decisions.md`; `docs/plans/group-permissions.md`;
`docs/INDEX.md`; `docs/history/leg1/decentralized-backend-research.md`;
`docs/history/knowledge-base/cross_cutting.md` and `repos/ahau-pataka.md`,
`ahau-lib-ssb-plugins-ssb-pataka.md`, `ahau-lib-graphql-ssb-graphql-pataka.md`,
`ahau-lib-pataka-cli.md`, `ahau-lib-ssb-plugins-ssb-hyper-blobs.md`,
`ahau-lib-artefact-store.md`; `src/contract/operations/sources.ts`,
`storehouse.ts`, `types/records.ts`; `flake.nix`, `flake.lock`,
`workdir/happ.yaml`, `dnas/ahau/workdir/dna.yaml`; GitHub issues #22 and #13.

External, pinned:

- <a id="src-hc-conductor"></a>Holochain 0.6.3 conductor config: <https://github.com/holochain/holochain/blob/448a36efe8c4a95b7f3c6ccca9858d8275ed0a71/crates/holochain_conductor_api/src/config/conductor.rs#L292-L390>
- <a id="src-hc-actor"></a>Agents join at full arc: <https://github.com/holochain/holochain/blob/448a36efe8c4a95b7f3c6ccca9858d8275ed0a71/crates/holochain_p2p/src/spawn/actor.rs#L1444-L1471>
- <a id="src-hc-localagent"></a>Arc factor > 1 rejected until sharding: <https://github.com/holochain/holochain/blob/448a36efe8c4a95b7f3c6ccca9858d8275ed0a71/crates/holochain_p2p/src/local_agent.rs#L130-L138>
- <a id="src-hc-changelog-crate"></a>Holochain crate CHANGELOG (block_agent removed 0.6.1-rc.0 L69; iroh default L75; blocks on gossip L77/L109/L156; block authors of invalid ops L158): <https://github.com/holochain/holochain/blob/448a36efe8c4a95b7f3c6ccca9858d8275ed0a71/crates/holochain/CHANGELOG.md>
- Holochain root CHANGELOG (invalid-op warrants stabilised L951; sharding behind a flag L4337): <https://github.com/holochain/holochain/blob/448a36efe8c4a95b7f3c6ccca9858d8275ed0a71/CHANGELOG.md>
- <a id="src-hdk-crypto"></a>HDK encryption functions and caveats: <https://github.com/holochain/holochain/blob/448a36efe8c4a95b7f3c6ccca9858d8275ed0a71/crates/hdk/src/x_salsa20_poly1305.rs>
- <a id="src-hc-entry"></a>Entry size limit: <https://github.com/holochain/holochain/blob/448a36efe8c4a95b7f3c6ccca9858d8275ed0a71/crates/holochain_integrity_types/src/entry.rs#L30>
- <a id="src-k2-storagearc"></a>kitsune2 v0.4.1 storage arc update (sharding feature gate): <https://github.com/holochain/kitsune2/blob/b33fa55606f8bd5020cffacf1ffae41f92d4d296/crates/gossip/src/storage_arc.rs#L75-L105>
- <a id="src-k2-agent"></a>kitsune2 `AgentInfo` fields: <https://github.com/holochain/kitsune2/blob/b33fa55606f8bd5020cffacf1ffae41f92d4d296/crates/api/src/agent.rs#L150-L176>
- Holochain developer docs, source at `holochain/docs-pages@aff10767` (2026-09-01, now targeting 0.7). Published at developer.holochain.org:
  - <a id="src-docs-operating"></a>[build/operating-a-happ](https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/operating-a-happ.md)
  - <a id="src-docs-infra"></a>[resources/howtos/running-network-infrastructure](https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/resources/howtos/running-network-infrastructure.md)
  - <a id="src-docs-crypto"></a>[build/cryptography-functions](https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/cryptography-functions.md)
  - <a id="src-docs-entries"></a>[build/entries](https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/entries.md)
  - <a id="src-docs-genesis"></a>[build/genesis-self-check-callback](https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/genesis-self-check-callback.md)
  - <a id="src-docs-validate"></a>[build/validate-callback](https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/validate-callback.md)
  - <a id="src-docs-cloning"></a>[build/cloning](https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/build/cloning.md)
  - <a id="src-docs-dht"></a>[concepts/4_dht](https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/concepts/4_dht.md)
  - <a id="src-docs-sourcechain"></a>[concepts/3_source_chain](https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/concepts/3_source_chain.md)
  - <a id="src-docs-caps"></a>[concepts/8_calls_capabilities](https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/concepts/8_calls_capabilities.md)
  - <a id="src-docs-crud"></a>[concepts/6_crud_actions](https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/concepts/6_crud_actions.md)
  - <a id="src-docs-resources"></a>[resources/index](https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/resources/index.md)
  - <a id="src-docs-upgrade04"></a>[upgrade-holochain-0.4](https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/resources/upgrade/upgrade-holochain-0.4.md)
  - <a id="src-docs-upgrade07"></a>[upgrade-holochain-0.7](https://github.com/holochain/docs-pages/blob/aff10767059a103cea49a1a356fc91638ac100cf/src/pages/resources/upgrade/upgrade-holochain-0.7.md)
- <a id="src-gw"></a>hc-http-gw at `c34296bf` (v0.4.0 line): [README](https://github.com/holochain/hc-http-gw/blob/c34296bf29f27b49603f50d6feae5b02ed94abfc/README.md), [spec.md](https://github.com/holochain/hc-http-gw/blob/c34296bf29f27b49603f50d6feae5b02ed94abfc/spec.md)
- <a id="src-edgenode"></a>Edge Node at `Holo-Host/edgenode@ec63c361` (2026-09-04): [README](https://github.com/Holo-Host/edgenode/blob/ec63c3618e2781cb6514149491146dce7951fa19/README.md), [USAGE.md](https://github.com/Holo-Host/edgenode/blob/ec63c3618e2781cb6514149491146dce7951fa19/USAGE.md), [docker/README.md](https://github.com/Holo-Host/edgenode/blob/ec63c3618e2781cb6514149491146dce7951fa19/docker/README.md), [deploy/DESIGN.md](https://github.com/Holo-Host/edgenode/blob/ec63c3618e2781cb6514149491146dce7951fa19/deploy/DESIGN.md)
- <a id="src-filestorage"></a>holochain-open-dev/file-storage at `cae5c467` (2025-07-02): <https://github.com/holochain-open-dev/file-storage/tree/cae5c46774d26f4f30e592d93894ab9c175159b0>
- <a id="src-iroh-relay"></a>iroh-relay README at `n0-computer/iroh@b4c8fc68`: <https://github.com/n0-computer/iroh/blob/b4c8fc68ef21b78781741fab8c6c86a1043d0f97/iroh-relay/README.md>
- Not fetched (egress blocked); search snippets only, **unverified**: holo.host "How to Set Up an Always-On Holochain Node with Edge Node" <https://holo.host/resources/always-on-holochain-node-guide/>; Holochain dev-pulse posts on the sharding roadmap <https://blog.holochain.org/tag/dev-pulse>.
