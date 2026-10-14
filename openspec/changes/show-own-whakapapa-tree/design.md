# Design

## Context

See [proposal.md](proposal.md) for motivation and [the spec deltas](specs/own-whakapapa/spec.md) for the behavior contract. Today `WhakapapaPage.svelte` renders `StillToCome`; `Shell.svelte` mounts it for the `#/me/whakapapa` route without props. App-to-Holochain calls are owned by feature clients outside `src/app/`, and `src/profile/boundary.test.ts` enforces that boundary. The tree therefore depends on `store-own-whakapapa` landing first and on its `get_whakapapa` read contract. Before implementing, read that change's final `design.md` and follow its result for the private-entry validation spike; this feature only reads the supported author-chain view and must not imply stronger privacy guarantees.

## Goals / Non-Goals

**Goals:**

- Derive a safe, displayable graph and deterministic coordinates from the private read result, without putting graph rules in Svelte.
- Keep all stored people visible, including disconnected people, even when malformed or incomplete relationship data must be omitted from the drawing.
- Preserve the route's page-heading focus behavior and the app/client boundary.

**Non-Goals:**

- Changing Holochain entry formats, validation, read semantics, or access control established by the storage change.
- Editing existing names or relationships, joining existing people, retracting relationships, or optimizing the layout beyond a basic layered arrangement.
- Pan, zoom, or a layout dependency.

## Decisions

### Build a sanitized graph as a pure domain step

Add plain TypeScript logic under `src/whakapapa/` that accepts the read model and Me's display name, then returns people, accepted parent-child edges, and components. Keep Me as the root person and include each returned Relative even if it has no usable edge. Ignore edges whose endpoints are absent, repeated edges, self-edges, and any edge that would close a directed cycle; keep processing the remaining edges. This ensures one corrupt relationship cannot hide an otherwise readable tree. Derive the Me component plus other weakly connected components, including isolated people; the UI labels the latter “Not connected to you.”

**Alternative considered:** trust coordinator output and draw it directly. The app still needs a deterministic fallback for stale, partial, or malformed query results, so validation at this presentation boundary is warranted even though the supported write path has its own checks.

### Keep layout hand-written, layered, and deterministic

`layoutWhakapapa()` consumes the sanitized graph and returns node coordinates and edge geometry inputs. Keep parent generations above children, place Me at generation zero in the Me component, and assign the other components from their own longest directed paths. Use a stable ordering for nodes within a generation and for separate components so the same data yields the same drawing. The first layout favors legibility and simple invariants; shared-parent positioning and crossing reduction belong to the later refinement change.

**Alternative considered:** a general graph-layout package. The requested first version has fixed, modest needs; an extra dependency would add lifecycle and bundle cost without providing needed behavior.

### Use SVG for edges and HTML controls for people

Render relationship lines in SVG with `aria-hidden="true"`, and render each person as an HTML button in generation reading order. Put the per-person Add parent/Add child actions in that person's menu. Give the drawing its own horizontal scroll container at narrow widths, keeping page navigation outside that scrolling region. Continue to use the existing heading focus helper when the Whakapapa page mounts.

**Alternative considered:** make the entire drawing one SVG interaction surface. Native HTML buttons and menus give the people and actions ordinary keyboard and screen-reader behavior without requiring SVG focus management.

### Inject the feature client at the existing app boundary

The Whakapapa page receives a narrow client interface and callbacks through the existing App/Shell composition, in the same way the profile page receives callbacks. A pretend implementation of that interface supports component tests without a conductor. Only `src/whakapapa/` owns Holochain calls; keep `src/app/` free of Holochain imports. Reuse the transport established by the storage change where its client composition permits it rather than adding a second connection lifecycle.

**Alternative considered:** let `WhakapapaPage.svelte` call the zome. That would violate the existing feature-client boundary and make UI tests depend on Holochain.

### State the privacy boundary in the page

Use concise copy explaining that the names and relationships stay on this agent's chain, and that peers can still see which agent authored the Relative and Relationship actions and when. Call this the author's own account, not a universal or biological fact. Private entry contents are not globally readable, but action provenance and timing remain part of Holochain's public activity.

**Alternative considered:** say only “Only you can see this.” That would overpromise by obscuring the visible action metadata.

## Risks / Trade-offs

- [The source-chain query can be incomplete or stale relative to other peers] → Render the author's returned view as-is; do not imply it is a globally current account, and retain all returned people when individual edges are invalid.
- [The sanitization rule may omit a relationship from malformed input] → Make omission deterministic, cover dangling, duplicate, self, and cycle cases with unit tests, and continue showing the unaffected graph.
- [Peers can see authorship and timing even though contents are private] → Include the precise privacy explanation in the page, consistent with the storage capability.
- [The existing App is constructed around one ProfileClient and the storage change is not yet merged] → Integrate only after inspecting the merged feature-client and shared connection setup; do not create another connection or loosen the zome call grant to all functions.

## Migration Plan

No stored data changes. Apply after `store-own-whakapapa` is merged. If the app change is rolled back, source-chain entries remain as written by that storage change; the existing navigation can return to the empty Whakapapa page without changing or retracting them.

## Open Questions

None. The dependency's final client interface and the exact spike result are implementation context to inspect before applying, not decisions that change this tree's behavior contract.
