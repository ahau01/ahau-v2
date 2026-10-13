# Own-Profile Specification

## Purpose

A person viewing their own profile in Āhau: their own account of themselves. It shows the public part and the private part separately, and says truthfully who can see each one.

## Requirements

### Requirement: Your profile shows your own account
The profile page at `#/me/profile` SHALL show the profile this agent wrote about itself, with the person's name as the page's main heading. It SHALL show no account of them from any other source.

#### Scenario: Name as the heading
- **WHEN** the person whose profile is named "Mere" lands on their profile
- **THEN** the page's main heading is "Mere"

#### Scenario: Only the author's own account
- **WHEN** the person's profile is shown
- **THEN** every value on the page comes from the profile this agent wrote, and none from a profile another agent wrote

### Requirement: Two sections, public and private
The page SHALL show a Profile section and a separate Personal information section. Personal information SHALL hold exactly the contact details (email, phone, address, postcode, city, country). Profile SHALL hold the other fields.

#### Scenario: Fields in their sections
- **WHEN** the person filled in a profession of "Kaiako" and an email of "mere@example.com"
- **THEN** "Kaiako" is in the Profile section and "mere@example.com" is in the Personal information section

### Requirement: Each section says who can see it
The Profile section SHALL be labelled "Anyone using Āhau can see this." The Personal information section SHALL be labelled "Only you can see this." Each label SHALL be next to its section's heading.

#### Scenario: Labels on the page
- **WHEN** the person's profile is shown
- **THEN** the Profile section reads "Anyone using Āhau can see this."
- **AND** the Personal information section reads "Only you can see this."

### Requirement: Labels match where the data is kept
The "Only you can see this." label SHALL only cover information kept as a private entry on the agent's own source chain. The page SHALL NOT fetch anything from other agents to show it.

#### Scenario: Personal information stays private
- **WHEN** another agent on the same network asks Holochain for this person's data
- **THEN** it can get the Profile fields and cannot get any Personal information field

### Requirement: Filled-in fields are shown, blank ones left out
The page SHALL show every field the person filled in, including each "Also known as" name, skill and place of education. Fields left blank SHALL NOT appear.

#### Scenario: Only what was given
- **WHEN** the person's profile has a name, a place of birth and two skills, and nothing else
- **THEN** the page shows the name, the place of birth and both skills, and no other field labels in the Profile section

#### Scenario: A partial date of birth
- **WHEN** the person gave only a year of birth, "1952"
- **THEN** the page shows 1952 as their date of birth, without a made-up day or month

### Requirement: A section with nothing in it stays visible
A section with no filled-in fields SHALL still show its heading and its label, and SHALL say nothing has been added.

#### Scenario: No personal information
- **WHEN** the person filled in no contact details
- **THEN** the Personal information section still shows with "Only you can see this." and says nothing has been added

### Requirement: Avatar follows the chosen gender
The person's avatar, on this page and in the shell, SHALL be the silhouette for the gender they chose, or a neutral one when they chose none, "other" or "unknown".

#### Scenario: Avatar for wahine
- **WHEN** the person chose "female" as their gender
- **THEN** their avatar is the wahine silhouette in the top bar, side nav and launch screen

### Requirement: The person can change their own profile
The profile page SHALL offer a control that opens a form for changing the
profile. The form SHALL open holding the values the person last saved, so
changing one field does not require retyping the others. Blank fields SHALL
open blank.

#### Scenario: The form opens with what was saved
- **WHEN** a person whose profile has the name "Mere", a profession of "Kaiako" and no place of birth opens the form
- **THEN** the name field holds "Mere" and the profession field holds "Kaiako"
- **AND** the place-of-birth field is blank

#### Scenario: A date known only to the year
- **WHEN** a person who gave only a year of birth, "1952", opens the form
- **THEN** the year shows 1952 and the day and month are unset
- **AND** saving without touching the date leaves their date of birth as "1952"

#### Scenario: A date with unknown digits
- **WHEN** a person whose date of birth is "192X" opens the form
- **THEN** the year shows "192X"
- **AND** saving without touching the date leaves their date of birth as "192X"

#### Scenario: Leaving without saving changes nothing
- **WHEN** the person types a new name and then cancels
- **THEN** their profile is unchanged
- **AND** no new version of it has been written

### Requirement: Both sections are changed together
The form SHALL hold the Profile fields and the Personal information fields
together, and one save SHALL write both or neither. A save SHALL NOT leave
the public part changed and the private part unchanged, or the reverse.

#### Scenario: One save, both sections
- **WHEN** the person changes their profession to "Kaiako" and their email to "mere@example.com" and saves once
- **THEN** their profile shows "Kaiako" and "mere@example.com"

#### Scenario: A refused save changes neither
- **WHEN** a save is refused
- **THEN** neither the Profile fields nor the Personal information fields have changed from what was last saved

### Requirement: Personal information can be added later
A person whose profile has no personal information SHALL be able to add it
by changing their profile, without being refused and without having to make
a new profile.

#### Scenario: First email on a profile that had none
- **WHEN** a person whose profile holds no personal information enters an email and saves
- **THEN** the save succeeds
- **AND** their Personal information section shows that email

### Requirement: Changing a profile adds a version and erases nothing
A change SHALL add a new version of the profile rather than replace it.
Earlier versions SHALL remain. The page SHALL show the version the person
wrote most recently. Clearing a field SHALL leave it out of the new version
without removing it from earlier ones.

#### Scenario: The page shows the newest version
- **WHEN** a person whose name was "Mere Rngi" changes it to "Mere Rangi"
- **THEN** their profile page shows "Mere Rangi"

#### Scenario: An earlier version is still on the chain
- **WHEN** a person has changed their profile twice
- **THEN** all three versions are on their source chain
- **AND** none has been rewritten or removed

#### Scenario: A cleared field is absent from the new version only
- **WHEN** a person who had given an email clears it and saves
- **THEN** their Personal information section no longer shows an email
- **AND** the earlier version that holds it is still on their chain

### Requirement: The public section says changes add a version
Next to the Profile section's visibility label, the page SHALL say that
changes add a new version and that earlier versions stay on the network.
This SHALL be stated wherever the person is told the Profile section is
public, so the two facts are read together.

#### Scenario: The wording is on the page
- **WHEN** the person's profile is shown
- **THEN** the Profile section says that changes add a new version and earlier versions stay on the network

### Requirement: A refused save keeps what the person typed
When a save is refused, the form SHALL stay open holding everything the
person typed, and SHALL say why it was refused. A refusal SHALL NOT discard
their work or close the form.

#### Scenario: A name of only spaces
- **WHEN** the person clears their name to spaces and saves
- **THEN** the form stays open, says a name is needed, and still holds everything else they typed

#### Scenario: Holochain refuses the save
- **WHEN** the save is refused by Holochain
- **THEN** the form stays open holding what they typed, and shows the reason given

### Requirement: Only the author can change a profile
A profile SHALL only be changeable by the agent that wrote it, and this
SHALL be enforced where the data is validated rather than only in the
screen. An attempt by any other agent SHALL be refused when stored and
SHALL be refused by every authority that holds the profile, not only on
read.

#### Scenario: Another agent's change is refused at storage
- **WHEN** an agent that did not author a profile tries to write a change to it, bypassing the app
- **THEN** the change is refused with the reason that only the author of a profile can change it
- **AND** the profile keeps the version its author wrote

#### Scenario: Two accounts of one person coexist rather than collide
- **WHEN** two agents each write their own profile about themselves
- **THEN** each profile is changeable only by the agent that wrote it
- **AND** neither agent's changes alter the other's profile

### Requirement: A change points at the profile's first version
Every change to a profile SHALL point at that profile's first version, not
at a later one, so all versions hang off one place and none can be orphaned.
A change pointing anywhere else SHALL be refused.

#### Scenario: A second change still points at the first version
- **WHEN** a person changes their profile and then changes it again
- **THEN** both changes point at the profile's first version

#### Scenario: A change pointing at an earlier change is refused
- **WHEN** a change is written pointing at an earlier change rather than the first version, bypassing the app
- **THEN** it is refused with the reason that changes must point at the profile's first version

### Requirement: The shell follows a saved change
Where the person's name or chosen gender is shown outside the profile page
— their avatar and the page heading — it SHALL show the saved change
without the person reloading the app.

#### Scenario: A new name in the heading
- **WHEN** the person changes their name from "Mere" to "Mere Rangi" and saves
- **THEN** the profile page heading reads "Mere Rangi"

#### Scenario: A new gender in the avatar
- **WHEN** the person changes their chosen gender to "female" and saves
- **THEN** their avatar is the wahine silhouette on the profile page and in the shell around it

### Requirement: No header image or photo control
The page and the form SHALL NOT offer to change the header image or the
profile photo.

#### Scenario: No header-image or photo control
- **WHEN** the person's profile is shown, or the form for changing it is open
- **THEN** there is no working header-image or photo control
