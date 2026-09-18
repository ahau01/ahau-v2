# Ahau — inherited codebase context index

Generated from a GitLab→GitHub migration export (61 repos, 1757 MRs, 84 issues, 48 still open) after a handover-less team split. This is a knowledge base, not documentation of current behavior — treat it as institutional memory: why things are the way they are, what was already tried, and what was never finished.

## How to use this as an LLM/agent

- Before touching a repo, read its `repos/<repo>.md` file. Open issues are listed first — they are unresolved problems nobody fixed before the split.
- Check `cross_cutting.md` for workarounds/breaking-change landmines that apply across repos before assuming legacy behavior is intentional.
- `data/records.jsonl` is the full machine-readable dataset (every MR/issue, tagged and — for the high-signal subset — summarized) for embedding/RAG use.

## Top-level apps & sites

| Repo | GitLab path | MRs | Issues | Open issues |
|---|---|---|---|---|
| [ahau-ahau](repos/ahau-ahau.md) | `ahau/ahau` | 975 | 42 | 20 |
| [ahau-docs.ahau.io](repos/ahau-docs.ahau.io.md) | `ahau/docs.ahau.io` | 37 | 2 | 1 |
| [ahau-pataka](repos/ahau-pataka.md) | `ahau/pataka` | 29 | 3 | 3 |
| [ahau-whakapapa-mobile](repos/ahau-whakapapa-mobile.md) | `ahau/whakapapa-mobile` | 11 | 2 | 1 |
| [ahau-website](repos/ahau-website.md) | `ahau/website` | 1 | 0 | 0 |

No MR/issue activity: `ahau-connect.ahau.io`

## Libraries (misc)

| Repo | GitLab path | MRs | Issues | Open issues |
|---|---|---|---|---|
| [ahau-lib-ssb-crut](repos/ahau-lib-ssb-crut.md) | `ahau/lib/ssb-crut` | 41 | 9 | 3 |
| [ahau-lib-ssb-keyring](repos/ahau-lib-ssb-keyring.md) | `ahau/lib/ssb-keyring` | 32 | 3 | 1 |
| [ahau-lib-artefact-store](repos/ahau-lib-artefact-store.md) | `ahau/lib/artefact-store` | 28 | 1 | 1 |
| [ahau-lib-ssb-crut-authors](repos/ahau-lib-ssb-crut-authors.md) | `ahau/lib/ssb-crut-authors` | 10 | 2 | 0 |
| [ahau-lib-pataka-cli](repos/ahau-lib-pataka-cli.md) | `ahau/lib/pataka-cli` | 7 | 2 | 1 |
| [ahau-lib-artefact-server](repos/ahau-lib-artefact-server.md) | `ahau/lib/artefact-server` | 6 | 0 | 0 |
| [ahau-lib-ahau-env](repos/ahau-lib-ahau-env.md) | `ahau/lib/ahau-env` | 4 | 0 | 0 |
| [ahau-lib-ssb-migrate](repos/ahau-lib-ssb-migrate.md) | `ahau/lib/ssb-migrate` | 3 | 0 | 0 |

No MR/issue activity: `ahau-lib-ahau-cli`, `ahau-lib-ahau-copy`, `ahau-lib-ahau-csv`, `ahau-lib-ahau-fixtures`, `ahau-lib-ahau-icons`, `ahau-lib-identity`, `ahau-lib-ssb-split-publish`

## Libraries — GraphQL

| Repo | GitLab path | MRs | Issues | Open issues |
|---|---|---|---|---|
| [ahau-lib-graphql-ssb-graphql-profile](repos/ahau-lib-graphql-ssb-graphql-profile.md) | `ahau/lib/graphql/ssb-graphql-profile` | 93 | 1 | 1 |
| [ahau-lib-graphql-ssb-graphql-whakapapa](repos/ahau-lib-graphql-ssb-graphql-whakapapa.md) | `ahau/lib/graphql/ssb-graphql-whakapapa` | 46 | 3 | 3 |
| [ahau-lib-graphql-ssb-graphql-submissions](repos/ahau-lib-graphql-ssb-graphql-submissions.md) | `ahau/lib/graphql/ssb-graphql-submissions` | 33 | 3 | 3 |
| [ahau-lib-graphql-ssb-graphql-main](repos/ahau-lib-graphql-ssb-graphql-main.md) | `ahau/lib/graphql/ssb-graphql-main` | 26 | 0 | 0 |
| [ahau-lib-graphql-ssb-graphql-story](repos/ahau-lib-graphql-ssb-graphql-story.md) | `ahau/lib/graphql/ssb-graphql-story` | 17 | 0 | 0 |
| [ahau-lib-graphql-ssb-graphql-tribes](repos/ahau-lib-graphql-ssb-graphql-tribes.md) | `ahau/lib/graphql/ssb-graphql-tribes` | 17 | 0 | 0 |
| [ahau-lib-graphql-ssb-graphql-artefact](repos/ahau-lib-graphql-ssb-graphql-artefact.md) | `ahau/lib/graphql/ssb-graphql-artefact` | 16 | 0 | 0 |
| [ahau-lib-graphql-ssb-graphql-invite](repos/ahau-lib-graphql-ssb-graphql-invite.md) | `ahau/lib/graphql/ssb-graphql-invite` | 7 | 0 | 0 |
| [ahau-lib-graphql-ssb-graphql-settings](repos/ahau-lib-graphql-ssb-graphql-settings.md) | `ahau/lib/graphql/ssb-graphql-settings` | 6 | 0 | 0 |
| [ahau-lib-graphql-graphql-custom-field](repos/ahau-lib-graphql-graphql-custom-field.md) | `ahau/lib/graphql/graphql-custom-field` | 4 | 0 | 0 |
| [ahau-lib-graphql-ssb-graphql-pataka](repos/ahau-lib-graphql-ssb-graphql-pataka.md) | `ahau/lib/graphql/ssb-graphql-pataka` | 4 | 0 | 0 |
| [ahau-lib-graphql-graphql-edtf](repos/ahau-lib-graphql-graphql-edtf.md) | `ahau/lib/graphql/graphql-edtf` | 2 | 0 | 0 |
| [ahau-lib-graphql-graphql-stats](repos/ahau-lib-graphql-graphql-stats.md) | `ahau/lib/graphql/graphql-stats` | 2 | 0 | 0 |
| [ahau-lib-graphql-ahau-graphql-server](repos/ahau-lib-graphql-ahau-graphql-server.md) | `ahau/lib/graphql/ahau-graphql-server` | 1 | 0 | 0 |

No MR/issue activity: `ahau-lib-graphql-ahau-graphql-client`

## Libraries — SSB plugins

| Repo | GitLab path | MRs | Issues | Open issues |
|---|---|---|---|---|
| [ahau-lib-ssb-plugins-ssb-ahau](repos/ahau-lib-ssb-plugins-ssb-ahau.md) | `ahau/lib/ssb-plugins/ssb-ahau` | 81 | 0 | 0 |
| [ahau-lib-ssb-plugins-ssb-profile](repos/ahau-lib-ssb-plugins-ssb-profile.md) | `ahau/lib/ssb-plugins/ssb-profile` | 75 | 2 | 2 |
| [ahau-lib-ssb-plugins-ssb-whakapapa](repos/ahau-lib-ssb-plugins-ssb-whakapapa.md) | `ahau/lib/ssb-plugins/ssb-whakapapa` | 24 | 1 | 1 |
| [ahau-lib-ssb-plugins-ssb-submissions](repos/ahau-lib-ssb-plugins-ssb-submissions.md) | `ahau/lib/ssb-plugins/ssb-submissions` | 23 | 1 | 1 |
| [ahau-lib-ssb-plugins-ssb-pataka](repos/ahau-lib-ssb-plugins-ssb-pataka.md) | `ahau/lib/ssb-plugins/ssb-pataka` | 20 | 1 | 1 |
| [ahau-lib-ssb-plugins-ssb-atala-prism](repos/ahau-lib-ssb-plugins-ssb-atala-prism.md) | `ahau/lib/ssb-plugins/ssb-atala-prism` | 13 | 2 | 2 |
| [ahau-lib-ssb-plugins-ssb-hyper-blobs](repos/ahau-lib-ssb-plugins-ssb-hyper-blobs.md) | `ahau/lib/ssb-plugins/ssb-hyper-blobs` | 14 | 1 | 1 |
| [ahau-lib-ssb-plugins-ssb-story](repos/ahau-lib-ssb-plugins-ssb-story.md) | `ahau/lib/ssb-plugins/ssb-story` | 13 | 1 | 1 |
| [ahau-lib-ssb-plugins-ssb-artefact](repos/ahau-lib-ssb-plugins-ssb-artefact.md) | `ahau/lib/ssb-plugins/ssb-artefact` | 11 | 2 | 1 |
| [ahau-lib-ssb-plugins-ssb-settings](repos/ahau-lib-ssb-plugins-ssb-settings.md) | `ahau/lib/ssb-plugins/ssb-settings` | 5 | 0 | 0 |
| [ahau-lib-ssb-plugins-ssb-tribes-registration](repos/ahau-lib-ssb-plugins-ssb-tribes-registration.md) | `ahau/lib/ssb-plugins/ssb-tribes-registration` | 3 | 0 | 0 |

## Specs

| Repo | GitLab path | MRs | Issues | Open issues |
|---|---|---|---|---|
| [ahau-spec-private-subgroup-spec](repos/ahau-spec-private-subgroup-spec.md) | `ahau/spec/private-subgroup-spec` | 3 | 0 | 0 |
| [ahau-spec-custom-db-fields](repos/ahau-spec-custom-db-fields.md) | `ahau/spec/custom-db-fields` | 1 | 0 | 0 |

No MR/issue activity: `ahau-spec-ahau-export-spec`, `ahau-spec-ssb-link-spec`, `ahau-spec-whakapapa-spec`, `ahau-spec-whakapapa-ui-state`

## Prototypes

| Repo | GitLab path | MRs | Issues | Open issues |
|---|---|---|---|---|
| [ahau-prototypes-p2pStories](repos/ahau-prototypes-p2pStories.md) | `ahau/prototypes/p2pStories` | 12 | 0 | 0 |
| [ahau-prototypes-artefact-render-demo](repos/ahau-prototypes-artefact-render-demo.md) | `ahau/prototypes/artefact-render-demo` | 1 | 0 | 0 |

No MR/issue activity: `ahau-prototypes-ahau-atala-prism-webhook`, `ahau-prototypes-ahau-code-viz`, `ahau-prototypes-ahau-db-analysis`, `ahau-prototypes-ahau-hyper-bootstrap`, `ahau-prototypes-atala-prism-wallet-sdk-ts`, `ahau-prototypes-broken-atala-demo`
