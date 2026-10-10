# Own-Profile Specification

## Purpose

A person viewing their own profile in Āhau: their own account of themselves (ADR-0008). It shows the public part and the private part separately, and says truthfully who can see each one.

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

### Requirement: No editing in this page
The page SHALL NOT offer to edit the profile, change the header image or change the avatar.

#### Scenario: No edit control
- **WHEN** the person's profile is shown
- **THEN** there is no edit, header-image or photo control

### Requirement: Avatar follows the chosen gender
The person's avatar, on this page and in the shell, SHALL be the silhouette for the gender they chose, or a neutral one when they chose none, "other" or "unknown".

#### Scenario: Avatar for wahine
- **WHEN** the person chose "female" as their gender
- **THEN** their avatar is the wahine silhouette in the top bar, side nav and launch screen
