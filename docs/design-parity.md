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

**Status: not yet captured.** Milestone 3 built the shell and placeholder
screens; there are no ported screens to compare. Capture is scheduled for the
first Leg 2 screen port, when there is something to diff.

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
