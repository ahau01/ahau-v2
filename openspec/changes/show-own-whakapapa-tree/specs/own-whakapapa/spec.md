# Spec Delta

## Purpose

Presents the author's own account of parent-child relationships as a tree and lets them add name-only relatives to that account.

## ADDED Requirements

### Requirement: The author's tree shows connected and floating people
The Whakapapa page SHALL show Me's connected tree and any other stored people and relationships in separate visible groups identified as not connected to you.

#### Scenario: People outside Me's tree remain visible
- **WHEN** stored relatives have no live path to Me
- **THEN** they and their live relationships remain visible in a separate group marked "Not connected to you"

#### Scenario: Invalid or repeated relationships do not hide the rest of the tree
- **WHEN** stored data contains a dangling reference, duplicate relationship, or cycle
- **THEN** the page omits the invalid or repeated relationship and still shows the remaining people and valid relationships

### Requirement: The tree is navigable and accessible
The tree SHALL present people in generation reading order, provide each person with a menu for actions about that person, and mark relationship lines as decorative for assistive technology.

#### Scenario: Reading the tree
- **WHEN** a person uses the tree with a screen reader
- **THEN** each person is available as a button in generation order and relationship lines are hidden from the accessibility tree

#### Scenario: Narrow viewport
- **WHEN** the tree is wider than the available screen
- **THEN** the tree can be scrolled within its own container

### Requirement: A person can add a name-only parent or child
The person SHALL be able to add a name-only relative as a parent or child of Me or an existing relative.

#### Scenario: Add a parent of a person
- **WHEN** the person chooses "Add parent" from a person's menu and submits a name
- **THEN** the new relative and parent-child relationship are saved through the whakapapa feature client and shown in the tree

#### Scenario: Add a child of a person
- **WHEN** the person chooses "Add child" from a person's menu and submits a name
- **THEN** the new relative and parent-child relationship are saved through the whakapapa feature client and shown in the tree

#### Scenario: A save is refused
- **WHEN** the storage operation refuses an add
- **THEN** the tree does not show an unsaved person and the person receives an explanation

### Requirement: The Whakapapa page explains privacy and authorship accurately
The Whakapapa page SHALL explain that names and relationships are private contents on the author's chain, while other peers can see that the agent authored Relative or Relationship actions and when.

#### Scenario: Privacy explanation
- **WHEN** the person views their Whakapapa page
- **THEN** the explanation states that contents stay on their chain and that peers can see authorship and timing of the actions

### Requirement: Adding a relative is supported for one person's account
The page SHALL present whakapapa as the author's account and SHALL NOT describe relatives or relationships as universal or biological truth.

#### Scenario: Account is not presented as canonical truth
- **WHEN** the person views the tree and its add flow
- **THEN** the language describes their own account of relationships without claiming universal or biological truth
