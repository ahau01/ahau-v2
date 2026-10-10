# Old Āhau – launch & create-profile capture

## How these were captured
- **Code run:** old GitLab Āhau desktop repo, commit `f257cf1e21827472fd928111cf229bc84cf1a2f6` (app version 2.27.2)
- - **Why not the monorepo:** monorepo build had issues, so the old GitLab code was used for these captures.
- **OS:** Windows 11
- **Window size:** About 1000 x 728 (01-launch.png was taken maximised at 1900 x 1010; others cropped by hand so they vary slightly)
- **Fresh profile:** Deleted the existing profile in-app: click the profile on the launch screen → SKIP FOR NOW on the Pātaka screen → ACCOUNT SETTINGS → SETTINGS tab → scroll to the bottom → DELETE YOUR PROFILE AND DATABASE → type `DELETE` (caps) → YES, DELETE MY PROFILE AND DATABASE. The app returns to the launch screen.

## Screenshots
| File | What it shows |
|---|---|
| `01-launch.png` | Launch screen |
| `02a-create-profile-empty-top.png` | Create-profile, empty (top) |
| `02b-create-profile-empty-middle.png` | Create-profile, empty (middle) |
| `02c-create-profile-empty-bottom.png` | Create-profile, empty (bottom) |
| `02d-add-another-name.png` | "Add another name" clicked – adds Also known as |
| `02e-add-skill.png` | "Add skill/qualification" clicked – adds Skill/qualification |
| `02f-add-education.png` | "Add a place of education" clicked – adds Place of education |
| `03a-create-profile-filled-top.png` | Create-profile, filled in (top) |
| `03b-create-profile-filled-middle.png` | Create-profile, filled in (middle) |
| `03c-create-profile-filled-bottom.png` | Create-profile, filled in (bottom) |
| `04a-error-date-of-birth.png` | Day and Month picked, Year empty |
| `04b-error-date-of-birth.png` | Day picked, Month and Year empty |

## Fields on the create-profile screen
| Label (exact) | Required / optional | Type | Rules / validation |
|---|---|---|---|
| First name / known as | Required | Text | If empty, SAVE closes the form with no error and no profile is created |
| Order of birth | Optional | Text | |
| Identifies as | Optional | Pick one: Male / Female / Other | |
| Unknown | Optional | Checkbox | |
| Upload profile photo | Optional | Image upload | |
| Full name | Optional | Text | |
| Add another name | Optional | Button – adds an "Also known as" box | |
| Also known as | Optional | Text – hidden until "Add another name" is clicked | Unlimited; each removable (bin icon) |
| Date of birth | Optional | Dropdowns: Day / Month / Year | Year alone, or year and month, is accepted; a picked part with a gap before it is not (see note below) |
| Place of birth | Optional | Text | |
| About | Optional | Multi-line text | |
| Profession | Optional | Text | |
| Add skill/qualification | Optional | Button – adds a "Skill/qualification" box | |
| Skill/qualification | Optional | Text – hidden until "Add skill/qualification" is clicked | Unlimited; each removable (bin icon) |
| Add a place of education | Optional | Button – adds a "Place of education" box | |
| Place of education | Optional | Text – hidden until "Add a place of education" is clicked | Unlimited; each removable (bin icon) |
| Email | Optional | Text | No format check – accepts anything (e.g. "abc") |
| Phone | Optional | Text | No format check – accepts anything, including letters |
| Address | Optional | Text | No format check – accepts anything |
| Postcode | Optional | Text | No format check – accepts anything, including letters |
| City | Optional | Text | No format check – accepts anything |
| Country | Optional | Text | No format check – accepts anything (free text, not a dropdown) |

## Exact wording

### Launch screen
- Heading: NAU MAI / WHAKATAU MAI
- Body text: WELCOME
- Buttons: KO WAI KOE ---- WHO ARE YOU? (two pieces of text: "Ko wai koe --" in red + "-- who are you?" in light grey, shown in capitals)

### Create-profile screen
- Heading: AHAU ---- I AM (two pieces of text: "AHAU --" in red + "-- I AM" in white)
- Section headings: Skills and qualifications / Personal information
- Field labels: (see table)
- Help / placeholder text: Upload profile photo
- Buttons: CANCEL / SAVE / Add another name / Add skill/qualification / Add a place of education
- Error messages:
  - Empty form: none shown. If First name / known as is empty, pressing SAVE closes the form, returns to the launch screen and creates no profile.
  - Date of birth: message lists whichever parts are missing, e.g.
    - Day + Month picked, no Year: "Please specify a year"
    - Day only picked: "Please specify a year and month"
  - Note (added for #19): the old app's source shows the full rule. It is
    `convertDateObjToString` in `apps/ahau/ui/src/lib/date-helpers.mjs`
    (ahau-monorepo `6e0a66e`). Year only and year + month are valid. A gap
    gives "Please specify a month" (day + year), "Please specify a year"
    (day + month, or month only) or "Please specify a year and month" (day
    only). The dropdowns also offered unknown digits, e.g. `XX` or `192X`.

## Values typed in for the "filled in" screenshot
| Field | Value |
|---|---|
| First name / known as | Test |
| Order of birth | 1 |
| Identifies as | Other |
| Unknown | Unticked |
| Upload profile photo | None |
| Full name | Test User |
| Also known as | Tester |
| Date of birth | 01 / January / 1990 |
| Place of birth | Auckland |
| About | Test profile for screenshots |
| Profession | Developer |
| Skill/qualification | Te reo Māori |
| Place of education | Test School |
| Email | test@example.com |
| Phone | 021 000 0000 |
| Address | 1 Test Street |
| Postcode | 1010 |
| City | Auckland |
| Country | Aotearoa |

# Old Āhau – top-level pages capture (#61)

Taken by an agent running `capture.mjs`, not by hand. The wording and
addresses below were read from the running app's pages, not retyped.

## How these were captured
- **Code run:** `github.com/ahau01/ahau`, commit `eb4fb4887018574f874e33c082dedc9dcc166a25` (`main`), app version 2.27.2 (`package.json`, `ui/`, `desktop/`), Electron 26.4.1, Vuetify 2.3.20
- **Same app as #20:** #20 ran GitLab `f257cf1e` (the head of `e2e-testing-eval`, MR !985). That commit only adds !985's test hooks to this code: three `data-testid`s in `Login.vue`, `ui/e2e/`, and Playwright as a `ui` dev dependency. The running app is the same.
- **OS:** EndeavourOS (Linux 6.18.54-1-lts)
- **Node:** 18.20.8, from pinned nixpkgs (`nix shell github:NixOS/nixpkgs/nixos-24.11#nodejs_18`), since current nixpkgs has dropped `nodejs_18` and the old app needs `>=18 <19`
- **Install:** `npm install --engine-strict` in `ui/` and `desktop/`. The repo root was skipped: its dev dependency `wait-on@9.0.5` pulls in `joi@18.1.2`, which needs Node 20 or later, and the root holds only dev tooling. `desktop/node_modules` was left over from an earlier, partial install, so Electron's postinstall had not fetched its binary; `node node_modules/electron/install.js` in `desktop/` fetched it. No tracked file in the old repo changed.
- **Display:** Xvfb (`xvfb-run -a -s '-screen 0 1600x1000x24'`). Electron needed no extra flags; it logs GPU errors and falls back to software rendering. The shots are the page content only, with no title bar.
- **Fonts:** Roboto, which the app bundles (`typeface-roboto`), so text renders as it did on Windows
- **Window sizes:** desktop 1366 x 768 (Vuetify `lg`), narrow 400 x 800 (`xs`), tablet 1000 x 728 (`md`, about #20's size). Before each shot the script checks `window.innerWidth` is in that size's band.
- **Narrow is below the desktop app's minimum.** The window has `minWidth: 800`, set by `ssb-ahoy` (`electron/window/ui-window.js:21`), so a desktop user couldn't make it 400 wide. The script lifts the minimum in memory for the narrow shots. They show the `xs` layout, which is what the same `ui/` code showed in the Cordova mobile app.
- **Data folder:** `APP_NAME=ahau-capture`, so the app kept its data in `~/.local/share/ahau-capture`. The script deletes that folder, and refuses any other, before each run. `~/.config/Ahau`, `~/.local/share/ahau` and `~/.local/share/ahau-dev` were not touched.
- **Fresh profile:** the script creates "Test" with the values in "Values typed in for the filled in screenshot" above, clicks it on the launch screen, chooses SKIP FOR NOW on the Pātaka screen, then restarts the app. Every shot is after the restart. AGE shows 36 because the date of birth is 1 January 1990 and the capture date is 10 October 2026, so it changes over time.
- **Command:**
  ```
  tmp=$(mktemp -d) && cp docs/old-app-capture/capture.mjs "$tmp" \
    && (cd "$tmp" && npm i playwright-core@1.61)
  nix shell github:NixOS/nixpkgs/nixos-24.11#nodejs_18 -c \
    xvfb-run -a -s '-screen 0 1600x1000x24' \
    node "$tmp/capture.mjs" ~/projects/ahau "$PWD/docs/old-app-capture"
  ```
- **Repeat run:** two runs from scratch gave the same 12 files, pixel for pixel, and the same wording.

## Screenshots
Addresses are the app's own (`$route.fullPath`), with the IDs written as names. `:tribeId` is your personal tribe and `:profileId` your own profile.

| File | What it shows | Window size | Address |
|---|---|---|---|
| `10-returning-launch.png` | Launch screen after a restart: your avatar and name | 1366 x 768 | `/login` |
| `11a-own-profile-desktop.png` | Your own profile (top): header image, avatar, side nav, Profile information, Tribes and Pātaka cards | 1366 x 768 | `/tribe/:tribeId/person/:profileId/profile` |
| `11a-own-profile-desktop-b.png` | Your own profile (bottom): Skills and education, Contact information | 1366 x 768 | `/tribe/:tribeId/person/:profileId/profile` |
| `11b-own-profile-narrow.png` | Your own profile, narrow (top): side nav as a row of icons, menu button in the app bar | 400 x 800 | `/tribe/:tribeId/person/:profileId/profile` |
| `11b-own-profile-narrow-b.png` | Your own profile, narrow (middle) | 400 x 800 | `/tribe/:tribeId/person/:profileId/profile` |
| `11b-own-profile-narrow-c.png` | Your own profile, narrow (bottom): Tribes and Pātaka cards below the profile | 400 x 800 | `/tribe/:tribeId/person/:profileId/profile` |
| `11c-own-profile-tablet.png` | Your own profile, tablet (top): side nav as a column of icons, no labels | 1000 x 728 | `/tribe/:tribeId/person/:profileId/profile` |
| `11c-own-profile-tablet-b.png` | Your own profile, tablet (bottom) | 1000 x 728 | `/tribe/:tribeId/person/:profileId/profile` |
| `12-personal-archive-empty.png` | Your personal Archive, empty, opened from the side nav | 1366 x 768 | `/tribe/:tribeId/person/:profileId/archive` |
| `13-personal-whakapapa-empty.png` | Your personal Whakapapa, empty, opened from the side nav | 1366 x 768 | `/tribe/:tribeId/person/:profileId/whakapapa` |
| `14-tribes-empty.png` | The tribe list with no tribes, opened from the app bar's "+" | 1366 x 768 | `/tribe` |
| `15-app-bar.png` | The app bar only, with no tribes (taken on your own profile) | 1366 x 768 | `/tribe/:tribeId/person/:profileId/profile` |

Not captured: People and Wallet. Neither shows in your side nav (see Open questions answered), so the script had nothing to open.

## Exact wording
Shown as the app displays it, in capitals where CSS makes them capitals. Every page shows `2.27.2` at the bottom right (its text is "version 2.27.2").

### Returning launch screen (`10`)
- Your name under your avatar: TEST (your preferred name, "Test", in capitals)
- No heading, buttons or other text

### App bar (`15`, and the top of every page except launch)
- Left: the Āhau logo, with a red notification badge showing "1"
- Right, in order: "?" (help), "+" (opens the tribe list), a divider, your avatar
- No words. Only "+" is text; the badge's button is named "Badge"; the help and avatar buttons have no name. Hover tooltips weren't captured.
- Narrow: the logo and badge on the left, a menu button on the right

### Side nav (`11a`, `12`, `13`)
- Desktop: your avatar, then PROFILE / ARCHIVE / WHAKAPAPA, each with an icon. The current page's label and icon are red.
- Tablet: the same icons in a column, with no labels
- Narrow: the same three icons in a row, in a rounded box under your name
- No PEOPLE and no WALLET

### Your own profile (`11a`, `11b`, `11c`)
- Heading: Test User (your full name)
- Button: ACCOUNT SETTINGS (narrow: an icon only, at the top left)
- Section headings: PROFILE INFORMATION / SKILLS AND EDUCATION / CONTACT INFORMATION
- Field labels:
  - Profile information: ABOUT / PREFERRED NAME / OTHER NAMES / AGE / PLACE OF BIRTH
  - Skills and education: PROFESSION / SCHOOLS / SKILLS
  - Contact information: PHONE / EMAIL / ADDRESS / CITY / COUNTRY / POSTCODE
- Card: TRIBES, with "+ Click here to discover your tribes"
- Card: PĀTAKA, with "You are not currently connected to any Pātaka" and the button JOIN NETWORK
- The create-profile form's "Personal information" section shows here as CONTACT INFORMATION. Order of birth and Identifies as aren't shown.

### Personal Archive, empty (`12`)
- Heading: YOUR PERSONAL ARCHIVE, with an info icon
- Buttons: NEW COLLECTION / NEW STORY (left to right)
- Section headings: VIEWARCHIVE.COLLECTIONSTITLE / STORIES
- Empty messages: "No collections found" / "No stories found"
- VIEWARCHIVE.COLLECTIONSTITLE is a bug in the old app, not a capture fault: `components/archive/Archive.vue:19` passes the key `'viewArchive.collectionsTitle'` without calling `$t`, so the key shows instead of "Collections".

### Personal Whakapapa, empty (`13`)
- Heading: WHAKAPAPA RECORDS, with an info icon
- Button: NEW WHAKAPAPA RECORD
- Empty message: "no whakapapa record found" (lower case, as shown)

### Tribe list, no tribes (`14`)
- Heading: TRIBES
- Button: NEW TRIBE
- Card: PĀTAKA, with "You are not currently connected to any Pātaka" and JOIN NETWORK
- No empty message: the list area is blank
- No side nav

## Open questions answered
From `docs/capability-inventory.md`'s Open questions.

- **Q1. Does a returning person see the Pātaka screen? No.** After a restart, clicking your avatar on the launch screen went straight to your profile (`10-returning-launch.png`; the script checked for the dialog and recorded that it didn't show). The Pātaka screen did show when the script clicked "Test" straight after creating the profile, before the restart. That matches the code, where `onboarded` starts as `true` and only `save()` sets it to `false`, and explains #20's "SKIP FOR NOW on the Pātaka screen" step. The screen shows once, after you create your profile, in that session.
- **Q2. Does "People" show in your side nav? No.** For a new identity your side nav is PROFILE / ARCHIVE / WHAKAPAPA (`11a-own-profile-desktop.png`, `12-personal-archive-empty.png`, `13-personal-whakapapa-empty.png`). WALLET doesn't show either, as it needs at least one credential.
- **Q6. Did these pages work in the running app? Yes, with one fault.** Your own profile, Archive, Whakapapa, the tribe list and the app bar all loaded and navigated as expected. The script collected no console errors across the run. The one fault is the untranslated heading VIEWARCHIVE.COLLECTIONSTITLE on the Archive (`12-personal-archive-empty.png`).
