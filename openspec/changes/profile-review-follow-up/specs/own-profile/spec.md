# Spec Delta

## ADDED Requirements

### Requirement: Successful profile edits report an update
A successful edit of an existing profile SHALL return an update-specific
status and the saved profile, distinct from the result of creating a profile.

#### Scenario: An edit succeeds
- **WHEN** a profile update succeeds
- **THEN** the result has status `updated` and contains the saved profile
- **AND** a successful profile creation has status `created`
