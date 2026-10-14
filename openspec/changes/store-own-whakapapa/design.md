# Design

## Context

See `proposal.md` for motivation and `specs/own-whakapapa/spec.md` for the behavior contract. The current `profiles` integrity/coordinator pair provides the local pattern: private entries, author checks on action metadata, source-chain `query()`, and coordinator calls that group writes. The Ahau DNA declares each integrity zome and its dependent coordinator zome in `dnas/ahau/workdir/dna.yaml`.

Private entry operations do not carry entry contents to integrity validators. The pinned workspace dependency is HDI 0.7.3. Its `FlatOp::StoreRecord::CreatePrivateEntry` variant provides only the `Create` action and private entry type; it has no entry value. The existing `profiles` validator compiles against this API and handles private Create/Update operations using action metadata alone (`dnas/ahau/zomes/integrity/profiles/src/lib.rs`, `validate`). This source-level proof establishes that the integrity callback cannot enforce name or relationship content rules. Those checks belong in the supported coordinator call path and are application-side refusals; a client that bypasses that coordinator can write malformed private content. Integrity validation still enforces author-only mutation and profile ancestry from action metadata. The ancestry check identifies the public Profile entry by DNA metadata (zome index 0, entry index 0), matching both DNA manifests. Integrity zomes cannot depend on each other's generated entry-type registry because their linker symbols collide.

## Goals / Non-Goals

**Goals:**

- Keep names and relationship contents private to the author's source chain while accurately explaining that action authorship and timing are visible to peers.
- Make the relative plus first relationship one coordinator operation, so a failed call commits neither write.
- Read only the author's chain and resolve name history and relationship retractions there.
- Keep app-to-Holochain calls inside a feature client.

**Non-Goals:**

- Displaying or editing a whakapapa tree in the app, or changing the Whakapapa navigation empty state.
- Renaming relatives, linking two existing relatives, retracting a relationship through a user workflow, or refining a tree layout. These belong to later changes.
- Deleting people as a side effect, publishing Holochain links, or claiming a relative/relationship is canonical or biological.

## Decisions

### Private entries, no links

Store both `Relative { name, nonce }` and `Relationship { parent, child }` as private entry types. `PersonRef` is either Me or the action hash of a Relative's first Create. Holochain links are not used: links are public and would disclose the tree's shape. A random nonce in each Relative prevents the private entry hash published by a Create action from being a straightforward hash of a short guessed name.

**Alternative considered:** public entries or links would make queries and relationship discovery easier, but expose names or structure and contradict the privacy requirement.

### Coordinator owns content checks that private validation cannot prove

The spike confirms that HDI's flattened private `StoreRecord` operation exposes action metadata and entry type, not content. The coordinator checks content it receives (including a non-empty name and valid `PersonRef`) before writing; integrity validation enforces author-only updates/deletes and first-Create ancestry using action metadata. Such content checks are application-side refusals, not a guarantee against a client that bypasses the coordinator.

**Alternative considered:** claim all content rules are integrity-enforced. That would overstate what remote validators can verify for private entries and give callers a false guarantee.

### Atomic add and chain-local reads

`add_relative(name, direction, of)` resolves Me or a previously created Relative, generates a fresh nonce, then calls `create_entry` for the Relative and Relationship in the same coordinator invocation. Holochain commits coordinator writes as one source-chain workflow; conductor coverage demonstrates rollback after both writes are staged and the call fails. `get_whakapapa` uses `query()` over the author's own source chain, including entries, and folds Create/Update/Delete actions to return each Relative's latest non-retracted name version and only live relationships. Deleting one name version therefore reveals the latest remaining version. Relationship updates are refused; retraction addresses their Create action. The read must not rely on DHT links or another agent's data.

**Alternative considered:** separate calls for Relative and Relationship. A failure between them would leave an orphan person and violate the add contract.

### Feature client boundary

Expose the operations through `src/whakapapa/` following `src/profile/client.ts`; app code must not import Holochain APIs directly. This change adds no UI integration, so the existing `#/me/whakapapa` empty state and navigation contract remain intact.

The dev signing key is granted the `get_whakapapa` and `add_relative` functions for the whakapapa zome, alongside its profile functions. The conductor enforces this allowlist.

### Retraction is version-level

Deleting a Relative's original Create retracts only that name version; a surviving Update keeps the Relative visible under its latest name, and its live Relationships remain. This is the intended behavior for this change.

## Risks / Trade-offs

- [Peers can observe private-entry action authorship and timing] → State this limitation in the capability and any client-facing privacy description; do not promise anonymity or concealment of tree shape metadata.
- [Coordinator-side content checks can be bypassed by a client writing directly] → Keep the limitation explicit; integrity validation still protects author-only update/delete rules, while the coordinator checks inputs on the supported call path.
- [A chain-local read cannot retrieve this data on another device with a different agent key] → Treat the data as belonging to this agent's chain; cross-device access is not part of this change.
- [SweetTest privacy and atomicity evidence is local-only] → Add conductor tests and report that proof boundary; unit zome tests remain suitable for deterministic validation rules.

## Migration Plan

Adding `whakapapa_integrity` changes the DNA hash. Existing dev cells and their profiles remain on the old DNA; this change does not migrate them into the new DNA. Preserve the old conductor data and old hApp bundle before installing the changed DNA. A new cell needs a profile before it can add whakapapa. No destructive data conversion is part of this change. Rollback means using the old hApp with its old cell; it does not erase actions from either source chain.

## Accepted constraints and follow-up

- Same agent key only: accepted for this change; revisit when multi-device access lands.
- Peers see authorship and timing: accepted for this change; revisit when broader sharing lands.
- When a page first needs profile and whakapapa together, consolidate their duplicated client connection setup, move the whakapapa import out of `profile/dev-connection.ts`, and remove the single-use token.
