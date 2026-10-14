# Design

## Context

See `proposal.md` for motivation and `specs/own-whakapapa/spec.md` for the behavior contract. The storage change defines private Relationship entries and a source-chain read that omits deleted relationships. The tree and link changes introduce a plain TypeScript graph model, feature client boundary, and per-person menus. Private entry contents are not visible to integrity validators, so the supported coordinator path owns relationship reads and workflow checks; author-only delete validation is based on action metadata.

## Goals / Non-Goals

**Goals:**

- Retract one authored Relationship with one Delete action and keep people and all other links intact.
- Give the author an exact preview of which people leave Me's connected component before confirmation.
- Keep disconnected people and their remaining relationships visible, and describe the source-chain history accurately.

**Non-Goals:**

- Deleting Relative entries or retracting relationships as a cascade.
- Changing how relationships are authored, shared, or represented as private entries.
- Refining tree placement or adding pan/zoom.

## Decisions

### Retraction targets one Relationship action

Expose `retract_relationship(hash)` through the coordinator and feature client. It creates one Delete for the addressed Relationship. Integrity validation permits the delete only when its author matches the original Create author; the coordinator verifies the action refers to a Relationship in the author's chain before issuing the delete. It does not delete people or inspect/cascade through adjacent edges. The existing source-chain read fold then excludes the relationship from live results while retaining Create and Delete history.

**Alternative considered:** remove a person or cascade through adjacent links. That would erase unrelated structure from the live view and contradict the requirement that only the selected relationship is retracted.

### Calculate disconnection from the current graph

Add a pure `disconnectedBy(tree, relationship)` domain function alongside the graph and link rules. Treat live parent-child relationships as undirected edges for component membership. Compute Me's reachable people before removal, then after removal; return exactly the people in the original Me component that are not reachable from Me afterward. If a parallel live edge or another path keeps everyone reachable, return an empty list. People already in other components are not newly disconnected and are not included.

The UI uses this result for a confirmation launched from the affected person's menu. The action is labeled “Remove link to X”; confirmation text says it will retract the selected relationship and names the exact resulting floating set. An empty result gets a plain confirmation. If source-chain data changed after the preview and the requested relationship is no longer live, the coordinator refuses without writing; the UI keeps the current view and reports the refusal so the author can review it again.

**Alternative considered:** calculate only the descendants of one endpoint, or assume a tree with no alternate paths. Either approach can misidentify the people disconnected when a graph has multiple parents, shared paths, floating components, or tolerated malformed data.

### Preserve floating components and their internal links

After retraction, rebuild the displayed tree from all remaining people and live relationships. The component containing Me remains the connected tree; all other components stay visible with their own links and the “not connected to you” label. Retraction does not remove any people from the read model.

**Alternative considered:** hide people no longer reachable from Me. That would conceal the effects and make later reconnection harder without deleting their underlying data.

### Retraction and privacy wording

Use “retract” for the data operation and “Remove link to X” only as the menu action. Confirmation and result copy must not claim that an entry or history was erased or that a person disappeared. Contents remain private to the author's chain, but peers can observe authored Relative/Relationship actions and their timing.

**Alternative considered:** describe the data as fully private or deleted. Both claims would misrepresent Holochain's visible action metadata or retained chain history.

## Risks / Trade-offs

- [A user can confirm against a stale graph preview] → Refuse if the selected relationship is not live when the coordinator handles the request; keep the view and ask the author to review the current graph.
- [Private relationship content cannot be checked by remote integrity validation] → Keep graph membership and “is this a Relationship?” checks in the supported coordinator flow; integrity validation enforces author-only deletion from public action metadata.
- [Peers can observe action authorship and timing] → State this alongside any privacy description; do not promise concealed activity.
- [SweetTest proof is local-only] → Include conductor-backed retraction and unauthorized-delete coverage and identify the local-only boundary; run unit tests for the pure graph calculation in CI.

## Migration Plan

No entry shape or existing chain data changes. The new operation writes a Delete for the existing Relationship type; reads that already fold Delete actions will omit it from live results. Rollback removes the UI/client operation but leaves the Delete action and prior source-chain history intact.
