import test from 'node:test'
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

/**
 * Screens reach Holochain only through the profile client module, so the
 * app shell never imports Holochain client code itself.
 */

const appDir = fileURLToPath(new URL('../../src/app/', import.meta.url))

/** `from '@holochain/…'` (imports and re-exports), bare `import '@holochain/…'`, and `import('@holochain/…')`. */
function importsHolochain (source: string): boolean {
  return /(?:\bfrom|\bimport\s*\(?)\s*['"]@holochain\//.test(source)
}

test('boundary: every way of pulling in Holochain client code is caught', () => {
  for (const source of [
    "import { AppWebsocket } from '@holochain/client'",
    'import type { CellId } from "@holochain/client"',
    "import '@holochain/client'",
    "export { AppWebsocket } from '@holochain/client'",
    "export * from '@holochain/client'",
    "const m = await import('@holochain/client')",
    "import {\n  AppWebsocket\n} from\n  '@holochain/client'"
  ]) assert.ok(importsHolochain(source), source)
  assert.equal(importsHolochain("import { createDevProfileClient } from '../profile/dev-connection.js'"), false)
})

test('boundary: no file in the app shell imports Holochain client code', async () => {
  const files = await readdir(appDir, { recursive: true })
  const offenders: string[] = []
  for (const file of files) {
    if (!/\.(ts|svelte)$/.test(file)) continue
    const source = await readFile(join(appDir, file), 'utf8')
    if (importsHolochain(source)) offenders.push(file)
  }
  assert.deepEqual(offenders, [])
})
