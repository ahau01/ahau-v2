import test from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

import { runScenario } from '@holochain/tryorama'

import { createProfileClient } from './client.js'

/**
 * Real-conductor tests for the profile client module. They need the
 * Holochain dev environment (`nix develop`) and run with
 * `npm run test:conductor`, not `npm test`.
 */

const happ = fileURLToPath(new URL('../../workdir/ahau.happ', import.meta.url))

test('promise: waitUntilReady resolves ready when the conductor is running the app', async () => {
  await runScenario(async scenario => {
    const player = await scenario.addPlayerWithApp({
      appBundleSource: { type: 'path', value: happ }
    })
    const port = await player.conductor.attachAppInterface({ port: 0, allowed_origins: 'ahau-test' })
    const { token } = await player.conductor.adminWs()
      .issueAppAuthenticationToken({ installed_app_id: player.appId })

    const client = createProfileClient({
      url: new URL(`ws://127.0.0.1:${port}`),
      appToken: token,
      origin: 'ahau-test'
    })

    assert.deepEqual(await client.waitUntilReady(), { status: 'ready' })
  })
})

test('promise: waitUntilReady reports failed to start when the conductor is not running', async () => {
  await runScenario(async scenario => {
    const player = await scenario.addPlayerWithApp({
      appBundleSource: { type: 'path', value: happ }
    })
    const port = await player.conductor.attachAppInterface({ port: 0, allowed_origins: 'ahau-test' })
    const { token } = await player.conductor.adminWs()
      .issueAppAuthenticationToken({ installed_app_id: player.appId })
    await player.conductor.shutDown()

    const client = createProfileClient({
      url: new URL(`ws://127.0.0.1:${port}`),
      appToken: token,
      origin: 'ahau-test',
      timeoutMs: 2000
    })

    const readiness = await client.waitUntilReady()
    assert.equal(readiness.status, 'failed')
    assert.ok(readiness.status === 'failed' && readiness.reason.length > 0, 'says why')
  })
})
