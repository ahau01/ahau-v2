# Spec Delta

## REMOVED Requirements

### Requirement: Sections without designed data show an honest empty state
**Reason**: Whakapapa now has a designed tree view, so the empty-state requirement must no longer apply to it.
**Migration**: Archive and the tribe list retain their existing empty states under the narrower requirement below.

### Requirement: Empty sections make no Holochain calls
**Reason**: Whakapapa now reads the author's private tree and may save new relatives.
**Migration**: Archive and the tribe list retain their no-call behavior under the narrower requirement below.

## ADDED Requirements

### Requirement: Archive and the tribe list show honest empty states
Archive and the tribe list SHALL each show an empty state saying the section is still to come. They SHALL NOT suggest the person has no data there, that something failed, or offer actions that do nothing.

#### Scenario: Archive is coming
- **WHEN** the person opens `#/me/archive`
- **THEN** the page has an Archive heading and says the archive is still to come
- **AND** it shows no error, no "add" or "import" control, and no sample items

#### Scenario: Tribe list is coming
- **WHEN** the person opens `#/tribes`
- **THEN** the page says tribes are still to come and shows no tribes and no create or join control

### Requirement: Empty Archive and tribe list make no Holochain calls
Opening Archive or the tribe list SHALL NOT call Holochain.

#### Scenario: Opening an empty section
- **WHEN** the person opens `#/me/archive`
- **THEN** no zome call is made

#### Scenario: Opening the tribe list
- **WHEN** the person opens `#/tribes`
- **THEN** no zome call is made
