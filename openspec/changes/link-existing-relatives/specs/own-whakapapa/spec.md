# Spec Delta

## ADDED Requirements

### Requirement: Existing people can be linked as parent and child
The author's whakapapa SHALL allow one Relationship between two existing people identified as Me or a Relative. Linking SHALL not create a Relative or change either person's name.

#### Scenario: Link two existing people
- **WHEN** the author links an existing person as the parent of another existing person
- **THEN** one Relationship is recorded and the read returns that live relationship
- **AND** no Relative is created

#### Scenario: Link from a person's menu
- **WHEN** the author opens a person's menu and chooses “Link to existing person”
- **THEN** they can choose which person is the parent and which is the child from people already in their whakapapa
- **AND** each refused pairing is explained where it is offered

### Requirement: Invalid links are refused by the supported workflow
The link workflow SHALL refuse a person linked to themselves, an identical live parent-child relationship, or a relationship that would create a cycle. A refused link SHALL write no Relationship.

#### Scenario: Self-link is refused
- **WHEN** the author tries to link a person as their own parent or child
- **THEN** the workflow explains that the same person cannot be both ends
- **AND** no Relationship is written

#### Scenario: Duplicate live link is refused
- **WHEN** the author tries to add a parent-child relationship that is already live
- **THEN** the workflow explains that this relationship is already recorded
- **AND** no Relationship is written

#### Scenario: Cycle is refused
- **WHEN** the author tries to make a person's descendant their parent
- **THEN** the workflow explains that this link would create a cycle
- **AND** no Relationship is written

### Requirement: Linking preserves authorship and privacy limits
A link SHALL remain the author's account of a parent-child relationship. Its contents SHALL be private to the author's chain, while peers may observe that the author wrote a Relationship action and when.

#### Scenario: Peers see action provenance but not link contents
- **WHEN** another peer inspects synchronized activity for a newly linked relationship
- **THEN** it can identify the authored action and its timing
- **AND** it cannot read the relationship contents
