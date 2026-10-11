# Design

## Context

See [proposal.md](proposal.md) for the motivation and scope. The form adapter lives beside the first-launch state machine in `src/first-launch/first-launch.ts`. Its current callers rely on a single result that either contains a normalized `NewProfile` or all field errors.

The existing unit tests pin the form contract: whitespace is trimmed, empty optional fields are omitted, invalid name/birth-order/date values are reported together, and partial dates retain their specific messages. No relationship, sync, access-control, or identity behavior is involved.

## Goals / Non-Goals

**Goals:**

- Give validation and profile construction distinct responsibilities while preserving the caller's current success/error result.
- Make the date combinations and their messages easier to verify against the existing tests.
- Keep the refactor local to the first-launch form adapter.

**Non-Goals:**

- Change the form fields, saved profile shape, validation messages, or accepted partial dates.
- Move Holochain validation rules or alter the profile client API.
- Change launch state transitions or Svelte form behavior.

## Decisions

### Validate once, then construct the profile

Keep `readForm` as the adapter entry point, but have it delegate to focused validation and construction helpers. Validation will normalize and inspect the required values, including the date result, and collect all current errors before returning. Construction will only run for a validated form and will retain the existing trimming and omission rules for optional text, lists, and personal information.

This keeps the form-specific mapping out of the launch state machine's `submit` flow without introducing a new module or public interface. Moving the code into `profile/client.ts` would mix UI form strings and form error messages into the client boundary, which accepts normalized `NewProfile` values.

### Express date cases by named parts

Keep date parsing in the same form adapter and make the year/month/day presence cases explicit and locally readable. Preserve these outcomes:

| Year | Month | Day | Result |
|---|---|---|---|
| empty | empty | empty | no date |
| set | empty | empty | year |
| set | set | empty | year-month |
| set | set | set | full date |
| set | empty | set | “Please specify a month” |
| empty | set | set | “Please specify a year” |
| empty | empty | set | “Please specify a year and month” |
| empty | set | empty | “Please specify a year” |

Prefer readable checks over encoding the combinations as opaque bit masks or positional string keys. The existing tests remain the compatibility reference.

## Risks / Trade-offs

- [A helper boundary can add indirection without reducing the mental work] → Keep helpers private and named for validation/construction responsibilities; avoid splitting individual field assignments into one-line helpers.
- [Date cleanup could accidentally change a partial-date message] → Preserve the full existing combination table and assert the existing outcomes during implementation review.

## Migration Plan

No data migration or rollout step is needed. The refactor changes only client-side form conversion and retains its input and output types.
