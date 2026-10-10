# Spec Delta

## Purpose

How a person moves around Āhau once they are in. Covers the spaces they can switch between, the sections inside their own space, the address of each page, and how pages whose data isn't designed yet are shown. Navigation assumes no group model and no central authority.

## ADDED Requirements

### Requirement: Landing page
On going in from the launch screen, the shell SHALL show the person's own profile at the address `#/me/profile`.

#### Scenario: Going in lands on your profile
- **WHEN** the person activates their avatar on the launch screen
- **THEN** the address is `#/me/profile` and their own profile is shown

### Requirement: Your own space is not a group
Pages about the person's own space SHALL sit under `#/me/`. Their addresses SHALL NOT contain a group, tribe or agent id.

#### Scenario: Your space's addresses
- **WHEN** the person visits each section of their own space
- **THEN** the addresses are `#/me/profile`, `#/me/archive` and `#/me/whakapapa`

### Requirement: Top bar chooses whose space
Every page after launch SHALL have a top bar with: an "Add tribes" control going to `#/tribes`, and the person's own avatar going to `#/me/profile`. The control for the page's space SHALL be marked current.

#### Scenario: Top bar on your profile
- **WHEN** the person is on `#/me/profile`
- **THEN** the top bar shows "Add tribes" and their avatar, with their avatar marked as the current space

#### Scenario: From the tribe list back to yourself
- **WHEN** the person is on `#/tribes` and activates their avatar in the top bar
- **THEN** they are on `#/me/profile`

### Requirement: Top bar shows nothing out of scope
The top bar SHALL NOT show a notifications bell, a help button, or avatars for tribes.

#### Scenario: No tribe avatars before tribes exist
- **WHEN** any page after launch is shown
- **THEN** the top bar has no notifications, help or tribe controls

### Requirement: Side nav chooses a section of your space
Pages under `#/me/` SHALL have a side nav with the person's avatar, then Profile, Archive and Whakapapa in that order. The item for the current page SHALL be marked current. The tribe list SHALL NOT have this side nav.

#### Scenario: Moving between sections
- **WHEN** the person is on `#/me/profile` and activates Whakapapa in the side nav
- **THEN** they are on `#/me/whakapapa` and Whakapapa is marked current

#### Scenario: Side nav lists no cut sections
- **WHEN** any page under `#/me/` is shown
- **THEN** the side nav has no Wallet or People item

### Requirement: Sections without designed data show an honest empty state
Archive, Whakapapa and the tribe list SHALL each show an empty state saying the section is still to come. It SHALL NOT suggest the person has no data there, that something failed, or offer actions that do nothing.

#### Scenario: Whakapapa is coming
- **WHEN** the person opens `#/me/whakapapa`
- **THEN** the page has a Whakapapa heading and says whakapapa is still to come
- **AND** it shows no error, no "add" or "import" control, and no sample people

#### Scenario: Tribe list is coming
- **WHEN** the person opens `#/tribes`
- **THEN** the page says tribes are still to come and shows no tribes and no create or join control

### Requirement: Empty sections make no Holochain calls
Opening Archive, Whakapapa or the tribe list SHALL NOT call Holochain.

#### Scenario: Opening an empty section
- **WHEN** the person opens `#/me/archive`
- **THEN** no zome call is made

### Requirement: Unknown addresses go to your profile
An address that names no page SHALL show the person's own profile and change the address to `#/me/profile`, so the back button doesn't return to it.

#### Scenario: Mistyped address
- **WHEN** the address is changed to `#/me/wallet` while the person is in
- **THEN** their own profile is shown and the address is `#/me/profile`

### Requirement: Back and forward follow the person's moves
Moving between pages SHALL add to the browser history, so back and forward retrace them.

#### Scenario: Back from Archive
- **WHEN** the person goes from their profile to Archive, then presses back
- **THEN** they are on `#/me/profile`

### Requirement: Focus moves to the new page
After moving to a page, keyboard focus SHALL be on that page's main heading, so screen-reader users hear where they are.

#### Scenario: Focus after navigating
- **WHEN** the person activates Archive in the side nav
- **THEN** focus is on the Archive page's heading
