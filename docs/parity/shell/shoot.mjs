/**
 * Retakes docs/parity/shell/*.png: the v2 shell at the same sizes and with
 * the same data as docs/old-app-capture's #61 set. Not part of the build or
 * tests.
 *
 *   npm run dev                          # serves the app on :5173
 *   tmp=$(mktemp -d) && cp docs/parity/shell/shoot.mjs "$tmp" \
 *     && (cd "$tmp" && npm i playwright-core@1)
 *   CHROMIUM=$(nix build nixpkgs#chromium --no-link --print-out-paths)/bin/chromium \
 *     node "$tmp/shoot.mjs" "$PWD/docs/parity/shell"
 *
 * Run from a scratch directory so playwright-core stays out of package.json.
 */
import { chromium } from 'playwright-core'
const out = process.argv[2]
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM })
const url = process.env.APP_URL ?? 'http://localhost:5173/?pretend'

/** A fresh profile, filled in as the #61 captures' own data (notes.md), through the avatar step. */
async function createProfile (width, height) {
  const page = await browser.newPage({ viewport: { width, height } })
  await page.goto(url); await page.evaluate(() => localStorage.clear()); await page.reload()
  await page.getByRole('button', { name: /who are you/i }).click()
  const box = name => page.getByRole('textbox', { name, exact: true })
  await box('First name / known as').fill('Test')
  await box('Order of birth').fill('1')
  await page.getByText('Other', { exact: true }).click()
  await box('Full name').fill('Test User')
  await page.getByRole('button', { name: 'Add another name' }).click()
  await box('Also known as').fill('Tester')
  const dateOfBirth = page.getByRole('group', { name: 'Date of birth' })
  await dateOfBirth.getByRole('combobox', { name: 'Day' }).selectOption('01')
  await dateOfBirth.getByRole('combobox', { name: 'Month' }).selectOption('01')
  await dateOfBirth.getByRole('combobox', { name: 'Year' }).selectOption('1990')
  await box('Place of birth').fill('Auckland')
  await box('About Test').fill('Test profile for screenshots')
  await box('Profession').fill('Developer')
  await page.getByRole('button', { name: 'Add skill/qualification' }).click()
  await box('Skill/qualification').fill('Te reo Māori')
  await page.getByRole('button', { name: 'Add a place of education' }).click()
  await box('Place of education').fill('Test School')
  for (const [n, v] of [['Email', 'test@example.com'], ['Phone', '021 000 0000'], ['Address', '1 Test Street'], ['Postcode', '1010'], ['City', 'Auckland'], ['Country', 'Aotearoa']]) await box(n).fill(v)
  await page.getByRole('button', { name: 'Save' }).click()
  await page.getByRole('button', { name: 'Test' }).waitFor()
  return page
}

// 10-returning-launch.png: the avatar step, as the old app shows it after a restart.
let page = await createProfile(1366, 768)
await page.screenshot({ path: `${out}/10-returning-launch.png` })

// 11a-own-profile-desktop.png: going in lands on the profile page.
await page.keyboard.press('Enter')
await page.getByRole('heading', { level: 1, name: 'Test' }).waitFor()
await page.screenshot({ path: `${out}/11a-own-profile-desktop.png`, fullPage: true })

// 15-app-bar.png: the app bar, cropped.
await page.screenshot({ path: `${out}/15-app-bar.png`, clip: { x: 0, y: 0, width: 1366, height: 64 } })

// 12-personal-archive-empty.png, 13-personal-whakapapa-empty.png: the side nav's other sections.
await page.getByRole('navigation', { name: 'Your space' }).getByRole('link', { name: 'Archive' }).click()
await page.getByRole('heading', { level: 1, name: 'Archive' }).waitFor()
await page.screenshot({ path: `${out}/12-personal-archive-empty.png` })
await page.getByRole('navigation', { name: 'Your space' }).getByRole('link', { name: 'Whakapapa' }).click()
await page.getByRole('heading', { level: 1, name: 'Whakapapa' }).waitFor()
await page.screenshot({ path: `${out}/13-personal-whakapapa-empty.png` })

// 14-tribes-empty.png: the tribe list, from the top bar's "+".
await page.getByRole('link', { name: 'Add tribes' }).click()
await page.getByRole('heading', { level: 1, name: 'Tribes' }).waitFor()
await page.screenshot({ path: `${out}/14-tribes-empty.png` })
await page.close()

// 11b-own-profile-narrow.png: the profile page at the narrow capture's size.
page = await createProfile(400, 800)
await page.keyboard.press('Enter')
await page.getByRole('heading', { level: 1, name: 'Test' }).waitFor()
await page.screenshot({ path: `${out}/11b-own-profile-narrow.png`, fullPage: true })
await page.close()

await browser.close()
