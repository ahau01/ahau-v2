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

test('boundary: no file in the app shell imports Holochain client code', async () => {
  const files = await readdir(appDir, { recursive: true })
  const offenders: string[] = []
  for (const file of files) {
    if (!/\.(ts|svelte)$/.test(file)) continue
    const source = await readFile(join(appDir, file), 'utf8')
    if (/from\s+['"]@holochain\//.test(source) || /import\(\s*['"]@holochain\//.test(source)) offenders.push(file)
  }
  assert.deepEqual(offenders, [])
})
