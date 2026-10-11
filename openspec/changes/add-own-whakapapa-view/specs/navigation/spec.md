# Spec Delta

Whakapapa stops being a section whose data isn't designed yet, so the two
requirements that grouped it with Archive and the tribe list are replaced by
narrower ones that cover only those two. Replaced rather than modified
because the Whakapapa scenario in each is not being reworded — it is gone,
and what `#/me/whakapapa` shows is now the `own-whakapapa` capability's.

## REMOVED Requirements

### Requirement: Sections without designed data show an honest empty state
**Reason**: It covered Archive, Whakapapa and the tribe list together, with a scenario requiring `#/me/whakapapa` to say whakapapa is still to come. This change builds that page, so the scenario must go rather than be reworded. Replaced by "Sections still to come show an honest empty state", which keeps the same promise for Archive and the tribe list; Whakapapa's own empty state is in the `own-whakapapa` spec.
**Migration**: No data or address changes. `#/me/whakapapa` shows the person's whakapapa, or its own empty state when they have asserted nothing. `#/me/archive` and `#/tribes` are unchanged.

### Requirement: Empty sections make no Holochain calls
**Reason**: Whakapapa now reads this agent's own source chain, so the ban on zome calls can no longer cover it. Replaced by "Sections still to come make no Holochain calls", which keeps the ban for Archive and the tribe list.
**Migration**: None. Opening `#/me/whakapapa` now makes a zome call; opening `#/me/archive` or `#/tribes` still makes none.

## ADDED Requirements

### Requirement: Sections still to come show an honest empty state
Archive and the tribe list SHALL each show an empty state saying the section is still to come. It SHALL NOT suggest the person has no data there, that something failed, or offer actions that do nothing.

#### Scenario: Archive is coming
- **WHEN** the person opens `#/me/archive`
- **THEN** the page has an Archive heading and says the archive is still to come
- **AND** it shows no error, no "add" or "import" control, and no sample stories

#### Scenario: Tribe list is coming
- **WHEN** the person opens `#/tribes`
- **THEN** the page says tribes are still to come and shows no tribes and no create or join control

#### Scenario: Whakapapa is not one of them
- **WHEN** the person opens `#/me/whakapapa`
- **THEN** the page does not say whakapapa is still to come

### Requirement: Sections still to come make no Holochain calls
Opening Archive or the tribe list SHALL NOT call Holochain.

#### Scenario: Opening a section still to come
- **WHEN** the person opens `#/me/archive`
- **THEN** no zome call is made
