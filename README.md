# Āhau v2

A rebuild of Āhau, the whakapapa app, on [Holochain](https://www.holochain.org/).

The original Āhau runs on Secure Scuttlebutt (SSB). Its plugins are no longer
maintained, and small features had started needing big fixes underneath
([ADR-0002](docs/adr/0002-rewrite-instead-of-continuing-to-patch-ssb-architecture.md)).
Āhau v2 rebuilds the app so it does what people need, in the way that suits
Holochain, rather than copying how the old app did things
([ADR-0006](docs/adr/0006-capability-driven-redesign-not-behaviour-replication.md)).

## Status

- **Done:** first launch on Holochain ([#14](https://github.com/ahau01/ahau-v2/issues/14)).
  A new person sees a launch screen, creates their profile, and it is saved
  to Holochain under their agent key. Next time they go straight in. Also a
  typed record of everything the old app's data layer could do (see "What's
  in this repo").
- **Next:** group permissions on Holochain
  ([ADR-0003](docs/adr/0003-holochain-as-leg-2-protocol-candidate.md),
  [plan](docs/plans/group-permissions.md)) — and listing what people actually
  do with Āhau ([#13](https://github.com/ahau01/ahau-v2/issues/13)).

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
| `src/app/` | The Svelte app: the first-launch screens. In dev it runs against the local conductor, or a pretend client with `?pretend`. |
| `src/first-launch/` | Which first-launch screen to show, in plain TypeScript, tested without Svelte or Holochain. |
| `src/contract/` | **Reference only.** A typed list of the 69 actions the old SSB app's data layer supported. Used as a checklist so nothing gets lost in the rebuild; new code doesn't have to match it. |
| `src/fixtures/` | The fake in-memory backend behind the frozen contract's tests. The app no longer uses it. |
| `src/profile/` | The profile client module: the only code that talks to Holochain about profiles. Also the dev-only connection to the local conductor, and a pretend client for running the app without Holochain. |
| `dnas/ahau/` | The Holochain DNA, with the profiles zome: the rules for who can write a profile (`zomes/integrity/`) and the functions the app calls (`zomes/coordinator/`). |
| `workdir/` | The hApp manifest that bundles the DNA. |
| `flake.nix`, `flake.lock` | The pinned Holochain dev environment. |
| `src/conformance/` | Tests written against the contract. The ones about the rules above will move to Holochain tests. |
| `contract-source/` | The review of the old app's data functions the contract was built from. |
| `docs/` | Decisions, plans and history. Start at [docs/INDEX.md](docs/INDEX.md). |

## Setup

Requires Node 20 (see `.nvmrc`).

```bash
npm install
npm run dev     # serve the app at http://localhost:5173
npm test        # build and run all tests
```

`npm run dev` connects to the local conductor from `npm run conductor` (see
[Demo: first launch on Holochain](#demo-first-launch-on-holochain)). Without
Holochain, open http://localhost:5173/?pretend to run against a pretend profile
client kept in the browser's localStorage: create a profile, then reload to see
a returning person go straight in. Clear site data to start over.
`?pretend=fail-start` or `?pretend=fail-save` shows the failure screens.

Other commands:

| Command | What it does |
|---|---|
| `npm run typecheck` | Typecheck the TypeScript |
| `npm run check:app` | Typecheck the Svelte app |
| `npm run build` | Compile to `dist/` |
| `npm run build:app` | Build the app for production |
| `npm run check:coverage` | Check the contract still matches the old app review |
| `npm run check:manifest` | Check the contract's generated manifest is up to date |

### Holochain

The Holochain tools (`holochain`, `hc`, `lair-keystore`, Rust) come from
[Holonix](https://developer.holochain.org/get-started/), pinned in
`flake.lock` to Holochain 0.6. You only need this for the Holochain commands
below; `npm test` and `npm run dev` with `?pretend` work without it.

1. Install Nix with Holochain's package cache. Run this **once** per machine,
   then open a new terminal:

   ```bash
   bash <(curl https://holochain.github.io/holochain/setup.sh)
   ```

2. From the repo root, enter the dev shell (the first run downloads a lot):

   ```bash
   nix develop
   holochain --version   # holochain 0.6.x
   ```

   The dev shell loads your `.bashrc`, so your prompt can look exactly as it
   did before. To check you're in it, run `echo $IN_NIX_SHELL`: it prints
   `impure` inside the dev shell and nothing outside. You can also skip the
   interactive shell and run one command in it, for example
   `nix develop -c npm run conductor`.

3. Inside the dev shell, using Node 20 from `.nvmrc` as above:

| Command | What it does |
|---|---|
| `npm run build:happ` | Pack the DNA and hApp into `workdir/ahau.happ` |
| `npm run test:conductor` | Run the tests against a real Holochain conductor |
| `npm run conductor` | Run a local dev conductor with the hApp: admin port 4444, apps connect on port 8888 |

4. To connect to the dev conductor from your own Node script, you need an app
   authentication token. It lets a local process reach the hApp. It is not a
   login, and identity stays the agent key. Keep `npm run conductor` running,
   then in a second terminal:

   ```bash
   node scripts/issue-app-token.mjs 4444   # prints the token as a JSON byte array
   ```

   The token is dev-only: it can be reused and doesn't expire. Restarting
   `npm run conductor` creates a new sandbox, so you need a new token. Zome
   calls also need signing credentials; `src/profile/dev-connection.ts` shows
   how the app gets both.

### Demo: first launch on Holochain

1. In the dev shell, start the conductor and leave it running. It is ready
   when it prints `Conductor launched`:

   ```bash
   npm run conductor
   ```

2. In a second terminal (the dev shell isn't needed), serve the app and open
   http://localhost:5173:

   ```bash
   npm run dev
   ```

3. You see the launch screen, then create profile. Enter a name and save to
   land in the app.
4. Reload the page: you go straight in, because this agent key already has a
   profile.
5. Stop the conductor and reload: you see the failed-to-start message. Start
   it again and reload to carry on. Restarting `npm run conductor` makes a new
   sandbox and a new agent, so you start from create profile again.

The dev server reaches the conductor's admin port (4444) and gives the page an
app token and a signing key that can only call the profile functions. The page
never gets admin access. Set `AHAU_ADMIN_PORT` if you run the conductor on
another admin port. This is for development only; a launcher does this job
outside dev.

## Where to start reading

- [CLAUDE.md](CLAUDE.md) — the rules above, and how to work in this repo (including with AI tools)
- [docs/adr/](docs/adr/) — the decisions that got us here, in order
- [docs/contract-decisions.md](docs/contract-decisions.md) — lessons from the contract that still apply on Holochain (e.g. removing something is a "retraction", not a delete)
- [docs/history/](docs/history/) — background on the original Āhau

## Licence

Not yet decided. The original Āhau is AGPL-3.0 under Āhau Ltd.; ownership and
licensing of this rebuild are still open (see
`docs/history/leg1/ahau-v2-repo-foundation.prd.md`).
