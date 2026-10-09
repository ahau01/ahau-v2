# Asset provenance

Every file here is copied unchanged from the old Āhau app, using `git show` at a
fixed commit so no local edits came along. They were taken from the old app's
own source rather than from `ahau-styles`, so they don't depend on that
extraction being right.

- **Repo:** `ahau-monorepo`
- **Commit:** `6e0a66edd7786649818055a094b7e7ca4aaa7840`
- **Licence:** AGPL-3.0, as `apps/ahau/ui` declares. Āhau v2's own licence is
  undecided (#21) and must be settled before these ship.

| File | Old app path | Used for there | Used for here |
|---|---|---|---|
| `niho.svg` | `apps/ahau/ui/src/assets/niho.svg` | `body.page--login` background (`src/App.vue`) | Launch screen background |
| `logo_red.svg` | `apps/ahau/ui/src/assets/logo_red.svg` | Loading splash (`src/views/Login.vue`) | Launch screen while starting |
| `bg-tohu.webp` | `apps/ahau/ui/src/assets/bg-tohu.webp` | Dialog title banner (`src/components/dialog/DialogTitleBanner.vue`) | Create-profile header |
| `tane.svg`, `tane-outlined.svg` | `apps/ahau/ui/src/assets/` | "Male" button, selected / not (`src/components/profile/ProfileForm.vue`) | Same |
| `wahine.svg`, `wahine-outlined.svg` | `apps/ahau/ui/src/assets/` | "Female" button, selected / not (same file) | Same |
| `account-fill.svg`, `account-outlined.svg` | `apps/ahau/ui/src/assets/` | "Other" button, selected / not (same file) | Same |

The captures in `docs/old-app-capture/` came from the GitLab repo at
`f257cf1e` (v2.27.2), not from this monorepo commit. The files above were
compared against those captures by eye in the parity check
(`docs/design-parity.md`). They were not compared byte for byte.

## Icons

`src/app/first-launch/icons.ts` holds four Material Design Icons (close, plus,
delete, camera). The old app showed these through `@mdi/font` `^5.9.55`
(`apps/ahau/ui/package.json`). Their path data is copied from `@mdi/svg`
5.9.55 (`svg/<name>.svg`, npm tarball), the same icon set and version.
Licence: Apache-2.0 / Pictogrammers Free License.
