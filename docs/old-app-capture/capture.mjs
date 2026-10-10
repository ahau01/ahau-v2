/**
 * Captures the old Āhau desktop app's top-level pages for #61 into
 * docs/old-app-capture/ (10-… onward): a fresh "Test" identity is created,
 * then the app is restarted and the returning launch screen, your own
 * profile, the empty Archive, Whakapapa and tribe list, and the app bar are
 * shot. Each PNG gets a JSON of its address and wording beside it, and
 * _console.json collects console errors. Not part of the build or tests.
 *
 *   # the old app: ahau01/ahau at eb4fb48, `npm install` in ui/ and desktop/
 *   tmp=$(mktemp -d) && cp docs/old-app-capture/capture.mjs "$tmp" \
 *     && (cd "$tmp" && npm i playwright-core@1.61)
 *   nix shell github:NixOS/nixpkgs/nixos-24.11#nodejs_18 -c \
 *     xvfb-run -a -s '-screen 0 1600x1000x24' \
 *     node "$tmp/capture.mjs" ~/projects/ahau "$PWD/docs/old-app-capture"
 *
 * Run from a scratch directory so playwright-core stays out of package.json.
 * playwright-core 1.61 is the last release that runs on Node 18.
 * Node 18 because the old app needs it: the script starts the old ui dev
 * server (:3000) itself if nothing is serving there. Electron 26 runs under
 * plain Xvfb, with no extra flags (it logs GPU errors and falls back to
 * software rendering). The window's 800px minimum width (from ssb-ahoy) is
 * lifted in memory for the narrow shots; a desktop user can't go below it.
 *
 * APP_NAME must be ahau-capture (the default). Before the first launch the
 * script deletes that one data folder, and refuses any other path, so your
 * real identity (ahau, ahau-dev) is never opened, changed or deleted.
 */
import { _electron as electron } from 'playwright-core'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { createConnection } from 'node:net'
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { homedir } from 'node:os'

const [oldRepo, out] = process.argv.slice(2).map(p => p && resolve(p))
if (!oldRepo || !out) throw Error('usage: node capture.mjs <old ahau repo> <output folder>')
const desktop = join(oldRepo, 'desktop')
const APP_NAME = process.env.APP_NAME ?? 'ahau-capture'

// The data folder, as desktop/ssb.config.js works it out.
const envPaths = createRequire(join(desktop, 'package.json'))('env-paths')
const dataDir = envPaths(APP_NAME, { suffix: '' }).data
const dataRoot = process.env.XDG_DATA_HOME || join(homedir(), '.local', 'share')
if (APP_NAME !== 'ahau-capture' || basename(dataDir) !== 'ahau-capture' || dirname(dataDir) !== dataRoot) {
  throw Error(`refusing to run: APP_NAME must be ahau-capture, and its data folder must be ${dataRoot}/ahau-capture (got APP_NAME=${APP_NAME}, ${dataDir})`)
}

// ahau-env's development ports: only one copy of the old app can run.
const portOpen = port => new Promise(ok => {
  const s = createConnection({ port, host: '127.0.0.1' })
  s.once('connect', () => { s.destroy(); ok(true) }).once('error', () => ok(false))
})
for (const [port, what] of [[18067, 'GraphQL'], [8067, 'SSB']]) {
  if (await portOpen(port)) throw Error(`port ${port} (${what}) is in use: another copy of the old app is running. Stop it first.`)
}

// The old ui dev server; started here, and stopped at the end, if not already up.
const devUp = async () => (await fetch('http://localhost:3000').catch(() => null))?.ok
let devServer
if (!await devUp()) {
  devServer = spawn('npm', ['run', 'dev'], { cwd: join(oldRepo, 'ui'), stdio: 'ignore', detached: true })
  for (let i = 0; !await devUp(); i++) {
    if (i > 60) throw Error('the ui dev server did not start on :3000')
    await new Promise(r => setTimeout(r, 1000))
  }
}

console.log(`deleting ${dataDir}`)
rmSync(dataDir, { recursive: true, force: true })

// Vuetify 2's breakpoints, for the layout each size must land in.
const SIZES = {
  desktop: { w: 1366, h: 768, ok: w => w >= 1280, band: 'lg (at least 1280)' },
  narrow: { w: 400, h: 800, ok: w => w < 600, band: 'xs (under 600)' },
  tablet: { w: 1000, h: 728, ok: w => w >= 960 && w < 1264, band: 'md (960-1264)' }
}

const consoleErrors = []
let app, page, size

async function launch () {
  app = await electron.launch({
    executablePath: join(desktop, 'node_modules/electron/dist/electron'),
    args: ['main.js'],
    cwd: desktop,
    env: { ...process.env, NODE_ENV: 'development', APP_NAME }
  })
  page = await app.firstWindow()
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push({ url: page.url(), text: m.text() }) })
  page.on('pageerror', e => consoleErrors.push({ url: page.url(), text: String(e) }))
  await resize('desktop')
}

async function resize (name) {
  size = name
  const { w, h } = SIZES[name]
  await app.evaluate(({ BrowserWindow }, [w, h]) => {
    const win = BrowserWindow.getAllWindows()[0]
    win.unmaximize()
    // ssb-ahoy sets minWidth 800, which a desktop user can't go below. Lifted
    // here, in memory only, so narrow shows the xs layout (the same ui/ code
    // as the Cordova mobile app).
    win.setMinimumSize(1, 1)
    win.setContentSize(w, h)
    // Keep rendering while unfocused under Xvfb, so waits that poll on
    // animation frames don't stall.
    win.webContents.setBackgroundThrottling(false)
  }, [w, h])
  await page.waitForFunction(w => window.innerWidth === w, w)
  await page.waitForTimeout(500)
}

// The side nav's element. Its scroll handler swaps the sideNav class for
// sticky (or the mobile ones) as the page scrolls, so match any of them.
const SIDE_NAV = ['sideNav', 'sticky', 'user', 'userMobile', 'stickyMobile', 'hideStickyMobile', 'archiveMobile'].map(c => `.row.${c}`).join(', ')

// Address and wording, as D5: from the page, with CSS text-transform applied.
async function dump (file, extra = {}) {
  const data = await page.evaluate(SIDE_NAV => {
    const text = sel => [...document.querySelectorAll(sel)].map(el => el.innerText.trim()).filter(Boolean)
    const route = document.querySelector('#app')?.__vue__?.$route
    return {
      address: { pathname: location.pathname, hash: location.hash, fullPath: route?.fullPath, routeName: route?.name },
      innerWidth: window.innerWidth,
      text: { appBar: text('header.v-app-bar'), sideNav: text(SIDE_NAV), main: text('main'), dialogs: text('.v-dialog--active'), body: document.body.innerText.trim() }
    }
  }, SIDE_NAV)
  writeFileSync(join(out, `${file}.json`), JSON.stringify({ file: `${file}.png`, size: { ...SIZES[size], ok: undefined, name: size }, ...data, ...extra }, null, 2))
}

async function checkSize (file) {
  const w = await page.evaluate(() => window.innerWidth)
  if (!SIZES[size].ok(w)) throw Error(`${file}: window.innerWidth is ${w}, outside the ${size} band ${SIZES[size].band}. Not saved.`)
}

async function shot (file, extra) {
  await checkSize(file)
  await page.screenshot({ path: join(out, `${file}.png`) })
  await dump(file, extra)
  console.log(`saved ${file}.png`)
}

// A page that scrolls is saved in parts: file, file-b, file-c, … At xs the
// old app scrolls <main> instead of the document, so scroll whichever overflows.
async function shotParts (file) {
  const scrollTo = y => page.evaluate(y => {
    const main = document.querySelector('main')
    const scrolls = main && /auto|scroll/.test(getComputedStyle(main).overflowY) && main.scrollHeight > main.clientHeight
    const el = scrolls ? main : document.scrollingElement
    el.scrollTop = y
    return { scroll: el.scrollHeight, view: el.clientHeight }
  }, y)
  const { scroll, view } = await scrollTo(0)
  const parts = Math.max(1, Math.ceil(scroll / view))
  for (let i = 0; i < parts; i++) {
    await scrollTo(i * view)
    await page.waitForTimeout(300)
    await shot(i ? `${file}-${String.fromCharCode(97 + i)}` : file, { part: `${i + 1} of ${parts}` })
  }
  await scrollTo(0)
}

// Images loaded and layout still: SSB start-up is slow, so wait on content.
async function settle () {
  await page.waitForFunction(() => [...document.images].every(img => img.complete))
  // Page transitions: wait until nothing in <main> has moved for 300ms.
  const layout = () => page.evaluate(() => [...document.querySelectorAll('main *')].map(el => {
    const r = el.getBoundingClientRect()
    return `${r.x},${r.y},${r.width},${r.height}`
  }).join(' '))
  for (let before = await layout(), i = 0; ; i++) {
    await page.waitForTimeout(300)
    const now = await layout()
    if (now === before) break
    if (i > 30) throw Error('the page layout did not settle')
    before = now
  }
}

// Your own profile, loaded: your full name and the first section. (The
// launch screen also renders inside <main>, so "Test" alone isn't enough.)
async function ownProfile () {
  await page.waitForURL(/\/person\/[^/]+\/profile$/)
  await page.getByText('Test User', { exact: true }).first().waitFor()
  await page.getByText(/profile information/i).waitFor()
  await settle()
}

const step = async (what, fn) => {
  try { await fn() } catch (err) {
    console.error(`FAILED: ${what}\n${err.message}`)
    await page?.screenshot({ path: join(out, `_failed-${what.replace(/\W+/g, '-')}.png`) }).catch(() => {})
    throw err
  }
}

try {
  // A new identity: the "Test" profile, with #20's values, then skip the Pātaka screen.
  await launch()
  await step('create profile', async () => {
    await page.getByRole('button', { name: /who are you/i }).click()
    const form = page.locator('.v-dialog--active')
    const box = name => form.getByRole('textbox', { name, exact: true })
    // Vuetify v-select: open the field, then pick from its menu, scrolling
    // it until the option renders (the menu adds items as it scrolls).
    const pick = async (name, value) => {
      await form.getByRole('button', { name, exact: true }).click()
      const menu = page.locator('.menuable__content__active')
      const option = menu.getByRole('option', { name: value, exact: true })
      for (let i = 0; !await option.count(); i++) {
        if (i > 50) throw Error(`no "${value}" in the ${name} menu`)
        await menu.evaluate(el => { el.scrollTop = el.scrollHeight })
        await page.waitForTimeout(100)
      }
      await option.click()
    }
    await box('First name / known as').fill('Test')
    await form.getByRole('spinbutton', { name: 'Order of birth' }).fill('1')
    await form.getByText('Other', { exact: true }).click()
    await box('Full name').fill('Test User')
    await form.getByText('Add another name', { exact: true }).click()
    await box('Also known as').fill('Tester')
    await pick('Day', '01')
    await pick('Month', 'January')
    await pick('Year', '1990')
    await box('Place of birth').fill('Auckland')
    await form.getByRole('textbox', { name: /^About/ }).fill('Test profile for screenshots')
    await box('Profession').fill('Developer')
    await form.getByText('Add skill/qualification', { exact: true }).click()
    await box('Skill/qualification').fill('Te reo Māori')
    await form.getByText('Add a place of education', { exact: true }).click()
    await box('Place of education').fill('Test School')
    for (const [name, value] of [['Email', 'test@example.com'], ['Phone', '021 000 0000'], ['Address', '1 Test Street'], ['Postcode', '1010'], ['City', 'Auckland'], ['Country', 'Aotearoa']]) await box(name).fill(value)
    await form.getByRole('button', { name: 'Save' }).click()
    // Saving returns to the launch screen; clicking yourself opens the Pātaka screen.
    await page.getByText('Test', { exact: true }).click()
    await page.getByRole('button', { name: /skip for now/i }).click()
    await ownProfile()
  })
  await app.close()

  // Returning: the launch screen with your avatar and name, then Q1 (D7).
  await launch()
  await step('returning launch', async () => {
    const me = page.getByText('Test', { exact: true })
    await me.waitFor()
    await settle()
    await shot('10-returning-launch')
    await me.click()
    await page.waitForFunction(() => location.pathname.includes('/person/') || /skip for now/i.test(document.body.innerText))
    const patakaShown = !page.url().includes('/person/')
    if (patakaShown) {
      await settle()
      await shot('10b-returning-pataka')
      await page.getByRole('button', { name: /skip for now/i }).click()
    }
    const json = join(out, '10-returning-launch.json')
    writeFileSync(json, JSON.stringify({ ...JSON.parse(readFileSync(json)), q1PatakaShownOnAvatarClick: patakaShown }, null, 2))
    console.log(`Q1: Pātaka screen ${patakaShown ? 'shown' : 'not shown'} to a returning person`)
    await ownProfile()
  })

  const appBar = page.getByRole('banner')

  await step('own profile', async () => {
    await shotParts('11a-own-profile-desktop')
    await resize('narrow')
    await ownProfile()
    await shotParts('11b-own-profile-narrow')
    await resize('tablet')
    await ownProfile()
    await shotParts('11c-own-profile-tablet')
    await resize('desktop')
    await ownProfile()
  })

  await step('app bar', async () => {
    await checkSize('15-app-bar')
    await appBar.screenshot({ path: join(out, '15-app-bar.png') })
    await dump('15-app-bar', { ariaSnapshot: await appBar.ariaSnapshot() })
    console.log('saved 15-app-bar.png')
  })

  // Each side-nav page, opened from the side nav; the profile between each.
  const navPages = [
    ['Archive', /\/archive$/, '12-personal-archive-empty'],
    ['Whakapapa', /\/whakapapa$/, '13-personal-whakapapa-empty'],
    ['People', /\/person$/, '16-people'],
    ['Wallet', /\/wallet$/, '17-wallet']
  ]
  for (const [label, route, file] of navPages) {
    await step(label, async () => {
      const button = page.getByRole('button', { name: label, exact: true })
      if (!await button.count()) return console.log(`${label}: not in your side nav, skipped`)
      await button.click()
      await page.waitForURL(route)
      await settle()
      await shot(file)
      await page.getByRole('button', { name: 'Profile', exact: true }).click()
      await ownProfile()
    })
  }

  // The tribe list, through the app bar's "+".
  await step('tribes', async () => {
    await appBar.getByRole('link', { name: '+' }).click()
    await page.waitForURL(/\/tribe$/)
    await settle()
    await shot('14-tribes-empty')
  })
  await app.close()
} finally {
  await app?.close().catch(() => {})
  writeFileSync(join(out, '_console.json'), JSON.stringify(consoleErrors, null, 2))
  if (devServer) process.kill(-devServer.pid)
}
