# Spec Delta

## Purpose

A person viewing their own whakapapa in Āhau: the people and relationships they themselves have asserted, drawn as a tree from a focus ancestor. It holds one source's account, keeps the source of every part of it, and never treats a person, a relationship or a correction as a canonical fact about anyone.

## ADDED Requirements

### Requirement: Your whakapapa is built from your own active assertions
The whakapapa page at `#/me/whakapapa` SHALL show the people and relationships that the active assertions authored by this agent describe, and nothing else. An assertion is active when its source has not retracted it.

#### Scenario: Only this source's account
- **WHEN** the person's whakapapa is shown
- **THEN** every person and every relationship drawn comes from an assertion this agent authored, and none from an assertion authored by another agent

#### Scenario: A retracted assertion is not drawn
- **WHEN** this agent asserted `parent-of(Hine, Mere)` and later retracted that assertion
- **THEN** Mere is not drawn below Hine

### Requirement: The tree descends through asserted parent relationships
The tree SHALL draw each `parent-of` assertion as a descent from the parent to the child. A person whom two parents are separately asserted to be the child of SHALL be drawn below each of them, without one of those places being chosen as the real one.

#### Scenario: Three generations
- **WHEN** this agent asserts `parent-of(Hine, Mere)` and `parent-of(Mere, Tāne)`
- **THEN** the tree shows Hine, with Mere below her, and Tāne below Mere

#### Scenario: A person asserted as the child of two separate parents
- **WHEN** this agent asserts `parent-of(Hine, Mere)` and `parent-of(Rangi, Mere)`, and Hine and Rangi have no asserted relationship to each other
- **THEN** Mere is drawn below Hine and below Rangi, and the page does not mark either place as her real one

### Requirement: Partners and siblings are shown beside the person they relate to
The tree SHALL show each `partner-of` assertion as the two people beside each other, and each `sibling-of` assertion as the two people beside each other where no asserted shared parent already puts them there.

#### Scenario: Partners
- **WHEN** this agent asserts `partner-of(Hine, Rangi)`
- **THEN** Hine and Rangi are shown beside each other at the same generation

#### Scenario: A sibling with no asserted shared parent
- **WHEN** this agent asserts `sibling-of(Mere, Anaru)` and asserts no parent for either of them
- **THEN** Anaru is shown beside Mere

### Requirement: Each tree starts from a focus ancestor
A tree SHALL start from a focus ancestor: a person this source asserts no parent for. Where the source's active assertions have more than one such person, each SHALL start its own tree, and none SHALL be chosen over the others.

#### Scenario: The focus is the person with no asserted parent
- **WHEN** this agent asserts `parent-of(Hine, Mere)` and `parent-of(Mere, Tāne)`
- **THEN** the tree starts from Hine

#### Scenario: Two unconnected ancestors
- **WHEN** this agent's assertions describe two sets of people with no relationship asserted between them
- **THEN** both ancestors are shown, each starting its own tree, and neither is presented as the whakapapa's root

### Requirement: An honest empty state when there is no whakapapa
When this agent has no active assertions, the page SHALL show a Whakapapa heading and say that nothing has been added to their whakapapa yet. It SHALL NOT suggest that the person has no whakapapa, that something failed, or offer a control that does nothing.

#### Scenario: Nothing asserted yet
- **WHEN** a person who has asserted nothing opens `#/me/whakapapa`
- **THEN** the page has a Whakapapa heading and says nothing has been added yet
- **AND** it shows no error, no sample people, and no control that does nothing

### Requirement: A failed read is reported as a failure
When the whakapapa cannot be read, the page SHALL say that it could not be read, and SHALL NOT show the empty state or a part of the whakapapa as though it were all of it.

#### Scenario: Holochain cannot be reached
- **WHEN** the read fails
- **THEN** the page says the whakapapa could not be read
- **AND** it does not say that nothing has been added yet

### Requirement: Every person and relationship carries its source
What the page is given to draw SHALL name, for every person and every relationship in it, the source that asserted it. That source SHALL be the agent who authored the assertion, and SHALL NOT be a value an assertion can set for itself.

#### Scenario: The source comes with the data
- **WHEN** the whakapapa is read for this agent
- **THEN** each person and each relationship in the result names the agent who authored it, and none is returned without a source

#### Scenario: An assertion cannot claim another source
- **WHEN** an assertion is written that names an agent other than its author as its source
- **THEN** it is refused, so the source of a stored assertion is always its author

### Requirement: A person in a whakapapa is a source's description
A person in a whakapapa SHALL be one source's description of someone, and SHALL NOT be that person's own account of themselves, owned by them, or treated as their identity. Two sources describing the same human SHALL remain two separate descriptions.

#### Scenario: Two sources describe the same ancestor
- **WHEN** this agent describes an ancestor named Hine, and another agent separately describes an ancestor named Hine
- **THEN** both descriptions are kept, each with its own source, and neither is merged into, replaced by, or linked to the other

#### Scenario: Identity is never inferred from a name
- **WHEN** a person being described has the same name as an Āhau agent's profile
- **THEN** nothing joins the two, and the person is not shown as that agent

### Requirement: Conflicting accounts from two sources both survive
Where two sources assert relationships that cannot both be true of the same people, both assertions SHALL remain stored and readable with their own sources. Neither SHALL be overwritten, merged, or marked as the correct one.

#### Scenario: Two sources assert different parents
- **WHEN** this agent asserts `parent-of(Hine, Mere)` and another agent asserts `parent-of(Rangi, Mere)` about the same Mere
- **THEN** both assertions are still stored, each naming its own source
- **AND** this agent's page shows their own account, and the other source's assertion is unaffected by it

### Requirement: Yourself in your whakapapa comes from your own profile
Where an assertion names the person whose agent key this is, the details shown for them SHALL come from that agent's current profile, read when the whakapapa is read, so that a later profile edit shows through without a second copy being kept. This SHALL apply only to that agent's own profile.

#### Scenario: A profile edit shows through
- **WHEN** the person is in their own whakapapa, and they then change their name in their profile
- **THEN** the whakapapa shows the new name, with no separate copy to update

#### Scenario: Other people are not taken from profiles
- **WHEN** a person in the whakapapa is not this agent
- **THEN** their details come only from the description this source wrote, and no profile is read for them

### Requirement: Your personal information is never in your whakapapa
The details shown for any person in a whakapapa SHALL exclude every Personal information field (email, phone, address, postcode, city and country), including for the agent's own self.

#### Scenario: Contact details stay out
- **WHEN** this agent's profile holds an email and a phone number, and they are in their own whakapapa
- **THEN** no email, phone, address, postcode, city or country appears in the whakapapa

### Requirement: A correction is a retraction, and the original record stays
A source SHALL correct its own assertion by appending a retraction that names the assertion it retracts, and may append a replacement assertion. The retracted assertion SHALL remain on the record. No assertion SHALL be changed in place or removed.

#### Scenario: Correcting a parent
- **WHEN** this agent asserted `parent-of(Hine, Mere)`, then retracted it and asserted `parent-of(Rangi, Mere)`
- **THEN** the tree shows Mere below Rangi and not below Hine
- **AND** the retracted assertion and its retraction are both still on this agent's record

#### Scenario: An assertion cannot be rewritten
- **WHEN** a change to a stored assertion's people or kind is attempted
- **THEN** it is refused, so a correction can only be a new retraction and a new assertion

### Requirement: A retraction binds only the source that made it
A retraction SHALL affect only the projection of the source that authored it. A retraction of one source's assertion SHALL NOT be accepted from another source, and SHALL NOT remove any other source's assertion from their account.

#### Scenario: Retracting someone else's assertion is refused
- **WHEN** an agent writes a retraction naming an assertion another agent authored
- **THEN** it is refused

#### Scenario: Another source's account is untouched
- **WHEN** this agent retracts their own `parent-of(Hine, Mere)` assertion, and another agent has separately asserted the same relationship
- **THEN** the other agent's assertion is still active in their own account

### Requirement: Your whakapapa is read from your own source chain
Reading this agent's whakapapa SHALL use only entries on that agent's own source chain, so the page does not wait on, or vary with, what the DHT holds or which peers are reachable.

#### Scenario: Reading with no peers
- **WHEN** the person opens `#/me/whakapapa` with no other peer reachable
- **THEN** their whakapapa is shown in full

### Requirement: Your whakapapa is unreadable to other agents
This agent's whakapapa entries SHALL be kept so that no other agent can read them, whether by asking the network, by holding a copy from an earlier sync, or by calling the zome outside the app.

#### Scenario: Another agent asks Holochain directly
- **WHEN** another agent on the same network asks Holochain for this agent's whakapapa entries
- **THEN** it gets none of them, and none has been published for it to have cached

### Requirement: No creating or changing whakapapa in this view
The page SHALL NOT offer to add, edit, remove, import, export, share or submit for review any person or relationship, and SHALL NOT offer to create or name a whakapapa record.

#### Scenario: No controls that write
- **WHEN** the person's whakapapa is shown, whether empty or full
- **THEN** there is no add, edit, remove, import, export, share, submit, or new-whakapapa control

### Requirement: The walk always ends
Reading a whakapapa SHALL end in bounded time whatever the stored assertions describe, including assertions that form a cycle or a descent deeper than the walk allows. Where a walk stops short, the page SHALL say so rather than present the part it has as the whole whakapapa.

#### Scenario: Assertions that form a cycle
- **WHEN** the stored assertions say `parent-of(A, B)` and `parent-of(B, A)`
- **THEN** reading the whakapapa ends, and neither person is drawn endlessly

#### Scenario: A descent deeper than the walk allows
- **WHEN** the stored assertions describe a descent deeper than the walk's limit
- **THEN** the page shows what was walked and says the whakapapa goes further than is shown
