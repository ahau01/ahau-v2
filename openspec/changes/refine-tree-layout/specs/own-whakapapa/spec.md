# Spec Delta

## ADDED Requirements

### Requirement: The tree layout keeps its anchor and makes relationship structure legible
The tree SHALL keep Me as the anchor of Me's connected component, place co-parents of a shared child side by side, reduce avoidable edge crossings, and visually separate floating components. The same valid tree input SHALL produce the same relative arrangement.

#### Scenario: Co-parents share a child
- **WHEN** two people are both parents of the same child
- **THEN** they appear side by side in the same generation, with the child in the next generation

#### Scenario: Branches can be ordered to avoid a crossing
- **WHEN** a tree has branches whose sibling ordering could create an edge crossing
- **THEN** the layout orders the branches so those avoidable crossings are absent

#### Scenario: Floating components are distinct from Me's component
- **WHEN** the tree contains people with no live path to Me
- **THEN** each floating component is laid out apart from Me's component while retaining its own live relationships

#### Scenario: Me remains the anchor
- **WHEN** the layout contains Me's connected component and any floating components
- **THEN** Me remains at generation zero and the connected tree is arranged around Me

#### Scenario: Repeated layout is deterministic
- **WHEN** the layout receives the same valid people and relationships more than once
- **THEN** each person has the same relative position in every result
