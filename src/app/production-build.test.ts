// @vitest-environment node
import { expect, test } from 'vitest'
import { build, type Rollup } from 'vite'

/**
 * What a production build actually ships, not what the source says. The
 * pretend client is DEV ONLY: in a real build `?pretend` must do nothing,
 * so its code must not be in the bundle at all.
 */

test('production build: the pretend client is left out, so ?pretend does nothing', async () => {
  const output = await productionBuild()
  const code = output.output.map(file => file.type === 'chunk' ? file.code : '').join('\n')

  // Booleans, so a failure doesn't print the whole bundle.
  expect(code.includes('ahau'), 'the build produced the app').toBe(true)
  expect(code.includes('ahau:pretend-profile'), 'pretend storage key in the bundle').toBe(false)
  expect(code.includes('Pretend Holochain'), 'pretend failure text in the bundle').toBe(false)
}, 60_000)

/**
 * Build as `npm run build:app` does. Vite takes `import.meta.env.DEV` from
 * NODE_ENV, not the mode, and Vitest sets NODE_ENV to `test`, which would
 * build with DEV on.
 */
async function productionBuild (): Promise<Rollup.RollupOutput> {
  const nodeEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'
  try {
    return await build({ logLevel: 'silent', build: { write: false } }) as Rollup.RollupOutput
  } finally {
    process.env.NODE_ENV = nodeEnv
  }
}
