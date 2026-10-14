# Proposal

## Why

The person's own space already has a Whakapapa destination, but it currently only says the section is still to come. Once private whakapapa storage is available, the person should be able to see and add to their own account of parent-child relationships while preserving disconnected relatives and being clear about privacy limits.

## What Changes

- Replace the `#/me/whakapapa` empty state with an SVG view of the author's own tree and name-only add-parent/add-child flows.
- Add plain TypeScript domain logic that builds a safe view from stored relatives and relationships and assigns basic layered coordinates, including visible floating groups for people outside Me's connected group.
- Keep Holochain access behind the whakapapa feature client and describe that entry contents stay on the author's chain while peers can observe authored actions and timing.
- Update the navigation contract so Whakapapa may load and show this tree; retain the focus-on-heading requirement and leave the tribe list's empty state and no-call behavior intact.
- Depend on `store-own-whakapapa` being implemented and merged before this change is applied.
- Later changes for renaming relatives, linking existing people, retracting relationships, and refining layout remain out of scope.

## Capabilities

### New Capabilities

- `own-whakapapa`: presenting and adding to the author's own tree from private stored whakapapa data.

### Modified Capabilities

- `navigation`: Whakapapa no longer has to show a still-to-come empty state or avoid Holochain calls; focus behavior and the tribe-list requirements remain.

## Impact

- Adds plain TypeScript tree-building and layout logic, with unit tests.
- Replaces `src/app/shell/WhakapapaPage.svelte` empty state with an accessible SVG tree and person menus, with component tests using a pretend client.
- Integrates the existing `src/whakapapa/` feature-client boundary into the app route; no Holochain imports are added under `src/app/`.
- Updates the navigation spec and adds a delta to the `own-whakapapa` capability. No new dependency is required.
