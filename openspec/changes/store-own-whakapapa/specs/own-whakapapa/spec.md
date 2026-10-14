# Spec Delta

## Purpose

Stores one person's own account of their relatives and parent-child relationships on their source chain. The capability preserves that account's privacy and authorship without presenting it as universal or biological truth.

## ADDED Requirements

### Requirement: Whakapapa entries are private to their author
Relative names and relationship contents SHALL be stored as private entries on the author's source chain and SHALL NOT be readable by another agent. The author SHALL be able to read their own entries.

#### Scenario: Another agent cannot read private contents
- **WHEN** another agent requests the author's Relative or Relationship entry contents
- **THEN** the entry action can be found but its contents are null

#### Scenario: The author reads their own contents
- **WHEN** the author reads their whakapapa
- **THEN** the names and relationships they stored are returned from their own chain

### Requirement: Whakapapa carries authorship and visibility limits
The stored account SHALL be attributed to the agent who wrote it. Other peers may see that the agent wrote Relative or Relationship actions and when, but SHALL NOT see their private contents. The account SHALL NOT be represented as universal or biological truth.

#### Scenario: Action provenance is visible without private contents
- **WHEN** another peer inspects synchronized activity for the author's private whakapapa entries
- **THEN** it can identify the authored actions and their timing, but cannot read names or relationships

### Requirement: Relatives are name-only references
Each Relative SHALL contain a name and a random nonce. A relationship reference SHALL identify Me or a Relative by the action hash of that Relative's first Create.

#### Scenario: A relative is referenced by its first action
- **WHEN** a relationship names a relative
- **THEN** it points to that relative's first Create action, regardless of any later name versions

### Requirement: Relationships express only parent and child
A Relationship SHALL connect a parent and a child as the author's account. It SHALL NOT assert that the relationship is biological or a universal fact.

#### Scenario: Parent-child account
- **WHEN** the author stores that one person is another's parent
- **THEN** the relationship records only that parent-child account and its author

#### Scenario: A person can have multiple recorded parents
- **WHEN** the author records more than one parent for a person
- **THEN** each parent-child account is stored without a fixed parent-count limit

### Requirement: Adding a relative writes both entries atomically
Adding a relative with direction Parent or Child of Me or an existing Relative SHALL write one Relative and its first Relationship in one operation. Both entries SHALL be committed or neither SHALL be committed.

#### Scenario: Relative and relationship are both stored
- **WHEN** the author adds a named parent or child of a valid PersonRef
- **THEN** the read returns the new relative and its relationship

#### Scenario: A failed add writes neither entry
- **WHEN** adding a relative fails after the operation begins
- **THEN** neither the Relative nor its Relationship is committed

### Requirement: A profile must exist before whakapapa entries
An agent SHALL have a profile on their source chain before creating whakapapa entries.

#### Scenario: Add without a profile is refused
- **WHEN** an agent tries to create whakapapa entries before creating a profile
- **THEN** the operation is refused and no whakapapa entries are committed

### Requirement: Only the author can update or retract their entries
An entry SHALL only be updatable or deletable by the agent who authored it. An update SHALL point to the entry's first Create action. A delete SHALL retract only the addressed entry.

#### Scenario: Another agent cannot update or retract an entry
- **WHEN** another agent attempts to update or delete the author's entry
- **THEN** the action is refused by validation

#### Scenario: An update points to the first Create
- **WHEN** the author updates an entry
- **THEN** the update points to its first Create action

### Requirement: Reading whakapapa returns latest names and live relationships
The read SHALL return the author's relatives with their latest names and all relationships not retracted by a delete, using the author's source-chain query. It SHALL NOT depend on public links or other agents' data.

#### Scenario: Updated relative name is returned
- **WHEN** a relative has a later name version
- **THEN** the read returns the latest name for that relative

#### Scenario: Retracted relationship is not live
- **WHEN** a relationship has been retracted
- **THEN** it is absent from the returned live relationships
