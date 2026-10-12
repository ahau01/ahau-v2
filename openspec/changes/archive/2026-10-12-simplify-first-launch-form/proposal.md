# Proposal

## Why

The first-launch module's form conversion is harder to understand than its behavior warrants: `readForm` mixes validation with profile construction, and `readDate` encodes partial-date cases through a dense branch sequence. Separating those responsibilities will make future edits easier to reason about while retaining the behavior already covered by tests.

## What Changes

- Separate form validation and profile construction within the first-launch form conversion.
- Make the date-part rules easier to read while preserving accepted values and exact validation messages.
- Keep this as an internal refactor; form behavior, public interfaces, and profile data remain unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This is a pure refactor with no spec-level behavior change; `skip_specs: true` is set in `.openspec.yaml`.

## Impact

- `src/first-launch/first-launch.ts`: form validation, date parsing, and profile construction.
- `src/first-launch/first-launch.test.ts`: existing behavior coverage is the compatibility reference; implementation work should preserve those assertions.
