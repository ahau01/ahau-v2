# Design

## Context

See `proposal.md` for motivation and `specs/own-whakapapa/spec.md` for the behavior contract. The current `profiles` integrity/coordinator pair provides the local pattern: private entries, author checks on action metadata, source-chain `query()`, and coordinator calls that group writes. The Ahau DNA declares each integrity zome and its dependent coordinator zome in `dnas/ahau/workdir/dna.yaml`.

Private entry operations do not carry entry contents to remote validators. In `profiles/src/lib.rs`, private Create/Update branches validate action metadata only; pinned HDI 0.7.3 `FlatOp::StoreRecord::CreatePrivateEntry` contains the action and entry type, but no entry value. Thus content checks cannot be treated as network validation. The implementation spike in task 1 must confirm this against the repo's pinned runtime and record the evidence here before selecting final validation wording. Until that check, the design assumes the author-side integrity callback also lacks contents.

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

Task 1 is the implementation spike: inspect and exercise the pinned private-entry validation path, then record its result and evidence in this design. Current source evidence is that HDI's flattened private `StoreRecord` operation exposes action metadata and entry type, not content, and the existing profiles validator says the same. If confirmed, the coordinator/domain code checks content it receives (including a non-empty name and valid `PersonRef`) before writing; integrity validation still enforces author-only updates/deletes and first-Create ancestry using public action metadata. Such content checks must be described as application-side refusal, not as a guarantee against a client that bypasses the coordinator. Do not add stronger content rules than the spike shows can be enforced.

**Alternative considered:** claim all content rules are integrity-enforced. That would overstate what remote validators can verify for private entries and give callers a false guarantee.

### Atomic add and chain-local reads

`add_relative(name, direction, of)` resolves Me or a previously created Relative, generates a fresh nonce, then calls `create_entry` for the Relative and Relationship in the same coordinator invocation. Holochain commits coordinator writes as one source-chain workflow; conductor coverage must demonstrate rollback when the second write fails. `get_whakapapa` uses `query()` over the author's own source chain, including entries, and folds Create/Update/Delete actions to return relatives with latest names and only live relationships. The read must not rely on DHT links or another agent's data.

**Alternative considered:** separate calls for Relative and Relationship. A failure between them would leave an orphan person and violate the add contract.

### Feature client boundary

Expose the operations through `src/whakapapa/` following `src/profile/client.ts`; app code must not import Holochain APIs directly. This change adds no UI integration, so the existing `#/me/whakapapa` empty state and navigation contract remain intact.

## Risks / Trade-offs

- [Peers can observe private-entry action authorship and timing] → State this limitation in the capability and any client-facing privacy description; do not promise anonymity or concealment of tree shape metadata.
- [Coordinator-side content checks can be bypassed by a client writing directly] → Keep the limitation explicit; integrity validation still protects author-only update/delete rules, while the coordinator checks inputs on the supported call path.
- [A chain-local read cannot retrieve this data on another device with a different agent key] → Treat the data as belonging to this agent's chain; cross-device access is not part of this change.
- [SweetTest privacy and atomicity evidence is local-only] → Add conductor tests and report that proof boundary; unit zome tests remain suitable for deterministic validation rules.

## Migration Plan

No existing entries need conversion. Add the zomes and DNA declarations together with the feature client. If deployment is rolled back, the private actions remain on source chains but older app code will not expose them; a rollback does not erase chain history.

## Open Questions

None. The private-validation spike is a required task with a design assumption and fallback already specified above; it is not a deferred product decision.
