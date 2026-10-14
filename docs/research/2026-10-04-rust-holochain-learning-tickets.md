# Rust and Holochain learning tickets for the Āhau v2 rewrite

**Date:** 2026-10-04
**Question:** What is the current plan for the rewrite, and what hands-on
learning work could two developers turn into GitHub tickets to learn Rust and
Holochain on the way to that plan?
**Status:** research notes. Nothing here is decided. The tickets are
proposals to triage, not filed issues.

**How this was researched.** In-repo sources were read directly (paths and
line numbers are given). GitHub issues were read from `ahau01/ahau-v2`.
External claims come from the official sources. One limit: the network proxy
blocked `developer.holochain.org`, `docs.rs` and `doc.rust-lang.org`, so the
Holochain developer docs were read from their source repo,
[`holochain/docs-pages`](https://github.com/holochain/docs-pages), and the
Rust Book from [`rust-lang/book`](https://github.com/rust-lang/book).
Published URLs are given alongside for convenience
(`https://developer.holochain.org/build/<page>/`,
`https://doc.rust-lang.org/book/<file>.html`), but only the GitHub source was
fetched. Crate versions come from the crates.io API.

---

## 1. The current plan

### 1.1 Decisions made

- Rewrite instead of continuing to patch the SSB stack.
- Holochain is the only backend being built. nostr was dropped for capacity reasons. Production backend choice is formally still "undecided pending this one adapter clearing its exit criteria".
- **Exit criterion.** Holochain's capability-grant system must deliver *enforced* group permissions (kaitiaki/member removal, plus at least one per-content-type permission) "without resorting to custom protocol-level workarounds". Patching Holochain or relying on undocumented conductor behaviour falsifies it.
- Two-devices-offline-then-sync validation is **out of** the first checkpoint and deferred to a second, committed validation pass.
- Keep the Svelte shell. Gramps.js is deferred.
- No SSB-to-v2 data migration for the MVP.
- Redesign around user capabilities directly on Holochain. The spec is a capability inventory (#13). The Leg 1 contract in `src/contract/` is frozen reference and a checklist, not an interface to implement.
- The shell talks to Holochain only through thin per-feature client modules (for example a `groups` client). No adapter layer.
- Kaupapa principles are invariants. Kaupapa tests move to Holochain tests against a real conductor. The multi-source "both assertions survive" test does not exist yet, and it belongs in the first slice touching relationship data, together with the deferred offline-then-sync validation.
- Removal is retraction, never erasure. A permission is either enforced or it isn't, and the UI must never show an unenforced rule as a lock. Graph traversal happens in the backend (`CLAUDE.md`; [Leg 1 semantics](../history/leg1/leg1-contract.md#cross-cutting-semantics)).
- The dev environment is pinned to Holochain 0.6 through Holonix `main-0.6` (`flake.nix`). `flake.lock` pins `holochain-0.6.3`. JS deps are `@holochain/client` 0.20.8 and `@holochain/tryorama` 0.19.2 (`package.json`; README "Holochain" section).

### 1.2 Sequencing as it stands (2026-10-04)

1. **Done:** #15, the Holochain dev environment, an empty DNA/hApp, and a
   profile client with `waitUntilReady`. It has real-conductor Tryorama tests
   (`src/profile/client.ts`, `src/profile/client.conductor.ts`, merged in
   PR #23). The DNA has no zomes yet (`dnas/ahau/workdir/dna.yaml`).
2. **Next, the profile slice (#14 and its sub-issues):**
  - #16: store my own profile on Holochain, name only. Validation must
     reject non-owner writes and a second profile per agent key. First decide
     between holochain-open-dev/profiles and a small custom zome.
  - #17: first-launch flow against a pretend client.
  - #18: connect first launch to the real conductor. This is the
     stakeholder demo.
  - #19 and #20: parity with the old app.

   #14 explains why profiles come before group permissions: group
   permissions needs people with profiles, and the Holochain capability-grant
   exit criterion for the group-permissions checkpoint is unchanged.
3. **Then the first slice proper, group permissions**
   ([docs/plans/group-permissions.md](../plans/group-permissions.md)). Two
   milestones, both still `pending`:
  - M1: kaitiaki/member removal, enforced so that "the removed agent's
     writes to the group are rejected by validation".
  - M2: one per-content-type permission, starting with "whakapapa record
     creation: Kaitiaki only", rejected by validation.

   The spec is "Draft — no milestone started. Awaiting product decisions"
   (L104-106).
4. **Second validation pass:** offline-then-sync, and the first
   relationship-data slice carrying the multi-source assertion test (per the
   Holochain exit criterion and the decision to rewrite kaupapa tests as
   Holochain tests against a real conductor).
5. **In parallel and not blocking:**
  - #13, the capability inventory. Open and unassigned. It must
     be complete "before deep Holochain work beyond the group-permissions
     slice".
  - #24, move the frozen contract out of the build. Blocked by #17.
  - #21, licence.
  - #22, the Pātaka question. Its Q2, "can a group member be something
     other than a person?", must be checked while designing group
     permissions.

### 1.3 Still open

- **Group permission model.** Is it the per-content-type matrix or a simple
  kaitiaki/member toggle? Is there last-kaitiaki protection? What happens to
  a removed member's already-synced data? What if two kaitiaki remove each
  other while offline? The original GitLab MRs (!536, !540, !541, !934) have
  not been recovered. (`group-permissions.md` L79-94)
- **Profiles module.** Use holochain-open-dev/profiles or a custom zome
  (#16)?
- **Production backend choice.** Formally undecided — Holochain is the thing being built and evaluated, not yet the committed production choice, since there is no second adapter left to compare it against.
- **Pātaka / always-on peer** (#22). Can it hold data without being able to
  read it? Can a non-person agent be a group member?
- **Multi-device identity.** Explicitly out of scope for #14.
- **Licence** (#21).

---

## 2. Holochain facts that shape the tickets (verified 2026-10-04)

### Versions

- **Released crates.** The latest stable `holochain` and `hdk` are **0.7.0**
  (2026-07-30), and `hdi` is **0.8.0**. The 0.6 line ended at `holochain` /
  `hdk` 0.6.3 with `hdi` 0.7.3 (2026-07-15). Pre-releases are on 0.7.1-rc,
  0.8.0-dev and 0.9.0-dev.
  Sources: [crates.io holochain](https://crates.io/api/v1/crates/holochain),
  [hdk](https://crates.io/api/v1/crates/hdk),
  [hdk versions](https://crates.io/api/v1/crates/hdk/versions?per_page=100),
  [hdi](https://crates.io/api/v1/crates/hdi),
  [GitHub releases](https://github.com/holochain/holochain/releases).
- **This repo** pins 0.6.3. Zomes written for it should depend on
  `hdk = "=0.6.3"` and `hdi = "=0.7.3"`, the pairs the 0.6 upgrade guide
  names
  ([upgrade-holochain-0.6.md](https://github.com/holochain/docs-pages/blob/main/src/pages/resources/upgrade/upgrade-holochain-0.6.md)).
- **Holonix branches.** `main-0.6`, `main-0.7` and `main` all exist
  ([holonix branches](https://github.com/holochain/holonix/branches/all)).
  The Get Started guide still installs from `holonix?ref=main-0.6` and
  expects scaffolding CLI `0.601.x`
  ([get-started/index.md](https://github.com/holochain/docs-pages/blob/main/src/pages/get-started/index.md)).
- **0.7 rewrites the Action model** (`header` + `data`, `TypedAction<…>`). It
  renames FlatOp variants (`StoreEntry`→`CreateEntry`, link ops collapse into
  `Link(OpLink)`), changes validator signatures, removes
  `block_agent`/`unblock_agent`, moves Holonix to `main-0.7` with Node 24,
  and moves `@holochain/client` to 0.21
  ([upgrade-holochain-0.7.md](https://github.com/holochain/docs-pages/blob/main/src/pages/resources/upgrade/upgrade-holochain-0.7.md)).
  Validation code learned on 0.6 will need porting.

### Testing

- **Tryorama is deprecated.** "As of Holochain 0.6, Tryorama is no longer an
  official package … we encourage you to switch your tests to Sweettest, a
  Rust-based test harness"
  ([testing-with-tryorama.md](https://github.com/holochain/docs-pages/blob/main/src/pages/build/testing-with-tryorama.md)).
- "Tryorama has been removed from Holochain 0.6.1's Holonix development
  environment." Sweettest tests live in
  `dnas/<dna>/zomes/coordinator/<zome>/tests` and run with `cargo test`
  (upgrade-holochain-0.6.md).
- The Tryorama README maps v0.19.x to JS client v0.20.x and Holochain v0.6.x,
  and says not to expect 0.7+ support from the Holochain team. A community
  fork lives at holochain-open-dev/tryorama
  ([holochain/tryorama](https://github.com/holochain/tryorama)).
- **Sweettest** lives at
  [`crates/holochain/src/sweettest/`](https://github.com/holochain/holochain/tree/main/crates/holochain/src/sweettest).
  Its main types are `SweetConductor`, `SweetConductorBatch`, `SweetDnaFile`,
  `SweetCell` and `SweetZome`.
  [`await_consistency(cells)`](https://github.com/holochain/holochain/blob/main/crates/holochain/src/sweettest/sweet_consistency.rs)
  is documented as "Wait 60s for all cells to reach consistency." The docs
  say a Sweettest guide is still to come ("We'll update this guide for
  Sweettest in the future").
- **Tryorama offline simulation.** It has `conductor.shutDown()` /
  `startUp()` and `dhtSync` (testing-with-tryorama.md).

### Data model

- **Integrity and coordinator zomes.** Entry types live in integrity zomes
  (`#[hdk_entry_helper]`, `#[hdk_entry_types]`). CRUD (`create_entry`,
  `update_entry`, `delete_entry`, `get`, `get_details`) lives in coordinator
  zomes, "which are easier to update after deployment"
  ([entries.md](https://github.com/holochain/docs-pages/blob/main/src/pages/build/entries.md)).
- **Updates don't overwrite.** An `Update` "doesn't remove the original data
  from the DHT". Multiple updates coexist, and "it's up to you to decide
  whether two updates on the same entry or action are a conflict". A
  `Delete` marks rather than erases, and remains visible via `get_details`
  (entries.md). This lines up with CLAUDE.md rule 1 and its removal-is-retraction
  rule, *provided the app doesn't add a "latest wins" read on top*.
- **Links can't be updated, only created or deleted.**
  - Link types are defined with `#[hdk_link_types]`.
  - `get_links` takes a `LinkQuery`.
  - `get_links_details` returns deleted links too.
  - `delete_link` needs `GetOptions`.
  - `Path::from("a.b").typed(..)?.ensure()?` builds anchors.
  - "Too many links on a single base address creates extra work for the
    peers responsible for it", so use path buckets.

  Sources:
  [links-paths-and-anchors.md](https://github.com/holochain/docs-pages/blob/main/src/pages/build/links-paths-and-anchors.md);
  0.6 API changes in upgrade-holochain-0.6.md.

### Validation

- **Validation must be deterministic.** It must "always yield the same
  true/false outcome for a given operation regardless of who is validating
  them and when"
  ([validation.md](https://github.com/holochain/docs-pages/blob/main/src/pages/build/validation.md)).
- **Results.** `Valid`, `Invalid(String)` and `UnresolvedDependencies`. The
  scaffolder generates `validate_create_*`, `validate_update_*` and
  `validate_delete_*`. Examples compare `action.author()` against the
  original action's author
  ([validate-callback.md](https://github.com/holochain/docs-pages/blob/main/src/pages/build/validate-callback.md)).
- **No `get_links` or `get_details` in validation.** These "can give varying
  values depending on the current state of the metadata at an address and
  aren't available to validation callbacks". Only `must_get_*` is allowed.
  `must_get_agent_activity` returns "a contiguous, bounded slice of a source
  chain"
  ([must-get-host-functions.md](https://github.com/holochain/docs-pages/blob/main/src/pages/build/must-get-host-functions.md)).
  The page gives **no guidance on deterministic role/permission checks**.
- **Membrane proofs.** `genesis_self_check` "doesn't have access to DHT
  data". Full membrane-proof checks belong in `validate` on
  `AgentValidationPkg`
  ([genesis-self-check-callback.md](https://github.com/holochain/docs-pages/blob/main/src/pages/build/genesis-self-check-callback.md)).

### Capability grants

- There are three kinds of grant: unrestricted, transferable (secret) and
  assigned (secret + agent keys). Grants are created with
  `create_cap_grant`, with `GrantedFunctions::Listed`. "A capability only
  covers one cell." They gate **zome function calls**, especially
  `call_remote`
  ([capabilities.md](https://github.com/holochain/docs-pages/blob/main/src/pages/build/capabilities.md)).
- `call_remote` returns `ZomeCallResponse::Unauthorized` on denial. The
  "author grant" covers calls between cells with the same agent
  ([calling-zome-functions.md](https://github.com/holochain/docs-pages/blob/main/src/pages/build/calling-zome-functions.md)).
- **Grants do not control who can write to, or read from, the DHT.** That is
  validation's job. See gap G1.

### Stability and learning material

- In 0.6, "warrants are now stable", but "countersigning and other features
  remain unstable" (upgrade-holochain-0.6.md).
- **Official learning material:**
  - The forum hApp tutorial uses `hc scaffold entry-type` and
    `hc scaffold collection`
    ([2-forum-app-tutorial.md](https://github.com/holochain/docs-pages/blob/main/src/pages/get-started/2-forum-app-tutorial.md)).
  - The self-paced training covers anchors, capability tokens and validation
    through the `holochain-immersive/forum-happ` and `private-publication`
    exercises. It was recorded in 2023 and warns that "functions and types …
    may have changed"
    ([self-paced-developer-training.md](https://github.com/holochain/docs-pages/blob/main/src/pages/get-started/self-paced-developer-training.md)).
- **Rust:** The Rust Book
  ([SUMMARY.md](https://github.com/rust-lang/book/blob/main/src/SUMMARY.md)).
  Chapter files are cited per ticket below.

---

## 3. Candidate learning tickets

### Conventions

- **Kind.**
  - 🧪 *Throwaway*: a scratch hApp, not merged into `ahau-v2`.
  - 🔁 *Spike → real*: code or findings meant to become, or directly shape,
    real repo code.
  - ✅ *Real*: an existing or near-real ticket.
- **Size**, at the team's current ~10 h/week per developer:
  - **S** ≤ ½ day
  - **M** 1–3 days
  - **L** about a week or more
- **Kaupapa flag** marks tickets touching relationship data, sync or access
  control. Each flagged ticket says how it respects CLAUDE.md.
- **Where throwaway code lives.** Not decided. Suggest a separate scratch
  repo (e.g. `ahau01/holochain-katas`) so experiments don't look like live
  code. That is the same concern #24 raises about the frozen contract. Flag
  this for the team to decide.
- **Pin to the repo's versions.** Holonix `main-0.6`, `hdk =0.6.3`,
  `hdi =0.7.3`, so lessons transfer straight into `dnas/ahau/`. T14 covers
  0.7.

---

### T0. Get the Holochain dev shell green on both machines

- **Kind / size:** ✅ Real (repo hygiene). **S**. Pair.
- **Goal:** Nix and Holonix basics, and what `hc dna pack`, `hc app pack` and
  `hc sandbox` do.
- **Scope / acceptance:**
  - [ ] Both devs follow README "Holochain" steps 1–4 unaided.
  - [ ] `npm run build:happ`, `npm run test:conductor` and
    `npm run conductor` pass.
  - [ ] Issue an app token with `scripts/issue-app-token.mjs`.
  - [ ] Any README step that was wrong or unclear is fixed in a PR.
- **Read:**
  - README "Holochain" section
  - [get-started/index.md](https://github.com/holochain/docs-pages/blob/main/src/pages/get-started/index.md)
  - [upgrade-new-holonix.md](https://github.com/holochain/docs-pages/blob/main/src/pages/resources/upgrade/upgrade-new-holonix.md)
- **Feeds:** #15's "a new developer can follow" criterion; #16 onward.

### T1. Rust foundations through Āhau-shaped types (no Holochain)

- **Kind / size:** 🧪 Throwaway. **M**. Split, then swap and review each
  other's code.
- **Goal:** ownership and borrowing, structs, enums with `match`, `Result`
  and `?`, modules, `#[derive]`, and unit tests.
- **Scope / acceptance.** A plain `cargo new --lib` crate with:
  - [ ] `struct RelationshipAssertion { source, subject, object, kind, asserted_at }`.
  - [ ] An `enum RelationshipKind`.
  - [ ] An `enum GroupRole { Kaitiaki, Member }`.
  - [ ] `fn can_create(role, content_type, policy) -> Result<(), PermissionError>`.
  - [ ] Unit tests (`cargo test`), including a test that a `Vec` of
    conflicting assertions keeps both. No dedup to "the true one".
  - [ ] `serde` `Serialize`/`Deserialize` derives, round-tripped through
    JSON.
- **Read (Rust Book):**
  - [ch04 Ownership](https://github.com/rust-lang/book/blob/main/src/ch04-00-understanding-ownership.md)
  - [ch05 Structs](https://github.com/rust-lang/book/blob/main/src/ch05-00-structs.md)
  - [ch06 Enums](https://github.com/rust-lang/book/blob/main/src/ch06-00-enums.md)
  - [ch07 Modules](https://github.com/rust-lang/book/blob/main/src/ch07-00-managing-growing-projects-with-packages-crates-and-modules.md)
  - [ch09 Error handling](https://github.com/rust-lang/book/blob/main/src/ch09-00-error-handling.md)
  - [ch11 Testing](https://github.com/rust-lang/book/blob/main/src/ch11-00-testing.md)
  - [Appendix C Derivable traits](https://github.com/rust-lang/book/blob/main/src/appendix-03-derivable-traits.md)
- **Split:** Dev A takes the relationship types. Dev B takes the role and
  policy types. Then review each other's.
- **Feeds:** the shape vocabulary for T8, T10 and T12.
- **Kaupapa:** the "keep both" test is the first rehearsal of CLAUDE.md
  rule 1. No Holochain sync is involved.

### T2. Build the official forum hApp tutorial in a scratch repo

- **Kind / size:** 🧪 Throwaway. **M**. Pair (driver/navigator, swap halfway).
- **Goal:** the hApp → DNA → integrity/coordinator zome layout,
  `hc scaffold`, entry types, link types, collections, and running two
  conductors.
- **Scope / acceptance:**
  - [ ] Forum hApp scaffolded on Holonix `main-0.6`, with `Post`, `Comment`
    and an `all_posts` collection.
  - [ ] Running locally with two agents.
  - [ ] A one-page note in the scratch repo mapping each generated file to
    its role: integrity vs coordinator, `dna.yaml`, `happ.yaml`.
- **Read:**
  - [2-forum-app-tutorial.md](https://github.com/holochain/docs-pages/blob/main/src/pages/get-started/2-forum-app-tutorial.md)
  - [application-structure.md](https://github.com/holochain/docs-pages/blob/main/src/pages/build/application-structure.md)
  - [zomes.md](https://github.com/holochain/docs-pages/blob/main/src/pages/build/zomes.md)
- **Feeds:** how `dnas/ahau/workdir/dna.yaml` will gain its first
  integrity/coordinator pair (#16).

### T3. Read the generated zome code: macros, traits, `ExternResult`

- **Kind / size:** 🧪 Throwaway. **S–M**. Split by zome, then explain to
  each other.
- **Goal:** Rust generics, traits and macros as the HDK uses them.
  - `#[hdk_extern]`, `#[hdk_entry_helper]`, `#[hdk_entry_types]` and
    `#[hdk_link_types]`
  - `ExternResult`, `wasm_error!`, `TryFrom`
  - Why integrity and coordinator are separate crates
- **Scope / acceptance:**
  - [ ] The T2 integrity and coordinator code is annotated, with each macro
    and trait bound explained in a comment.
  - [ ] Each dev explains one zome to the other.
  - [ ] Write down three questions the code didn't answer.
- **Read:**
  - [ch10 Generics/Traits](https://github.com/rust-lang/book/blob/main/src/ch10-00-generics.md)
  - [ch20-05 Macros](https://github.com/rust-lang/book/blob/main/src/ch20-05-macros.md)
  - [entries.md](https://github.com/holochain/docs-pages/blob/main/src/pages/build/entries.md)
  - [zome-functions.md](https://github.com/holochain/docs-pages/blob/main/src/pages/build/zome-functions.md)
- **Feeds:** confident reading of #16 and of holochain-open-dev/profiles.

### T4. First Sweettest test, side by side with Tryorama

- **Kind / size:** 🔁 Spike → real (the findings feed a test-harness
  decision). **M**. Split: Dev A writes Sweettest, Dev B writes Tryorama,
  then compare.
- **Goal:** Rust async tests (`#[tokio::test]`), `SweetConductor`,
  `SweetDnaFile`, `await_consistency`, and how this compares to the repo's
  existing Tryorama tests.
- **Scope / acceptance.** In the T2 scratch hApp, the same scenario in both
  harnesses:
  - [ ] Alice creates a post.
  - [ ] Bob sees it after `await_consistency` / `dhtSync`.
  - [ ] A short comparison note covering setup cost, speed, and how each
    simulates offline. Also: can Sweettest run in CI without Holonix's
    Tryorama?
  - [ ] A recommendation for `ahau-v2`.
- **Read:**
  - [testing-with-tryorama.md](https://github.com/holochain/docs-pages/blob/main/src/pages/build/testing-with-tryorama.md)
  - [upgrade-holochain-0.6.md, Sweettest section](https://github.com/holochain/docs-pages/blob/main/src/pages/resources/upgrade/upgrade-holochain-0.6.md)
  - [sweettest/](https://github.com/holochain/holochain/tree/main/crates/holochain/src/sweettest)
  - [ch17 Async](https://github.com/rust-lang/book/blob/main/src/ch17-00-async-await.md)
- **Feeds:** gap G2, Tryorama vs Sweettest for kaupapa tests.
- **Kaupapa:** none directly. Note CLAUDE.md "Tests assert real behaviour":
  both harnesses run a real conductor, which is what matters.

### T5. Validation kata: author-only update/delete, and field rules

- **Kind / size:** 🧪 Throwaway. **M**. Pair.
- **Goal:** the `validate` callback, scaffolded `validate_create_*` /
  `validate_update_*` / `validate_delete_*`, `must_get_valid_record`,
  `action.author()`, determinism, and negative tests.
- **Scope / acceptance:**
  - [ ] Add to the T2 hApp a rule that only the author can update or delete a
    `Post`.
  - [ ] Add a rule that the title must be non-empty and ≤ 200 chars.
  - [ ] Sweettest (or Tryorama) tests where Bob's update of Alice's post is
    **rejected by validation**. Assert the error, not just "no change".
  - [ ] Show that the rule holds when the call bypasses the UI, by calling
    the zome directly.
- **Read:**
  - [validation.md](https://github.com/holochain/docs-pages/blob/main/src/pages/build/validation.md)
  - [validate-callback.md](https://github.com/holochain/docs-pages/blob/main/src/pages/build/validate-callback.md)
  - [must-get-host-functions.md](https://github.com/holochain/docs-pages/blob/main/src/pages/build/must-get-host-functions.md)
- **Feeds:** **#16** directly. Its acceptance criteria need "validation
  rejects a profile written by anyone but the owning agent, and a second
  profile for the same agent key". After T5, the pair should take #16 as
  their first real Rust ticket.
- **Kaupapa (access control):** a rehearsal of enforcing rules in
  validation, not the client (CLAUDE.md L79-83).

### T6. (Existing) #16: profile zome, as the pair's first real Holochain code

- **Kind / size:** ✅ Real. **M–L**. Pair. Suggested split: Dev A on the zome
  and Sweettest/Tryorama tests, Dev B on the TS client methods
  (`getMyProfile`, `createMyProfile`) and conductor tests.
- **Learning add-on.** Before writing code, evaluate holochain-open-dev/profiles
  against the pinned 0.6.3. Read its integrity validation. Does it allow
  others to overwrite? One profile per key? Record the outcome in the PR, as
  #16 requires.
- **Kaupapa:** the profile is the person's own account of themselves, not
  the canonical record of them (#16 body, CLAUDE.md rule 1).

### T7. Links, anchors and retraction: a "my groups" index

- **Kind / size:** 🧪 Throwaway. **M**. Split: Dev A on create/read, Dev B
  on delete/details. Then merge.
- **Goal:** `#[hdk_link_types]`, `create_link`, `get_links` with
  `LinkQuery`/`tag_prefix`, `delete_link(…, GetOptions)`,
  `get_links_details`, `Path`/anchors and hotspots.
- **Scope / acceptance.** In a scratch hApp:
  - [ ] A `Group` entry.
  - [ ] Links agent → group ("my groups") and an anchor `all_groups`
    bucketed by name prefix.
  - [ ] Removing a link hides it from `get_links` but it **still appears in
    `get_links_details`** with its delete action. A test asserts both.
  - [ ] A short note linking this to CLAUDE.md's "removal is
    retraction".
- **Read:**
  - [links-paths-and-anchors.md](https://github.com/holochain/docs-pages/blob/main/src/pages/build/links-paths-and-anchors.md)
  - upgrade-holochain-0.6.md (LinkQuery/GetOptions changes)
  - [leg1-contract.md](../history/leg1/leg1-contract.md#cross-cutting-semantics)
- **Feeds:** port of `semantics/retraction-hides-without-erasing`
  (the Holochain-backed version of the SSB-era conformance case); group
  listing in the first slice.

### T8. Group membership spike: only kaitiaki can add members

- **Kind / size:** 🔁 Spike → real. **L**. Pair on the design, then split the
  implementation.
- **Goal:** model roles in entries and links, and enforce "who may write
  this" in validation using only `must_get_*`.
- **Scope / acceptance.** In a scratch hApp:
  - [ ] `Group` (created by its first kaitiaki) and `Membership { group, agent, role }`
    entries.
  - [ ] Validation: a `Membership` create is valid only if its author holds a
    kaitiaki membership in that group. The author proves this by
    referencing that membership's action hash in the entry, checked with
    `must_get_valid_record`.
  - [ ] Tests:
    - kaitiaki adds a member → valid
    - member adds a member → rejected
    - a random agent adds themselves → rejected
  - [ ] A design note answering: is a member an agent key or a person? (#22
    Q2, CLAUDE.md rule 4: an agent key is a device, not "a logged-in user".)
- **Read:**
  - validation.md
  - must-get-host-functions.md
  - genesis-self-check-callback.md (membrane proofs, as an alternative entry
    gate)
  - [docs/plans/group-permissions.md](../plans/group-permissions.md)
- **Feeds:** group-permissions M1 groundwork.
- **⚑ Kaupapa (access control, identity):**
  - Enforcement is in validation, so it holds when the UI is bypassed and at
    sync time.
  - No central authority: any peer validates, and there is no "group server"
    node (rule 3).
  - Membership is keyed on agent keys, and the note must spell out what
    multi-device would mean (rule 4).

### T9. Removal-enforced spike: can a removed member's writes be rejected?

- **Kind / size:** 🔁 Spike → real. This is **the Holochain capability-grant
  exit-criterion question in miniature**. **L**. Pair throughout.
- **Goal:** the limits of deterministic validation. `must_get_agent_activity`
  and `ChainFilter`, and why `get_links` isn't allowed. Three agents in
  Sweettest.
- **Scope / acceptance.** Extend T8:
  - [ ] A kaitiaki *retracts* a `Membership`, with a Delete or a
    `Removal` entry. Nothing is erased.
  - [ ] Test: after removal **and sync**, the removed agent's new group
    write is rejected by validation.
  - [ ] Test the offline case. The removed agent writes **while it hasn't
    seen the removal**. Record exactly what happens: valid, invalid, or
    warrant.
  - [ ] Test and implement last-kaitiaki protection.
  - [ ] A findings note answering:
    - (a) Does this need any undocumented conductor behaviour or a
      Holochain patch? That is the falsification signal for the Holochain
      capability-grant exit criterion.
    - (b) What does "removed" mean for the removed agent's already-synced
      data?
    - (c) What did the design have to assume about ordering?
- **Read:** must-get-host-functions.md, validation.md,
  group-permissions.md (Open Questions, Risks).
- **Feeds:** the M1 plan, which the spec says is not yet written.
- **⚑ Kaupapa (access control, sync):**
  - This touches the "revoked member's already-synced local data" leak
    vector (CLAUDE.md L79-83). The ticket documents it; it does not paper
    over it.
  - Removal is retraction, never erasure.
  - Must not introduce an "authoritative" node to decide ordering (rule 3).

### T10. Capability grants and `call_remote` kata

- **Kind / size:** 🧪 Throwaway. **M**. Split: Dev A writes the grant side,
  Dev B the claim/caller side. Then pair on revoke.
- **Goal:** `create_cap_grant`, `CapAccess` (assigned vs transferable vs
  unrestricted), `GrantedFunctions::Listed`, `generate_cap_secret`,
  `CapClaim`, `call_remote`, `ZomeCallResponse::Unauthorized`, and revoking
  by deleting the grant.
- **Scope / acceptance:**
  - [ ] Alice grants Bob an *assigned* capability to call
    `request_private_note` on her cell.
  - [ ] Bob calls it successfully.
  - [ ] Alice deletes the grant, and Bob gets `Unauthorized`.
  - [ ] A note answering: what does a capability grant protect, and what
    doesn't it protect? The DHT writes from T8/T9 are governed by
    validation, not grants.
- **Read:**
  - [capabilities.md](https://github.com/holochain/docs-pages/blob/main/src/pages/build/capabilities.md)
  - [calling-zome-functions.md](https://github.com/holochain/docs-pages/blob/main/src/pages/build/calling-zome-functions.md)
  - self-paced training Lesson 3 (`private-publication`, 2023; expect API
    drift)
- **Feeds:** gap G1, the wording of the Holochain capability-grant exit
  criterion.
- **⚑ Kaupapa (access control, identity):**
  - Assigned grants bind to agent keys, not sessions (rule 4).
  - Avoid transferable secrets as "passwords".

### T11. One enforced per-content-type permission: "whakapapa records: kaitiaki only"

- **Kind / size:** 🔁 Spike → real (group-permissions M2). **L**. Pair.
- **Goal:** storing a policy with the group and enforcing it in validation
  against a referenced, deterministic policy version.
- **Scope / acceptance:**
  - [ ] A `GroupPolicy { group, whakapapa_create: KaitiakiOnly | AllMembers }`
    entry, authored by kaitiaki.
  - [ ] A placeholder `WhakapapaRecord` must reference the group and the
    policy, and validation checks the author's role against it.
  - [ ] Tests:
    - with KaitiakiOnly, a member's create is **rejected by validation**
    - with AllMembers, it is accepted
  - [ ] A note on what happens if two kaitiaki publish different policies
    concurrently. Do not resolve it by last-write-wins (CLAUDE.md rule 1);
    describe the options.
- **Read:** group-permissions.md (Success Metrics); validation.md;
  entries.md (multiple updates).
- **Feeds:** M2.
- **⚑ Kaupapa (access control, conflict):**
  - "A permission is either enforced or it isn't."
  - Concurrent policy edits must be represented, not silently overwritten.

### T12. Offline-then-sync basics: two agents, one goes dark

- **Kind / size:** 🔁 Spike → real (the harness pattern becomes the
  project's offline-sync test template). **M**. Split: Dev A in Sweettest,
  Dev B in Tryorama (`shutDown`/`startUp`). Compare.
- **Goal:** eventual consistency, `await_consistency`/`dhtSync`, and the
  fact that updates branch rather than overwrite.
- **Scope / acceptance:**
  - [ ] Bob goes offline. Alice creates, then updates, a record. Bob comes
    back, and after sync he sees it.
  - [ ] **Partitioned concurrent update.** Alice and Bob both update the same
    original while out of contact. After sync, `get_details` on the original
    returns **both** updates.
  - [ ] A test asserts that neither update was lost.
  - [ ] A note on what `get` returns in this case, and why the UI must not
    treat that as "the" value (CLAUDE.md "Holochain is not a database").
- **Read:** entries.md ("it's up to you to decide whether two updates … are
  a conflict"); testing-with-tryorama.md; sweet_consistency.rs.
- **Feeds:** the committed second validation pass (offline-then-sync). CLAUDE.md
  L75-78's requirement for "two-devices-offline-then-sync test coverage
  against a real conductor".
- **⚑ Kaupapa (sync):** the test asserts that both edits survive. There is
  no last-write-wins.

### T13. Multi-source relationship assertions: two agents disagree and both survive

- **Kind / size:** 🔁 Spike → real. Intended to become **the missing kaupapa
  test** (CLAUDE.md L116-120). **L**. Pair throughout. This
  is the most kaupapa-sensitive ticket in the set.
- **Goal:** design an entry and link model where a relationship is "source X
  asserts Y", and prove it under partition.
- **Scope / acceptance.** In a scratch hApp:
  - [ ] Write a design note **before** code, covering why this is not a
    graph edge or an updatable record.
  - [ ] A `RelationshipAssertion { subject, object, kind, … }` entry. The
    **source is the action author**. There is no `source` field a caller
    could spoof, or validation checks it equals `action.author()`.
  - [ ] Validation:
    - updates and deletes are allowed only by the asserting author
    - no one can update or retract another source's assertion
    - preferably, revision is a new assertion plus a retraction of the old
      one, rather than `update_entry`
  - [ ] Links from each person's anchor to the assertions about them.
  - [ ] **Test, partitioned.** Alice asserts "A is parent of B" and Bob
    asserts "C is parent of B" while out of contact. After sync, both agents
    reading B's relationships get **both** assertions, each with its source.
  - [ ] Bob's attempt to retract Alice's assertion is rejected by validation.
  - [ ] Alice retracting her own assertion hides it from live reads, but it
    is still visible through details. Bob's assertion is unaffected.
  - [ ] The zome has **no** "resolve" or "canonical" read. Which assertion to
    display is left to the render layer (CLAUDE.md rule 1).
- **Read:** CLAUDE.md "Four things not to do"; entries.md;
  links-paths-and-anchors.md (hotspots, for popular tūpuna); validate-callback.md;
  leg1-contract.md cross-cutting semantics (walks in the backend).
- **Feeds:** the first relationship-data slice. Not yet planned; it follows
  group permissions.
- **⚑ Kaupapa (relationship data, sync, identity):** this is the explicit
  note CLAUDE.md rule 2 requires.
  - Assertions are append-only and owned by their source.
  - Conflicts are represented, not resolved.
  - No node or agent is authoritative.
  - Source is a key, not a session.

  Before promoting it to real code, the design note should be reviewed by
  the person carrying project context, per "Flag, don't decide".

### T14. Kaitiaki remove each other while offline (research spike, not code to keep)

- **Kind / size:** 🧪 Throwaway code, 🔁 real findings. **M**. Pair.
- **Goal:** apply T9 and T12 to the group-permissions open question (L91-94).
- **Scope / acceptance:**
  - [ ] Two kaitiaki, partitioned, each retract the other's membership.
  - [ ] After sync, record what validation and reads show.
  - [ ] List the design options and their trade-offs, for example:
    - both removals stand, and the group needs a recovery path
    - a group-defined rule decides
    - the UI surfaces the conflict to remaining members
  - [ ] **Do not** pick last-write-wins. Output is a findings note for a
    stakeholder decision.
- **Read:** group-permissions.md Open Questions; CLAUDE.md rules 1 and 3.
- **Feeds:** M1's plan; the second validation pass.
- **⚑ Kaupapa (access control, sync):** this is about representing the
  conflict, not deciding it. The decision belongs to stakeholders.

### T15. Version drill: port the T5 validation kata to Holochain 0.7

- **Kind / size:** 🧪 Throwaway. **S–M**. One dev ports, the other reviews.
- **Goal:** read an upgrade guide and handle real API churn: `TypedAction`,
  `ActionData`, and the FlatOp renames.
- **Scope / acceptance:**
  - [ ] The T5 hApp is on a branch using Holonix `main-0.7`, `hdk 0.7.0` and
    `hdi 0.8.0`, with tests in Sweettest. Tryorama won't support 0.7+.
  - [ ] A list of every change needed.
  - [ ] An estimate of the cost of upgrading `ahau-v2` now vs later.
- **Read:** [upgrade-holochain-0.7.md](https://github.com/holochain/docs-pages/blob/main/src/pages/resources/upgrade/upgrade-holochain-0.7.md).
- **Feeds:** gap G3, the version decision.

### Suggested order and parallelism

```
T0 ─┬─ T1 (split) ── T3 (split)
    └─ T2 (pair) ──┬─ T4 (split) ── T5 (pair) ── T6 = #16 (split)
                   └─ T7 (split)
T5,T7 ── T8 (pair→split) ── T9 (pair) ──┬─ T11 (pair)
T10 (split) can run alongside T8         └─ T14 (pair)
T4,T5 ── T12 (split) ── T13 (pair)
T15 any time after T5, once G3 is being decided
```

A practical cadence at 10 h/week:

- **Weeks 1–3:** T0–T5.
- **Then:** T6 (#16) as real work.
- **Then:** T7, T8 and T10 together.
- **Then:** T9 and T11. These are the exit-criterion evidence.
- **Then:** T12, T13 and T14 as the second validation pass.

---

## 4. Gaps, contradictions and open questions

- **G1. The exit criterion names the wrong mechanism.**
  - The exit criterion asks whether "Holochain's capability-grant system"
    delivers enforced group permissions.
  - The group-permissions spec measures success as writes "rejected by
    validation" (L52-53).
  - Per the Holochain docs, capability grants gate zome function calls, and
    validation governs what may be written to the DHT (capabilities.md,
    validation.md).
  - The spec's metrics are the right ones. The ADR's wording could lead
    someone to build grant-based "permissions" that don't stop DHT writes.
  - Worth a clarifying note or ADR amendment.
- **G2. Tryorama is deprecated and the repo depends on it.**
  - The repo's conductor tests use `@holochain/tryorama` 0.19.2
    (`package.json`; `src/profile/client.conductor.ts`). It is fine for
    0.6.x.
  - But Tryorama is "no longer an official package", it was removed from
    Holonix in 0.6.1, and its README says not to expect 0.7+ support.
  - CLAUDE.md L78 says "Tryorama or Sweettest" without choosing.
  - Kaupapa tests are about to be written, so the harness choice should be
    decided before that (T4).
  - Probably keep Tryorama for TS client tests and Sweettest for zome and
    validation tests. Not decided.
- **G3. Version currency.**
  - The repo pins 0.6.3. 0.7.0 has been stable since 2026-07-30 and changes
    the Action and validation APIs substantially.
  - The official Get Started guide still targets `main-0.6`, so staying is
    defensible for now.
  - The upgrade cost grows with every validation rule written. Decide before
    the group-permissions zome (T15).
  - **Node versions.** Holonix's 0.6 guide moves scaffolded apps to Node 22
    and 0.7 to Node 24. The repo requires Node 20 (`.nvmrc`, `package.json`
    `engines`). No breakage has been observed, but it is worth checking.
- **G4. Deterministic revocation is undocumented territory.**
  - Holochain's docs give no guidance on deterministic role or permission
    checks (must-get-host-functions.md).
  - "Removed agent's writes are rejected" has an inherent ordering problem
    under partition: a removed agent may write before seeing the removal.
  - This is the crux of the Holochain capability-grant exit criterion's
    falsification test. T9 and T14 should produce evidence, not assumptions.
  - Watch for designs that quietly introduce an authoritative orderer
    (CLAUDE.md rule 3).
- **G5. CLAUDE.md is stale on two points.**
  - It says "No Holochain code exists yet" (L26, L72). #15/PR #23 added a
    dev environment, an empty DNA/hApp and a profile client.
  - Its high-risk section says to "revisit this section once the first slice
    lands".
  - Minor, but agents read it first.
- **G6. Slice order.**
  - The Holochain-adoption and capability-driven-redesign decisions name
    group permissions as the first slice. #14 puts profiles first and gives
    a reason.
  - This is consistent in spirit but not recorded anywhere formal. A
    one-line note in the group-permissions spec would stop future confusion.
- **G7. The relationship-data slice has no plan or owner.**
  - The capability-driven redesign decision puts the multi-source test "in
    the first slice touching relationship data", but no such slice is
    planned or ticketed.
  - The group-permissions spec's M2 mentions "whakapapa record creation",
    which may be the first code to touch whakapapa data.
  - Decide whether M2's placeholder whakapapa record must already follow the
    assertion model (T11 vs T13).
- **G8. The capability inventory (#13) is unassigned.** It's a precondition
  for Holochain work beyond the first slice, and doubles as onboarding for
  the junior. It could run alongside T0–T5 as the
  junior's product-knowledge track.
- **G9. Where scratch code lives** is undecided. A separate repo is
  suggested. `docs/INDEX.md` also doesn't list `docs/research/` yet; add it
  if this note is kept.
- **G10. The profiles module decision (#16)** depends on
  holochain-open-dev/profiles supporting 0.6.3. Its compatibility couldn't be
  confirmed from its GitHub landing page during this research. That check is
  T6's first step.
- **Open product questions carried forward unchanged** from
  group-permissions.md L79-94: matrix vs toggle, self-removal and last
  kaitiaki, the lost MRs, already-synced data, and mutual removal offline.
  None of the tickets above should settle these by default.
