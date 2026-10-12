# Āhau v2

Āhau is a whakapapa app for whānau, hapū and iwi, being rebuilt on Holochain.
Its data can be personal, collective, culturally significant, sensitive or
contested. Treat data sovereignty, consent, privacy, provenance, context and
authority as design concerns. Preserve meaningful uncertainty; raise
unresolved decisions that affect people for human direction.

## Holochain

- Integrity zomes define entry and link types and deterministic, side-effect-free
  validation. Coordinator zomes expose app workflows.
- Source chains record authored actions. Updates and deletes add actions;
  DHT data propagates across peers and may be delayed or incomplete. Don't
  assume a globally current, mutable database view.
- Treat visibility and capability grants as part of data design; UI checks
  alone do not enforce access. Keep Holochain calls behind feature clients,
  following `src/profile/`.

See the official [zome](https://developer.holochain.org/build/zomes/),
[validation](https://developer.holochain.org/build/validation/) and
[entry](https://developer.holochain.org/build/entries/) guides.

## Code patterns

- Follow existing boundaries: integrity types, coordinator workflows, feature
  clients, plain TypeScript domain logic and Svelte presentation.
- Prefer domain types, narrow interfaces, cohesive functions and clear errors.
  Keep absent, unknown and empty values distinct when their meanings differ.
- Preserve compatibility with serialized data. Describe migrations or changes
  to data meaning in the OpenSpec design.
- Test at the relevant boundary; use conductor tests for Holochain validation,
  synchronization or access behavior.

## Project guidance

OpenSpec owns scope, requirements, design and tasks: `openspec/specs/` describes
current behavior and `openspec/changes/` holds active work. See
[docs/agents/openspec.md](docs/agents/openspec.md), [CONTEXT.md](CONTEXT.md) for
domain vocabulary, and [README.md](README.md) for setup and commands.
