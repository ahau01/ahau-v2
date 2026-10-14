# Design

## Context

See [proposal.md](proposal.md) for motivation and
[the spec delta](specs/own-whakapapa/spec.md) for the behavior contract. The
tree change introduces a pure, hand-written layered layout and deliberately
defers optimization. This change is only applicable after the storage, tree,
rename, link, and retraction changes have landed, and after the resulting tree
has been used with real whakapapa data. At that point, inspect the merged
`layoutWhakapapa()` API and use real-tree observations to guide ordering while
keeping the domain boundary intact.

Historical experience cautions against inferring partner positioning from
only one relationship category: an earlier layout used birth children for
partner placement, which could position adopted or whāngai relationships
poorly. Other prior fixes addressed cousin-partner collisions and crossing or
ordering bugs. This tree stores only parent-child relationships, so co-parent
positioning must follow shared children without adding a partner type or
claiming that a relationship has a particular cause.

## Goals / Non-Goals

**Goals:**

- Improve generation ordering while preserving the existing layering and
  component model.
- Make the relative layout deterministic for stable input, including tie
  cases.
- Keep layout as a pure TypeScript function with no new runtime dependency.

**Non-Goals:**

- Changing tree construction, relationship data, storage, or validation.
- Adding partner edges or distinguishing birth, adoption, or whāngai edges.
- Changing the drawing interaction model with pan or zoom.

## Decisions

### Refine ordering within the existing layered layout

Keep the current generation assignment and Me's generation-zero anchor. Add a
deterministic ordering pass within generations that uses parent-child
neighborhoods to reduce avoidable crossings. Treat people sharing a child as
co-parents for positioning, and keep them side by side in that generation.
Use a stable identity-based tie-breaker whenever relationship structure does
not determine an order. Keep floating components separated from Me's
component, and retain their internal parent-child geometry.

**Alternative considered:** replace the layout with a general graph-layout
package. This change has a fixed, small graph model and a hand-written pure
function already owns coordinate assignment; a dependency would add runtime
and maintenance cost without improving the ownership boundary.

### Keep evidence and tests relational

Before implementation, use the completed tree on real data and record the
layout issues that this refinement addresses. Unit tests should assert
generation membership, ordering, adjacency/relative placement, separation,
and stable repeated output rather than pinning absolute coordinates. Include
multiple-parent and floating-component cases so the ordering logic does not
depend on a biological or partner relationship type.

**Alternative considered:** snapshot exact SVG coordinates. Pixel-level
snapshots would couple tests to spacing constants and make future readability
adjustments expensive without proving the relationship properties.

### Preserve the pure layout boundary

Do not change the sanitized people, accepted edges, or groups returned by the
tree-building domain step. Layout may only choose coordinates from that
already-built graph. This keeps any malformed-edge handling and relationship
meaning owned by the existing domain logic.

**Alternative considered:** perform ordering while building the graph. That
would mix data acceptance with presentation and make layout refinement affect
which relationships appear.

## Risks / Trade-offs

- [Some complex parent-child graphs impose competing co-parent and crossing
  preferences] → Preserve generation and relationship constraints first; use
  stable tie-breaking where the preferences cannot all be satisfied, and cover
  representative overlapping structures with relational tests.
- [A layout that looks better on a small fixture may not help a real tree] →
  Keep this optional and defer implementation until the five preceding
  changes have been used on a real tree.
- [Stable ordering can change existing node positions] → No data is written by
  layout; review the resulting tree with its author before treating the
  refinement as complete.

## Migration Plan

No migration or source-chain action is needed. Apply after the prerequisite
changes and real-tree use. Rollback consists of restoring the prior pure
layout implementation; stored people and relationships are unaffected.
