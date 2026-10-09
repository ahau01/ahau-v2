# Design parity

How Āhau v2 is judged to look like Āhau.

Parity was unfalsifiable through the first four milestones — the PRDs asked for
"no redesign" without saying how anyone would know. This records the method,
what it is judged against, and what it deliberately does not cover.

## Method: screenshot comparison

Parity is judged by comparing a v2 screen against the same screen in the running
Vue application. Token conformance is necessary but not sufficient: correct
colours arranged wrongly still fail.

## What it is judged against

`ahau-monorepo`, where the Vue application runs — **not** `ahau-styles`, which
is a proof of concept containing at least one inverted attribution (see
`token-verification.md`).

### The baseline needs the whole stack, not just the UI

`apps/ahau/ui/src/main.js` polls GraphQL for `whoami` every 500ms and does not
mount Vue until it answers. Serving the UI alone yields a blank page.

A baseline capture therefore requires the desktop application with its SSB
server running, seeded with data. That is more than a `vite dev`, and it is the
same toolchain weight the PRD cites as evidence for this rebuild.

### Capture once, keep the images

Capture reference screenshots once, commit them, and record the commit they came
from. The old toolchain then does not have to stay alive for parity to remain
checkable — which matters, because the intention is to stop maintaining it.

Record alongside each image:

- the `ahau-monorepo` commit
- the viewport size
- the data on screen, so a v2 comparison can be seeded to match

**Status: first launch captured and compared (#19).**

- **Old app:** `docs/old-app-capture/`. These came from the GitLab desktop repo at
  `f257cf1e` (v2.27.2) on Windows 11, at about 1000×728 (the launch screen at
  1900×1010). The monorepo wouldn't build. `notes.md` records the data on screen.
- **v2:** `docs/parity/first-launch/`, same file names, sizes and data, taken
  in headless Chromium against `?pretend`. `shoot.mjs` there retakes them.

Each of the 12 v2 images was compared by eye with the old one of the same name. They
match in layout, copy, colours and order. These differences remain, all
deliberate:

| Difference | Why |
|---|---|
| No profile photo upload; the avatar doesn't preview the gender chosen | Photos need file storage on Holochain, designed separately. The old avatar preview came from the theme service, and theming is open (below) |
| "Only you can see this." under Personal information | New: those fields are a private entry on the person's own chain, and the screen says so |
| Date, month and year are native selects, not Vuetify menus | Rendered differently, chosen for keyboard and screen-reader use |
| A field's error shows on that field; the person is put in the first one to fix | The old app closed the form without a word when the name was empty. v2 says so instead |
| Escape closes the form | The old dialog was `persistent`. The WAI-ARIA dialog pattern expects Escape to close |
| No app version in the bottom right | v2 has no release version yet |
| Text renders in Chromium on Linux, not Windows | Font smoothing and select arrows differ by platform |

Later screens should follow the same layout: captures in `docs/old-app-capture/`
(or alongside), v2 images under `docs/parity/<screen>/`.

## What parity does not cover

- **Placeholder screens.** Milestone 3's screens exist to prove routing and
  contract consumption. They are not ported screens and are not judged.
- **Layout the old app got from Vuetify's grid.** 869 of 1,871 Vuetify tags were
  `v-col`, `v-row`, `v-container` and `v-spacer`. v2 uses CSS grid and flexbox,
  so the markup differs by design. The rendered result is what is compared.
- **Spacing.** Vuetify 2 supplied it through utility classes; the application
  never declared a scale. v2's scale was chosen, not recovered. Spacing parity
  is therefore aspirational until someone decides what Āhau's spacing is.
- **Focus styling.** Vuetify provided it through components. v2's focus ring was
  chosen here and needs a contrast check before any real screen ships.
- **Theming.** v2 has one theme. Whether Āhau has more, and whether the `are-are`
  assets are of known provenance, is unresolved and is a question for the
  community rather than for this document.

## Why not token conformance alone

It is mechanically checkable and cheap, and it was considered. It would pass a
screen using every correct colour in entirely the wrong arrangement — which is
precisely the failure mode of a framework migration, where components change
shape while the palette stays constant.

Token conformance is still worth having as a cheap first gate. It is not the
standard.
