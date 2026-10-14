# Spec Delta

## ADDED Requirements

### Requirement: The author can retract one relationship
The author SHALL be able to retract one Relationship they authored. Retraction SHALL affect only that relationship; it SHALL NOT remove either person or any other relationship. The retracted relationship SHALL be absent from live reads while its chain history remains.

#### Scenario: Retract one live relationship
- **WHEN** the author confirms removal of a relationship they authored
- **THEN** that relationship is absent from the live whakapapa read
- **AND** both people and every other relationship remain available
- **AND** the source-chain history retains the retraction

#### Scenario: Another agent cannot retract the relationship
- **WHEN** another agent attempts to retract the author's relationship
- **THEN** validation refuses the delete

#### Scenario: Link the same pair again after retraction
- **WHEN** the author links the same parent and child after their earlier relationship was retracted
- **THEN** a new Relationship is recorded and returned as live
- **AND** the earlier relationship and its retraction remain in history

### Requirement: Retraction confirmation identifies people who become disconnected
Before retracting a relationship, the interface SHALL identify every person who will leave Me's connected component as a result. If nobody will leave Me's component, it SHALL show a plain confirmation. No person outside the affected set SHALL be named as becoming disconnected.

#### Scenario: Retraction disconnects people from Me
- **WHEN** retracting a relationship would disconnect people from Me
- **THEN** the confirmation names every person who will be shown outside Me's connected component
- **AND** it names nobody else as becoming disconnected

#### Scenario: Retraction does not disconnect people from Me
- **WHEN** retracting a relationship leaves all people in Me's connected component
- **THEN** the interface asks for a plain confirmation without a disconnection list

#### Scenario: Open a relationship retraction confirmation
- **WHEN** the author opens a person's menu for a live relationship
- **THEN** the menu offers “Remove link to X” for the other person
- **AND** choosing it opens the applicable confirmation before any retraction occurs

### Requirement: People outside Me's component remain visible
After a relationship is retracted, people outside Me's connected component SHALL remain visible with their remaining live relationships, in floating groups marked “not connected to you.” The interface SHALL describe the operation as a retraction and SHALL NOT claim that people or relationship history were erased.

#### Scenario: A disconnected set remains visible
- **WHEN** a confirmed retraction leaves people outside Me's connected component
- **THEN** those people and their remaining live relationships are still shown in floating groups marked “not connected to you”
- **AND** the interface states that the relationship was retracted and its history remains
