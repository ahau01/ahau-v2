# Token verification

What was checked, against what, and what is still unknown.

`ahau-styles` was described in earlier planning as the visual source of truth.
It is not: it is a proof of concept needing correction. Every token in
`src/app/tokens.css` was therefore verified against the application's own source
in `ahau-monorepo` rather than adopted.

## Confirmed

| Token | Value | Confirmed in |
|---|---|---|
| primary, secondary, accent, error | `#383838`, `#b12526`, `#a70000`, `#ff0000` | `apps/ahau/ui/vuetify.config.js` — `VUETIFY_THEME_COLORS` |
| alive, deceased | `#427979`, `#bfbfbf` | `apps/ahau/ui/src/lib/constants.mjs`, imported into `vuetify.config.js` |
| dark surface | `dark: true` | `apps/ahau/ui/vuetify.config.js` |
| body font | Roboto | `typeface-roboto`, imported in `src/plugins/vuetify.js` |

## Corrected

**Life-status colours were attributed backwards.** `ahau-styles` labels
`#023000` / `#282828` as "Vuetify theme values (theme.json), used by themed
components", and `#427979` / `#bfbfbf` as "tree/table rendering values
(constants.mjs)".

`vuetify.config.js` imports `ALIVE_COLOUR` and `DECEASED_COLOUR` from
`constants.mjs` and spreads them into the theme, so `#427979` / `#bfbfbf` *are*
the themed-component values. Building from the extraction would have coloured
themed components wrong.

The `theme.json` pair feeds the theme service instead. Which surfaces use it is
unverified, and theming is an open question, so those values are not tokens
here.

## Not carried forward

**Categorical and link palettes.** `ahau-styles` lists eight of each. They were
not traced to a confirmed use in this pass, and importing colours whose purpose
is unknown is how a palette accumulates values nobody can justify. They can be
recovered when a screen needs them.

## Unverified, and marked as such in the file

**Spacing scale.** Vuetify 2 supplied spacing through its own utility classes;
the application never declared a scale. The 4px scale in `tokens.css` was chosen
here, not recovered, and is flagged in the file so it is not mistaken for
Āhau's.

**Focus ring.** Vuetify 2 provided focus styling through its components. With no
component library there is no inherited focus treatment, so this value was
chosen. It should be checked for contrast against the dark surface before any
real screen ships.

**Text and divider opacities.** Taken from Vuetify 2's dark-theme defaults
rather than from Āhau's source, because the application relied on the framework
for them. Correct for parity with the running app; not independently Āhau's.

## Open, and not for this document to settle

**Tribal theming.** The `are-are` theme predates migration, its assets are of
unconfirmed origin, and the user need is unconfirmed. This milestone builds one
theme. Whether assets of unclear provenance belong in a whakapapa application is
a question for the community, not a technical decision.
