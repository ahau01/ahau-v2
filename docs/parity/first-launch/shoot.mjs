/**
 * Retakes docs/parity/first-launch/*.png: the v2 screens at the same sizes and
 * with the same data as docs/old-app-capture. Not part of the build or tests.
 *
 *   npm run dev                          # serves the app on :5173
 *   tmp=$(mktemp -d) && cp docs/parity/first-launch/shoot.mjs "$tmp" \
 *     && (cd "$tmp" && npm i playwright-core@1)
 *   CHROMIUM=$(nix build nixpkgs#chromium --no-link --print-out-paths)/bin/chromium \
 *     node "$tmp/shoot.mjs" "$PWD/docs/parity/first-launch"
 *
 * Run from a scratch directory so playwright-core stays out of package.json.
 */
import { chromium } from 'playwright-core'
const out = process.argv[2]
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM })
const url = process.env.APP_URL ?? 'http://localhost:5173/?pretend'

// Launch, as 01-launch.png: maximised 1900x1010.
let page = await browser.newPage({ viewport: { width: 1900, height: 1010 } })
await page.goto(url); await page.evaluate(() => localStorage.clear()); await page.reload()
await page.getByRole('button', { name: /who are you/i }).waitFor()
await page.screenshot({ path: `${out}/01-launch.png` })
await page.close()

// The form, at the capture's ~1000x728.
page = await browser.newPage({ viewport: { width: 1000, height: 728 } })
await page.goto(url); await page.evaluate(() => localStorage.clear()); await page.reload()
await page.getByRole('button', { name: /who are you/i }).click()
await page.getByRole('dialog').waitFor()
const body = page.locator('.body')
const shot = async (name, scroll) => { await body.evaluate((el, s) => { el.scrollTop = s === 'bottom' ? el.scrollHeight : s }, scroll); await page.waitForTimeout(150); await page.screenshot({ path: `${out}/${name}.png` }) }
await shot('02a-create-profile-empty-top', 0)
await shot('02b-create-profile-empty-middle', 500)
await shot('02c-create-profile-empty-bottom', 'bottom')

const box = name => page.getByRole('textbox', { name, exact: true })
// Scrolled so this box sits just under the dialog's title, as in 02e and 02f.
const shotFrom = async (name, label) => {
  const top = await box(label).evaluate(el => {
    const body = el.closest('.body')
    return el.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 12
  })
  await shot(name, top)
}
const freshForm = async () => {
  await page.getByRole('button', { name: 'Cancel' }).click()
  await page.getByRole('button', { name: /who are you/i }).click()
  await page.getByRole('dialog').waitFor()
}

// One box added to an empty form, as 02d, 02e and 02f.
await page.getByRole('button', { name: 'Add another name' }).click()
await page.locator(':focus').evaluate(el => el.blur())
await shot('02d-add-another-name', 0)
await freshForm()
await page.getByRole('button', { name: 'Add skill/qualification' }).click()
await page.locator(':focus').evaluate(el => el.blur())
await shotFrom('02e-add-skill', 'Place of birth')
await freshForm()
await page.getByRole('button', { name: 'Add a place of education' }).click()
await page.locator(':focus').evaluate(el => el.blur())
await shotFrom('02f-add-education', 'Place of birth')
await freshForm()

await box('First name / known as').fill('Test')
await box('Order of birth').fill('1')
await page.getByText('Other', { exact: true }).click()
await box('Full name').fill('Test User')
await page.getByRole('button', { name: 'Add another name' }).click()
await box('Also known as').fill('Tester')
await page.getByRole('combobox', { name: 'Day' }).selectOption('01')
await page.getByRole('combobox', { name: 'Month' }).selectOption('01')
await page.getByRole('combobox', { name: 'Year' }).selectOption('1990')
await box('Place of birth').fill('Auckland')
await box('About Test').fill('Test profile for screenshots')
await box('Profession').fill('Developer')
await page.getByRole('button', { name: 'Add skill/qualification' }).click()
await box('Skill/qualification').fill('Te reo Māori')
await page.getByRole('button', { name: 'Add a place of education' }).click()
await box('Place of education').fill('Test School')
for (const [n, v] of [['Email','test@example.com'],['Phone','0210000000'],['Address','1 test street'],['Postcode','1010'],['City','Auckland'],['Country','Aotearoa']]) await box(n).fill(v)
await page.locator(':focus').evaluate(el => el.blur())
await shot('03a-create-profile-filled-top', 0)
await shot('03b-create-profile-filled-middle', 470)
await shot('03c-create-profile-filled-bottom', 'bottom')

// Date of birth error, as 04a: day and month, no year.
await page.getByRole('combobox', { name: 'Year' }).selectOption('')
await page.getByRole('button', { name: 'Save' }).click()
await page.getByText('Please specify a year', { exact: true }).waitFor()
await page.locator('fieldset.date').screenshot({ path: `${out}/04a-error-date-of-birth.png` })

// Date of birth error, as 04b: day only.
await page.getByRole('combobox', { name: 'Month' }).selectOption('')
await page.getByRole('combobox', { name: 'Year' }).selectOption('')
await page.getByRole('button', { name: 'Save' }).click()
await page.getByText('Please specify a year and month').waitFor()
await page.locator('fieldset.date').screenshot({ path: `${out}/04b-error-date-of-birth.png` })
await browser.close()
