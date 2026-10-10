# Capability inventory: the old Āhau app

This is the capability inventory asked for in
[#13](https://github.com/ahau01/ahau-v2/issues/13): what people can do in the
old Āhau app, written from their point of view and without implementation
detail. It is a checklist so nothing gets dropped in the capability-driven
redesign — it is not a spec to copy screen by screen.

**This first section covers the top-level pages only**
([#60](https://github.com/ahau01/ahau-v2/issues/60)). It feeds the "next slice:
landing and a navigable shell" map
([#59](https://github.com/ahau01/ahau-v2/issues/59)). Deeper areas (story and
artefact forms, whakapapa editing details, tribe settings, registrations and
submissions) get one line each here. Later sections can expand them.

## How this was gathered

- **Source:** the old app's UI code in `ahau-monorepo` at commit `6e0a66edd`,
  under `apps/ahau/ui/src/`. All "Where seen" references are relative to that
  folder. The router is `router/index.js` and `router/modules/views.js`.
- **The app was not run for this section.** #13 lists the running app as the
  first source, but every row here comes from reading code. The one exception
  is the first-launch screens, which were captured from the running GitLab
  desktop app v2.27.2 in [old-app-capture/notes.md](old-app-capture/notes.md).
- **Status** is a best reading of the code:
  - **disabled**: the UI is commented out or hard-disabled ("coming soon")
  - **partial**: the code shows a visible gap or bug
  - **unverified**: the code exists, but nobody has watched it work
  - **works**: only used where it was seen in the running app
- **Kaupapa flag** uses CLAUDE.md's four areas: **relationship**, **identity**,
  **permissions**, **sync**. "none" means none of the four seemed to apply.
  CLAUDE.md's rules apply to any flagged row when it is rebuilt.
- **Keep?** is left blank on purpose. Prioritisation is a separate review.

Three terms the code uses:

- **Tribe.** Every page lives inside a tribe, whose id is in the URL. A tribe
  has a *private* profile (members only) and a *public* profile (anyone).
- **Personal tribe.** Every person has a private group containing only
  themselves. Your own profile, archive, whakapapa and wallet live there.
- **Kaitiaki.** A tribe's admins. The code also treats you as kaitiaki of
  your own personal tribe (`store/root.mjs:62-64`).

---

## Landing and navigation

### Where you land

1. **Start.** `/` redirects to `/login` (`router/index.js:12`). `/logout`
   and unknown paths also lead there (`router/index.js:13-14`). The app has
   no logout button; `logout` only appears in the router.
2. **Launch screen (`views/Login.vue`).** It shows a splash while it loads
   your identity (`Login.vue:139-164`). Then:
   - **First launch** (your personal profile has no name): "Nau mai /
     Whakatau mai / Welcome" with a **Ko wai koe / who are you?** button
     (`Login.vue:14-37`). The button opens the create-profile form
     (`Login.vue:52-57`). Saving writes your personal profile and marks you
     "not yet onboarded" (`Login.vue:205-218`). The screen then shows your
     avatar.
   - **Returning** (your profile has a name, `Login.vue:156`): the screen
     shows your avatar and name. You click it to go in (`Login.vue:39-51`).
3. **Pātaka step.** Clicking the avatar runs `login()` (`Login.vue:176-189`).
   If you have just created your profile, the "connect to a Pātaka" dialog
   opens first (`Login.vue:58-65`). Both Skip and Connect then continue
   (`Login.vue:170-174, 191-199`). A returning person skips the dialog,
   because `onboarded` starts as `true` (`Login.vue:107`). The #61 capture
   confirms it: after a restart, clicking your avatar goes straight to your
   profile. The dialog shows only after you create your profile, in that
   session. See Open questions.
4. **Where you end up.** `login()` goes to the route named `person`, using
   your personal tribe id and your personal profile id
   (`Login.vue:179-185`). That route redirects to `profile`
   (`views.js:74-75`).

   **You land on your own profile: `/tribe/<personal tribe id>/person/<your
   profile id>/profile`.** It is the same page component as a tribe's
   community profile (`views/ProfileShow.vue`), with your personal tribe
   selected.

### How the nav is structured

The app has two levels of navigation. Neither one is a list of top-level
pages.

**1. Top app bar** (`components/menu/Appbar.vue`). It is hidden on the
launch screen (`App.vue:130-133`). It shows on every other page.

- **Notifications bell** (`Appbar.vue:5`): join requests, submissions to
  review, and a "back up your key" reminder (`NotificationPanel.vue:21-50`).
- **Help** (`Appbar.vue:12`).
- **"+" Add tribes**, which goes to the tribe list `/tribe`
  (`Appbar.vue:15`).
- **One avatar per tribe you belong to** (`Appbar.vue:21-48`). This list
  is tribes with a private profile you can see (`Appbar.vue:216-218`),
  re-fetched every 10 seconds (`Appbar.vue:186`).
- **Your own avatar**, which goes to your personal tribe
  (`Appbar.vue:54-63`).
- **On mobile** the same items sit in a right-hand drawer
  (`Appbar.vue:85-132`).
- **Switching keeps your section.** Moving between tribes, or to yourself,
  keeps the section you were on: Archive stays Archive, Whakapapa stays
  Whakapapa (`Appbar.vue:247-269`).

**2. Side nav inside a tribe or person** (`components/menu/SideNavMenu.vue`,
mounted by `ProfileShow.vue:29`). It shows the profile's avatar, then these
items, each conditional:

| Item | Shown when | Where seen |
|---|---|---|
| Profile | Viewing a community, or your personal tribe | `SideNavMenu.vue:33-57, 242-246` |
| Archive | Your personal tribe, or the tribe has "stories and collections" switched on | `SideNavMenu.vue:70` |
| Whakapapa | (Community or personal tribe) **and** (personal tribe, or the tribe has "whakapapa records" on) | `SideNavMenu.vue:87` |
| People | You are listed as kaitiaki on this profile **and** (personal tribe, or the tribe has "people database" on) | `SideNavMenu.vue:104, 247-252` |
| Wallet | Personal tribe **and** you hold at least one credential | `SideNavMenu.vue:121, 223-225` |
| Join tribe / Request sent / Request declined | Replaces all items when you view a tribe you're not a member of | `SideNavMenu.vue:29, 253-269` |

If a tribe has switched a section off and you open its URL directly,
`App.vue:144-165` sends you back to that tribe's profile. This only checks
the route in the UI. It is not a permission rule.

### What's under `/tribe/:tribeId`

Everything except the launch screen and the tribe list is under a tribe id
(`views.js:47-92`):

```
/login
/tribe                                        tribe list (discovery)
/tribe/:tribeId/community/:profileId/         -> redirects to profile
    profile | archive | collection/:collectionId
    whakapapa | whakapapa/:whakapapaId | wallet
    person                                    people list ("personIndex")
/tribe/:tribeId/person/:profileId/            -> redirects to profile
    profile | archive | collection/:collectionId
    whakapapa | whakapapa/:whakapapaId | wallet
```

- The same six child routes are generated for `community` and `person`
  (`views.js:72-92`). `ProfileShow.vue` hosts both, with a code comment
  calling it "(T_T) this has got to change" (`views.js:55`).
- A TODO in `views.js:22-44` sketches a cleaner RESTful layout. It was never
  done.

### Personal vs tribe-scoped

- **Personal** (your personal tribe): your profile, account settings,
  Pātaka connections, your archive and collections, your whakapapa records,
  your people list (the People item only shows if the kaitiaki check
  passes; for a new identity it doesn't), and your wallet.
- **Tribe-scoped:** the community profile, members and kaitiaki lists, the
  tribe's archive and collections, its whakapapa records (plus a separate
  kaitiaki-only list), the people list (kaitiaki only), tribe settings, and
  join requests.
- **Neither:** the tribe list `/tribe` and the launch screen.
- **"Person profile" pages for other people are not really pages.** Other
  people open in a side panel (`components/dialog/profile/SideNodeDialog.vue`)
  from the whakapapa tree, the people list, or the members list. The only
  page about another person is `.../person/:profileId/archive`. You reach it
  from that panel's "Stories" button (`SideNodeDialog.vue:156-166, 708-720`).
  It lists stories that mention them.

---

## Launch and first launch (context only)

Data shown: your own avatar and name if set up, otherwise a welcome. Who sees
it: whoever opens the app on this device. Launch was already rebuilt in v2
(#17–#19); these rows are here for context.

| Who | What | Where seen | Status | Kaupapa flag | Keep? |
|---|---|---|---|---|---|
| Any person on a new device | Is welcomed and asked "Ko wai koe / who are you?" before anything else | `views/Login.vue:14-37` | works (captured, v2.27.2) | identity | |
| Any person on a new device | Creates their own profile (names, gender, birth, about, skills, contact) as the first act | `Login.vue:52-57, 205-218`; `components/dialog/profile/NewPersonDialog.vue` | works (captured, v2.27.2) | identity | |
| A returning person | Sees their own avatar and name on launch and clicks it to enter. No password or account. | `Login.vue:39-51, 176-189` | works (captured, v2.27.2) | identity | |
| A new person | Is offered to connect to a Pātaka (an always-online peer) or skip, right after creating their profile | `Login.vue:58-65, 170-199`; `components/dialog/connection/NewPatakaDialog.vue` | works (used during capture, v2.27.2). Not offered again after a restart. | sync | |

## Tribe list / discovery (`/tribe`)

Data shown: tribes you're connected to (their private profile) and other
tribes you can see (their public profile only), each as a card with avatar
and name. On the right, your Pātaka connections. Who sees it: any person.
Lists re-fetch every 10 seconds (`CommunitiesList.vue:75-79`).

| Who | What | Where seen | Status | Kaupapa flag | Keep? |
|---|---|---|---|---|---|
| Any person | Sees the tribes they belong to, separately from other tribes they know about | `components/community/CommunitiesList.vue:43-52, 85-90` | unverified | permissions | |
| Any person | Opens a tribe's community profile from its card | `components/community/CommunityList.vue:38-46` | unverified | none | |
| Any person | Creates a new tribe; the creator goes straight to its profile | `views/Discovery.vue:14-20, 67-69`; `components/dialog/DialogHandler.vue:296-301` | unverified | permissions | |
| Any person | Sees which Pātaka they are connected to, and whether each is online or blocked | `components/community/PatakaList.vue:17-65` | unverified | sync | |
| Any person | Connects to a new Pātaka with an invite code | `PatakaList.vue:70-90` | unverified | sync | |
| Any person | Blocks (bin icon) or unblocks a Pātaka | `PatakaList.vue:48-63` | unverified | sync | |

## A tribe's community profile (`/tribe/:tribeId/community/:profileId/profile`)

Data shown:

- the tribe's header image, avatar and name
- an "about" description
- contact details (phone, email, address, city, country, postcode)
- a kaitiaki list and a members list

**Who sees it:**

- **Members** see the private profile.
- **Non-members** see only the public profile and a "Join tribe" button.
  `nonMember` is "community with no `recps`" (`SideNavMenu.vue:253-258`).
- **Members list:** shown only to members (`Profile.vue:121`).
- **Kaitiaki list:** shown on any profile that isn't yours
  (`Profile.vue:106`).

| Who | What | Where seen | Status | Kaupapa flag | Keep? |
|---|---|---|---|---|---|
| Any person | Reads a tribe's description and contact details | `components/profile/ProfileInfoCard.vue:4`; `components/profile/Profile.vue:49-63` | unverified | none | |
| Any person | Sees who the tribe's kaitiaki are | `Profile.vue:106-119` | unverified | permissions | |
| Member | Sees the tribe's other members and opens any member's profile in a side panel | `Profile.vue:121-132, 224-227` | unverified | identity, permissions | |
| Non-member | Asks to join a tribe: reviews their own profile, answers the tribe's joining questions, agrees to share their details | `SideNavMenu.vue:29`; `ProfileShow.vue:71-78`; `components/dialog/registration/NewRegistrationDialog.vue:52-212` | partial: the request is sent without `await` (`ProfileShow.vue:302`), so "request sent" shows even if it fails | identity, permissions | |
| Non-member | Sees whether their join request is pending or was declined | `SideNavMenu.vue:259-269` | unverified | permissions | |
| Kaitiaki | Changes the tribe's header image | `components/profile/ProfileHeader.vue:7-8` | unverified | none | |
| Kaitiaki | Edits the tribe's name, description, avatar and contact details. Some go to the public profile, some stay private. | `ProfileShow.vue:12-17, 47-56, 206-229`; `components/community/CommunityForm.vue`; `lib/community-helpers.mjs:137-158` | unverified | permissions | |
| Kaitiaki | Defines extra profile fields the tribe collects, and the joining questions | `components/dialog/community/NewCommunityDialog.vue:57-67` | unverified | identity | |
| Kaitiaki | Turns the tribe's People list, Whakapapa records, and Stories and collections on or off | `components/dialog/community/TribeSettings.vue:80-99` | unverified | permissions | |
| Kaitiaki | Makes another member a kaitiaki | `components/dialog/community/GroupsList.vue:38-46`; `ProfileShow.vue:215-223` | unverified | permissions | |
| Kaitiaki | Removes a kaitiaki (when there are 2 or more, and not themselves) | `GroupsList.vue:30-34` | unverified. The save path only handles `authors.add` (`ProfileShow.vue:216-217`), so removal may not save. | permissions | |
| Kaitiaki | Groups members into sub-groups | `GroupsList.vue:5-15, 50-70` | disabled ("coming soon") | permissions | |
| Kaitiaki | Sets who can create whakapapa, collections and stories | `components/dialog/community/Permissions.vue:4-49` | disabled ("coming soon") | permissions | |
| Kaitiaki | Issues or accepts digital membership credentials (beta toggle) | `TribeSettings.vue:47-53` | unverified (beta) | identity, permissions | |
| Kaitiaki | Deletes the tribe | `ProfileShow.vue:65-70, 284-299` | unverified | permissions, sync | |
| Kaitiaki | Reviews join requests and accepts or declines them (via notifications) | `components/menu/NotificationPanel.vue:21-50`; `components/dialog/registration/ReviewRegistrationDialog.vue` | unverified | permissions, identity | |

## Person index / People list (`/tribe/:tribeId/community/:profileId/person`)

Data shown: a searchable, sortable table of every person profile in the
tribe. Columns:

- avatar, names, gender, description
- age, birth and death dates
- phone, email, address, city, country, postcode
- birth place, birth order, death place, burial place
- profession, education, school
- the tribe's own extra fields

Columns follow the tribe's field list (`PersonIndex.vue:242-260`).

Who sees it: **kaitiaki only**. The page renders nothing for anyone else
(`PersonIndex.vue:2, 173`). The nav item also needs the tribe's "people
database" setting on.

| Who | What | Where seen | Status | Kaupapa flag | Keep? |
|---|---|---|---|---|---|
| Kaitiaki | Browses, searches and sorts every person in the tribe in a table | `views/PersonIndex.vue:12-45, 297-314` | unverified | identity, permissions | |
| Kaitiaki | Chooses which columns show and whether avatars show | `PersonIndex.vue:11, 92-99` | unverified | none | |
| Kaitiaki | Opens a person's profile in a side panel, to view or edit | `PersonIndex.vue:44, 59, 315-330` | unverified | identity | |
| Kaitiaki | Adds a person who is visible only to kaitiaki | `PersonIndex.vue:9, 232-241` | unverified | identity, permissions | |
| Kaitiaki | Deletes a person (not themselves) | `PersonIndex.vue:62, 335-340` | unverified | identity, relationship | |
| Kaitiaki | Imports people (and any relationships in the file) from a CSV | `PersonIndex.vue:74-77, 264-286` | unverified | identity, relationship | |
| Kaitiaki | Downloads the people list as a CSV | `PersonIndex.vue:78-81` | unverified | permissions | |
| Kaitiaki | Refreshes the list | `PersonIndex.vue:10` | unverified | sync | |

## Person profile (another person)

There's no page for this. Another person's profile opens in a side panel
(`components/dialog/profile/SideNodeDialog.vue`) from the whakapapa tree,
the people list, or a tribe's members list.

Data shown:

- names, age, description, location
- birth and death details, profession, skills
- the tribe's extra fields
- parents, partners, siblings and children
- who contributed the profile

Who sees what:

- **Contact details** are shown to kaitiaki only (`SideNodeDialog.vue:216-224`).
- **Editing** needs `canEdit` or a kaitiaki copy of the profile
  (`SideNodeDialog.vue:167-176`).

| Who | What | Where seen | Status | Kaupapa flag | Keep? |
|---|---|---|---|---|---|
| Member | Views a person's profile and family (parents, partners, siblings, children) | `SideNodeDialog.vue:183-311` | unverified | identity, relationship | |
| Kaitiaki | Sees a person's contact details, which members don't see | `SideNodeDialog.vue:216-224` | unverified | permissions, identity | |
| Member | Sees who contributed a person's profile | `SideNodeDialog.vue:318-325` | unverified | identity | |
| Profile editor | Edits a person's details | `SideNodeDialog.vue:167-176` | unverified | identity | |
| Profile editor | Changes the type of a relationship (e.g. birth, adopted, whāngai, partner type), or removes it | `components/profile/EditRelationships.vue:14-99`; `SideNodeDialog.vue:58-90, 680-706` | unverified. This rewrites the existing link in place. | relationship | |
| Profile editor | Adds a parent, partner, sibling or child from the profile | `SideNodeDialog.vue:254-311` | unverified | relationship | |
| Member | Opens "stories about this person", the archive page filtered to records that mention them | `SideNodeDialog.vue:156-166, 708-720`; `mixins/story-mixins.js:28-40` | unverified | identity | |
| Member without edit rights | Suggests changes with a comment for kaitiaki to review | `SideNodeDialog.vue:107, 128, 751-795` | unverified | identity, permissions | |

## Your own profile (landing page)

This is `/tribe/<personal tribe>/person/<your id>/profile`.

Data shown:

- your header image, avatar, and full or preferred name as the title
- about, preferred and other names, age, place of birth
- your parents, partners, siblings and children, if any
- profession, schools and skills, shown only on your own profile
  (`Profile.vue:32-47`)
- contact details
- the tribes you belong to, or a "discover your tribes" link
- your Pātaka connections

Who sees it: you. It sits in your personal group.

| Who | What | Where seen | Status | Kaupapa flag | Keep? |
|---|---|---|---|---|---|
| A person | Lands on their own profile after entering the app | `Login.vue:176-185`; `views.js:74-75` | works (captured, v2.27.2) | identity | |
| A person | Reads their own profile, including skills and education | `Profile.vue:21-64`; `ProfileInfoCard.vue:4-30` | works (captured, v2.27.2) | identity | |
| A person | Sees their own family (parents, partners, siblings, children) and opens any of them | `ProfileInfoCard.vue:10-30` | unverified | relationship | |
| A person | Sees the tribes they belong to and jumps to one, or follows "discover your tribes" to the tribe list | `Profile.vue:80-105` | unverified | permissions | |
| A person | Manages Pātaka connections from their profile (same as on the tribe list) | `Profile.vue:134` | unverified | sync | |
| A person | Changes their header image | `ProfileHeader.vue:7-8` | unverified | identity | |
| A person | Edits their own profile ("Account settings", Profile tab) | `ProfileShow.vue:12-17, 57-64, 230-244`; `components/dialog/profile/EditPersonDialog.vue:41-50` | unverified (v2 slice #47) | identity, sync | |
| A person | When editing, also updates their answers to each tribe's extra fields | `ProfileShow.vue:256-283` | unverified | identity | |
| A person | Changes theme and language | `components/settings/AppearanceSettings.vue`; `components/settings/LanguageSettings.vue` | unverified | none | |
| A person | Downloads a backup of their key, and is reminded to do so in notifications | `components/settings/BackupSettings.vue:10-18`; `NotificationPanel.vue:28-33` | unverified | identity | |
| A person (desktop) | Sees how much storage Āhau uses and caps it | `components/settings/StorageSettings.vue:37-82`; `components/settings/SettingsForm.vue:9-11` | unverified | sync | |
| A person | Deletes their profile and the local database. The public profile is retracted, then they return to the launch screen. | `EditPersonDialog.vue:177-210`; `components/dialog/DeleteProfileDialog.vue` | works (used during capture, v2.27.2) | identity, sync | |

## Archive and collections (`.../archive`, `.../collection/:collectionId`)

Data shown: collections, then a list or timeline of stories (records). Each
story can carry:

- title, description, dates, location
- media artefacts
- access, mentioned people, kaitiaki, contributors, creators
- related records and collections
- source, language, transcription

Stories already in a collection are hidden from the main list
(`Archive.vue:177-181`).

What each archive shows:

- **Your personal archive:** your personal group's records.
- **A tribe's archive:** the tribe's records.
- **A person's archive:** records that mention that person
  (`mixins/story-mixins.js:16-41`).

Who sees it: members of that group. The nav item needs the tribe's
"stories and collections" setting.

| Who | What | Where seen | Status | Kaupapa flag | Keep? |
|---|---|---|---|---|---|
| Member | Browses a tribe's or their own archive as a list or a timeline | `components/archive/Archive.vue:24-42` | unverified | permissions | |
| Member | Opens a story and reads all its details and media | `components/archive/StoryCard.vue:12-200` | unverified | none | |
| Member | Adds a story, with media, access, mentions, contributors and more | `Archive.vue:11, 62-65`; `components/dialog/archive/NewRecordDialog.vue` | unverified | permissions, identity | |
| Member | Mentions people in a story, so it shows on "stories about" that person | `StoryCard.vue:72-81`; `story-mixins.js:28-40` | unverified | identity | |
| Story editor | Edits or deletes a story; edits or removes an artefact | `StoryCard.vue:222-272` | unverified | sync | |
| Profile editor | Creates a collection (desktop only; personal archive or a tribe's archive) | `Archive.vue:13, 134-136, 164-166` | unverified | permissions | |
| Member | Opens a collection and sees its stories | `Archive.vue:17-23, 189-197`; `views/CollectionShow.vue` | unverified | none | |
| Member | Adds a story directly into a collection | `CollectionShow.vue:8, 61-66` | unverified | permissions | |
| Collection editor | Edits or deletes a collection | `CollectionShow.vue:15, 44-60, 175-190` | unverified. The UI shows edit to anyone; the code doesn't say who may save. | permissions | |

## Whakapapa list (`.../whakapapa`)

Data shown: the group's whakapapa records (name, description, image). For a
tribe, a second list of **kaitiaki-only** records follows
(`WhakapapaIndex.vue:50-67, 151-156`). Who sees it: members, if the tribe
has "whakapapa records" on. Your personal tribe always shows it.

| Who | What | Where seen | Status | Kaupapa flag | Keep? |
|---|---|---|---|---|---|
| Member | Sees the group's whakapapa records and opens one | `views/WhakapapaIndex.vue:34-45, 167-175` | unverified | permissions | |
| Kaitiaki | Also sees kaitiaki-only whakapapa records | `WhakapapaIndex.vue:50-67` | unverified | permissions | |
| Profile editor | Creates a whakapapa starting from a new person | `WhakapapaIndex.vue:9-11, 210-237`; `components/whakapapa/WhakapapaForm.vue:56` | unverified | relationship | |
| Profile editor | Creates a whakapapa by importing a CSV | `WhakapapaForm.vue:57-66`; `WhakapapaIndex.vue:238-239` | unverified | relationship, identity | |
| Profile editor | Creates a whakapapa starting from themselves | `WhakapapaForm.vue:55` (commented out) | disabled | relationship, identity | |
| Profile editor | Sets who can see the record and what members may do with it: edit, view, or submit for review | `components/button/AccessButton.vue:44-60, 134-137`; `WhakapapaIndex.vue:147, 211` | unverified | permissions | |

## Single whakapapa (`.../whakapapa/:whakapapaId`)

Data shown: a whakapapa as a tree from a focus ancestor, or as a table, with
avatars. The side nav is hidden here (`ProfileShow.vue:24`). Who sees it:
whoever can see the record. What a member may change depends on the record's
permission: edit, view, or **submit**. In submit mode, changes become
proposals for kaitiaki (`DialogHandler.vue:198, 436-560`).

| Who | What | Where seen | Status | Kaupapa flag | Keep? |
|---|---|---|---|---|---|
| Member | Views a whakapapa as a tree from a focus ancestor | `views/WhakapapaShow.vue:120-127` | unverified | relationship | |
| Member | Moves the tree's focus up to an ancestor | `WhakapapaShow.vue:125`; `DialogHandler.vue` `set-focus-to-ancestor-of` | unverified | relationship | |
| Kaitiaki | Switches between tree and table views | `WhakapapaShow.vue:53-55, 128-133` | unverified | none | |
| Member | Searches for a person in the whakapapa, and filters (e.g. hide deceased) | `WhakapapaShow.vue:48-51`; `components/dialog/whakapapa/FilterMenu.vue:35` | unverified | none | |
| Member | Toggles avatars, extended family and auto-collapse in the tree | `FilterMenu.vue:80-113` | unverified | relationship | |
| Member | Exports the table as CSV or the tree as SVG | `WhakapapaShow.vue:58-67` | unverified | permissions | |
| Member | Opens a person in the tree to see their profile | `components/menu/NodeMenu.vue:4-6` | unverified | identity | |
| Member with edit rights | Adds a parent, partner, child or sibling to someone in the tree | `NodeMenu.vue:91-128`; `DialogHandler.vue:330-420` | unverified | relationship, identity | |
| Member with edit rights | Removes a person from this whakapapa only (they stay in the database) | `components/dialog/profile/RemovePersonDialog.vue:6-7`; `DialogHandler.vue:775-795` | unverified | relationship | |
| Member with edit rights | Deletes a person entirely (not themselves; the focus only if a successor exists) | `NodeMenu.vue:55-72`; `RemovePersonDialog.vue` | unverified | relationship, identity | |
| Member with edit rights | Chooses where someone who appears twice in a tree is drawn (their "important relationship") | `DialogHandler.vue:735-770`; `store/modules/whakapapa/index.mjs:118-135` | unverified | relationship | |
| Member on a submit-only whakapapa | Proposes adding or removing people and links, with a comment, for kaitiaki to review | `DialogHandler.vue:436-560`; `NodeMenu.vue:50, 83-90` | partial: adding a parent to the focus is blocked "until we cover that edge case" (`NodeMenu.vue:81-89`) | relationship, permissions | |
| Kaitiaki | Reviews proposed whakapapa changes and accepts or rejects them | `components/dialog/submission/ReviewSubmissionDialog.vue`; `NotificationPanel.vue` | unverified | relationship, permissions | |
| Kaitiaki | Edits a whakapapa's name, description, image and permission | `WhakapapaShow.vue:9-22`; `components/dialog/whakapapa/WhakapapaEditDialog.vue:85` | unverified | permissions | |
| Kaitiaki | Deletes a whakapapa record | `WhakapapaShow.vue:423-445` | unverified | sync | |

## Wallet (`.../wallet`)

Data shown: your digital membership credentials, one card per tribe that
issued one. A card shows your name, date of birth, issue date and status.
Who sees it: you, in your personal tribe only. The nav item appears only
when you hold a credential (`SideNavMenu.vue:223-225`).

| Who | What | Where seen | Status | Kaupapa flag | Keep? |
|---|---|---|---|---|---|
| Registered member | Holds a digital credential showing they are a registered member of a tribe | `components/wallet/WalletShow.vue:8-19`; `components/wallet/CredentialPreview.vue:35-80` | unverified. Smoke testing was left unchecked in ahau !974 ([cross_cutting.md:11](history/knowledge-base/cross_cutting.md)). | identity, permissions | |
| Registered member | Sends proof of that credential to an outside verifier using an invitation code | `CredentialPreview.vue:85-95`; `components/wallet/InputInviteDialog.vue:80-84` | unverified | identity | |
| Any person | Sees "No identity credentials found" when they have none | `WalletShow.vue:22-37` | unverified (the nav hides the page in this case) | none | |

---

## Open questions

1. **Does a returning person see the Pātaka dialog?** Answered in #61: no.
   After a restart, clicking your avatar goes straight to your profile,
   as the code says (`onboarded` starts as `true`, `Login.vue:107, 177`).
   The dialog shows only when you click yourself straight after creating
   your profile, in that session. That is the step #20 recorded
   (`old-app-capture/notes.md:8`). See `old-app-capture/notes.md`, "Open
   questions answered".
2. **Does "People" show in your personal tribe?** Answered in #61: no, not
   for a new identity. Your side nav is Profile, Archive and Whakapapa
   (`old-app-capture/11a-own-profile-desktop.png`). So your own profile
   doesn't list you as kaitiaki (`SideNavMenu.vue:247-252`), even though
   the page treats you as kaitiaki of your personal tribe
   (`store/root.mjs:62-64`).
3. **What could someone do on another person's page at
   `.../person/:profileId/profile`?** Nothing in the code sends anyone
   there except to your own profile. Was it ever used for other people?
4. **Did removing a kaitiaki ever save?** `processUpdateCommunity` only
   acts when `authors.add` is set (`ProfileShow.vue:216-223`).
5. **Who may edit or delete a collection?** `CollectionShow.vue` shows the
   controls to everyone. The backend's rule isn't visible from the UI.
6. **Did any of this work in the running app?** Partly answered in #61.
   Entering the app, your own profile, the empty Archive and Whakapapa, the
   empty tribe list and the app bar all loaded and navigated in v2.27.2,
   with no console errors. The rows those captures show are now "works
   (captured, v2.27.2)". One fault: the Archive's collections heading shows
   the untranslated key VIEWARCHIVE.COLLECTIONSTITLE, because
   `Archive.vue:19` doesn't call `$t`. Everything that needs data first (a
   tribe, a story, a whakapapa) is still unverified.
7. **Did kaitiaki actually use membership credentials (issuing, accepting,
   the wallet)?** They're behind a beta toggle (`TribeSettings.vue:47`).
8. **Is the 10-second re-fetch of tribes (`Appbar.vue:186`,
   `CommunitiesList.vue:78`) a product need or a workaround for SSB?** The
   v2 shell shouldn't copy it without knowing.
9. **What does "Join tribe" share?** Copying profile data into the
   registration (`lib/tribes-application-helpers.mjs`
   `copyProfileInformation`) isn't covered here. It needs its own look under
   identity rules.
