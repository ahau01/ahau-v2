# ahau-prototypes-p2pStories

GitLab: `ahau/prototypes/p2pStories`  
GitHub: `MakingEverythingAchievableNZ/p2pStories`  
12 MRs, 0 issues (0 open) — activity 2019-08-14 to 2019-09-16

## Notable changes

### !10 Audio mix2 (MR, merged, 2019-08-30)

A large multi-commit PR: refactors api.js by adding a getName function, moving live-update logic into live-updates.js, and adding a setName method; wires the /profile page form to publish an 'about' message for the user and updates the whoami call to return {feedId, name}; adds a playback progress bar and play-button color changes reflecting state, plus styling improvements mainly on /feeds; and threads duration through to be published in audio messages and displayed in the UI.
- category: `feature`
- files mentioned: `api.js`, `live-updates.js`
- [https://gitlab.com/ahau/prototypes/p2pStories/-/merge_requests/10](https://gitlab.com/ahau/prototypes/p2pStories/-/merge_requests/10)

### !9 Audio mix (MR, merged, 2019-08-29)

Adds the start of name-rendering across the app by fetching names in api.js and attaching them to data sent to the frontend: the network page now fetches and displays names for connected peers, and the feed fetches names for each audio message though displaying them in the UI is not yet done. Adds the ssb-backlinks module, a dependency of ssb-about that had been missing.
- category: `feature`
- ⚠ gotcha: Names are fetched for feed messages but not yet displayed in the UI; author notes the code 'is not tidy'.
- files mentioned: `api.js`
- [https://gitlab.com/ahau/prototypes/p2pStories/-/merge_requests/9](https://gitlab.com/ahau/prototypes/p2pStories/-/merge_requests/9)

### !7 connecting the api to views (MR, merged, 2019-08-23)

Adds a /feed page (shows the last 10 log messages) and a /network page (shows local-wifi peers, lets you follow them, and logs connection state), built on a pattern where the backend api.js listens on an 'action' channel and publishes to a 'mutation' channel that the frontend consumes via reducer/dispatch functions, an ad hoc redux-like approach adopted instead of setting up real Redux. Sets friends.hops:1 to avoid pulling the whole network down during phone testing, and adds the ssb-about module.
- category: `feature`
- ⚠ gotcha: Replication between devices isn't working yet (only mutual discovery/follow); calling ssb-about seemed to trigger crashes; the ad hoc state pattern may not scale.
- files mentioned: `api.js`, `pages/network.js`
- [https://gitlab.com/ahau/prototypes/p2pStories/-/merge_requests/7](https://gitlab.com/ahau/prototypes/p2pStories/-/merge_requests/7)

### !6 WIP: New master (MR, merged, 2019-08-22)

Merges luandro's work together with the current components into a new master branch; disables the audio-recording/playing features since they need careful installation, and experiments with RPC calls to the server directly (replacing ssb-client) as the likely place to add GraphQL functionality later.
- category: `refactor`
- ⚠ gotcha: Audio-recording/playing features are disabled pending a more careful install/setup.
- [https://gitlab.com/ahau/prototypes/p2pStories/-/merge_requests/6](https://gitlab.com/ahau/prototypes/p2pStories/-/merge_requests/6)

### !4 Recorder tweaks (MR, merged, 2019-08-19)

Minor cleanup of the Recorder component: renames the paused state to isPaused for boolean-naming convention, adds an isProcessing state to indicate saving is in progress, extracts a small RecButton component, and changes render() to show a different set of buttons depending on state (Record/Pause/Stop while recording, a 'processing...' message while processing, Play when finished).
- category: `refactor`
- [https://gitlab.com/ahau/prototypes/p2pStories/-/merge_requests/4](https://gitlab.com/ahau/prototypes/p2pStories/-/merge_requests/4)

### !3 WIP: react hooks (for profile page) (MR, closed, 2019-08-19)

An experimental conversion of the profile page to React hooks, done in response to a prompt about trying hooks; the author ran into 'state update on unmounted component' problems and found no easy fix in initial research (citing several web posts on the issue).
- category: `refactor`
- ⚠ gotcha: Hit unresolved 'update on unmounted component' warnings when using hooks; MR was closed without merging.
- [https://gitlab.com/ahau/prototypes/p2pStories/-/merge_requests/3](https://gitlab.com/ahau/prototypes/p2pStories/-/merge_requests/3)

## Changelog (mechanical — thin/empty descriptions)

| Date | Ref | Title | State | Author |
|---|---|---|---|---|
| 2019-09-16 | !12 | Opus codec | merged | luandro |
| 2019-09-03 | !11 | added ssb-promiscuous | merged | luandro |
| 2019-08-23 | !8 | Audio | merged | luandro |
| 2019-08-20 | !5 | Install standard | merged | mixmix |
| 2019-08-17 | !2 | WIP: Audio libs | merged | mixmix |
| 2019-08-14 | !1 | minimal working pages | merged | mixmix |
