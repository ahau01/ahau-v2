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
| Date of birth | Optional | Dropdowns: Day / Month / Year | Once any part is picked, the rest become required |
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