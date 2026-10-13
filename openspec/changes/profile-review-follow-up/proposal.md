# Proposal

## Why

PR #85 added profile editing and tells people that edits add versions, but its conductor tests do not directly prove that earlier versions remain on the source chain or that clearing a contact field leaves its earlier value in history. The edit client also reports an update as `created`, and the callbacks between the app and profile page obscure which one writes and which one updates local state.

## What Changes

- Add conductor-backed assertions that successive profile edits preserve all earlier versions, and that clearing personal information removes it from the latest version while retaining the earlier version that held it.
- Give a successful profile update its own `updated` result status, distinct from profile creation.
- Rename the profile-page callbacks to make the write request and the post-save local profile update clear at each layer.
- Defer choosing another agent's profile version by `action_seq` until tribe and group creation provides the profile-viewing context. The wording in issue #47 describes that future work and is not part of this change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `own-profile`: A successful edit is reported as an update, while the existing history-preservation requirements remain covered by direct conductor assertions.

## Impact

Changes are limited to profile client result types and implementations, app-to-profile-page callback names, related tests, and Sweettest coverage for version history. There are no changes to entry shapes, integrity validation, visibility, or access. The public profile remains public and personal information remains private. This follows the review of [PR #85](https://github.com/ahau01/ahau-v2/pull/85#issuecomment-6136280483); selecting another agent's version is deferred to the later tribe and group work.
