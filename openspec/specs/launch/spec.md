# Launch Specification

## Purpose

What a person sees when Āhau opens, before they are in. Covers starting, failing to start, the welcome for an agent with no profile, and the avatar step for an agent that has one. There is no login: "you" is the agent key on this device.

## Requirements

### Requirement: Avatar step for an agent with a profile
When Āhau opens and this agent already has a profile, the launch screen SHALL show that person's avatar and name as a single control, and SHALL NOT show the shell until they activate it.

#### Scenario: Returning person sees their avatar and name
- **WHEN** Āhau opens and the agent on this device has a profile named "Mere"
- **THEN** the launch screen shows Mere's avatar and the name "Mere"
- **AND** neither the top bar nor any page of the shell is shown

#### Scenario: Activating the avatar goes in
- **WHEN** the person activates their avatar on the launch screen, by pointer or keyboard
- **THEN** they land on their own profile

### Requirement: Avatar step after creating a profile
After a person saves a new profile, the launch screen SHALL show the avatar step for that profile, rather than going straight in.

#### Scenario: New profile leads to the avatar step
- **WHEN** a person on a new device saves a profile named "Mere"
- **THEN** the create-profile form closes and the launch screen shows Mere's avatar and name
- **AND** activating it lands them on their own profile

### Requirement: Avatar step on every launch
The avatar step SHALL appear every time Āhau opens for an agent with a profile, including a page reload, whatever route the address holds.

#### Scenario: Reload shows the avatar step again
- **WHEN** a person who is on their Whakapapa page reloads Āhau
- **THEN** the launch screen shows their avatar step
- **AND** activating it lands them on their own profile, not the page they were on

### Requirement: The avatar step is not a login
The avatar step SHALL record nothing, ask for no secret, and change nothing about what the agent can do. Its only effect SHALL be to move the screen from launch into the shell.

#### Scenario: Nothing is written when going in
- **WHEN** a person activates their avatar on the launch screen
- **THEN** no entry is written to Holochain and nothing is stored on the device

#### Scenario: No password, no account
- **WHEN** the avatar step is shown
- **THEN** it offers no password, code, account or "sign out" control

### Requirement: Uncertain profile is a startup failure
If Āhau cannot tell whether this agent has a profile, the launch screen SHALL report a failure to start, not the welcome and not the avatar step.

#### Scenario: Profile lookup fails
- **WHEN** Holochain is ready but asking for this agent's profile fails
- **THEN** the launch screen says Āhau couldn't start, with the reason, and offers "Try again"
