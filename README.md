# Āhau v2

A rebuild of Āhau, the whakapapa app, on [Holochain](https://www.holochain.org/).

The original Āhau runs on Secure Scuttlebutt (SSB). Its plugins are no longer
maintained, and small features had started needing big fixes underneath
([ADR-0002](docs/adr/0002-rewrite-instead-of-continuing-to-patch-ssb-architecture.md)).
Āhau v2 rebuilds the app so it does what people need, in the way that suits
Holochain, rather than copying how the old app did things
([ADR-0006](docs/adr/0006-capability-driven-redesign-not-behaviour-replication.md)).

## Status

- **Done:** a Svelte app shell, plus a typed record of everything the old app's
  data layer could do (see "What's in this repo").
- **Next:** list what people actually do with Āhau ([#13](https://github.com/ahau01/ahau-v2/issues/13)),
  and build the first feature on Holochain — group permissions
  ([ADR-0003](docs/adr/0003-holochain-as-leg-2-protocol-candidate.md)).
- **Not started:** any Holochain code.

## What stays the same

Whatever the backend, Āhau keeps these rules (full detail in [CLAUDE.md](CLAUDE.md)):

1. **No single "true" version.** People can hold different accounts of the same
   relationship. All are kept; none wins automatically.
2. **Relationships come from someone.** Each one is recorded as "this person
   says this relationship exists", not as a plain line between two people.
3. **No central server.** No one machine holds the master copy.
4. **Identity is a key, not a login.** No email/password or sessions.

## What's in this repo

| Path | What it is |
|---|---|
| `src/app/` | The Svelte app shell. Runs today against fake in-memory data. |
| `src/contract/` | **Reference only.** A typed list of the 69 actions the old SSB app's data layer supported. Used as a checklist so nothing gets lost in the rebuild; new code doesn't have to match it. |
| `src/fixtures/` | The fake in-memory backend the shell runs on for now. |
| `src/conformance/` | Tests written against the contract. The ones about the rules above will move to Holochain tests. |
| `contract-source/` | The review of the old app's data functions the contract was built from. |
| `docs/` | Decisions, plans and history. Start at [docs/INDEX.md](docs/INDEX.md). |

## Setup

Requires Node 20 (see `.nvmrc`).

```bash
npm install
npm run dev     # serve the app shell at http://localhost:5173
npm test        # build and run all tests
```

Other commands:

| Command | What it does |
|---|---|
| `npm run typecheck` | Typecheck the TypeScript |
| `npm run check:app` | Typecheck the Svelte app |
| `npm run build` | Compile to `dist/` |
| `npm run build:app` | Build the app shell for production |
| `npm run check:coverage` | Check the contract still matches the old app review |
| `npm run check:manifest` | Check the contract's generated manifest is up to date |

## Where to start reading

- [CLAUDE.md](CLAUDE.md) — the rules above, and how to work in this repo (including with AI tools)
- [docs/adr/](docs/adr/) — the decisions that got us here, in order
- [docs/contract-decisions.md](docs/contract-decisions.md) — lessons from the contract that still apply on Holochain (e.g. removing something is a "retraction", not a delete)
- [docs/history/](docs/history/) — background on the original Āhau

## Licence

Not yet decided. The original Āhau is AGPL-3.0 under Āhau Ltd.; ownership and
licensing of this rebuild are still open (see
`docs/prds/ahau-v2-repo-foundation.prd.md`).
