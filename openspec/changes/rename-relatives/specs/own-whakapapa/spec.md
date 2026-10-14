# Spec Delta

## Purpose

Stores and presents one person's own account of relatives and parent-child relationships. Relative renaming adds a new name version while preserving the author's history and the identity of each relationship reference.

## ADDED Requirements

### Requirement: A relative can be renamed
The author SHALL be able to add a new name version for a Relative they created. A rename SHALL refer to that Relative's first Create action, and SHALL NOT change its identity or relationships.

#### Scenario: Rename preserves relative identity and relationships
- **WHEN** the author renames a Relative
- **THEN** a new name version is added for the same Relative
- **AND** its existing relationships still refer to that Relative

#### Scenario: Rename preserves earlier versions
- **WHEN** the author renames a Relative
- **THEN** the earlier name version remains in the author's chain history

### Requirement: Only the author can rename a relative
A rename SHALL be refused by validation unless it is authored by the agent who created the Relative. The update SHALL point to the Relative's first Create action; an update pointing elsewhere SHALL be refused.

#### Scenario: Another agent's rename is refused
- **WHEN** another agent attempts to rename a Relative, bypassing the app
- **THEN** validation refuses the update
- **AND** the author's latest name remains unchanged

#### Scenario: An update not pointing to the first Create is refused
- **WHEN** an update points to a later name version instead of the Relative's first Create
- **THEN** validation refuses the update

### Requirement: The Whakapapa read returns each relative's latest name
The author's Whakapapa read SHALL return the latest name version for each Relative while retaining the Relative's first Create identity for relationship references.

#### Scenario: Read after rename
- **WHEN** the author reads Whakapapa after renaming a Relative
- **THEN** the read returns the new name for that Relative
- **AND** relationships still identify it by its first Create action

### Requirement: A refused rename keeps the entered name
When a rename is refused, its form SHALL remain open with the name the author entered and SHALL show why the save was refused.

#### Scenario: Save is refused
- **WHEN** a rename save is refused
- **THEN** the form stays open with the entered name
- **AND** it shows the refusal reason

### Requirement: Me is renamed through profile editing
The Whakapapa tree SHALL offer renaming only for Relatives. Me's name SHALL continue to be changed through profile editing.

#### Scenario: Me has no rename action
- **WHEN** the author opens the person menu for Me
- **THEN** no Whakapapa rename action is offered
