import test from 'node:test'
import assert from 'node:assert/strict'

import { runScenario, type PlayerApp } from '@holochain/tryorama'

import { createDevProfileClient, issueDevConnection } from '../profile/dev-connection.js'
import { happ } from '../profile/conductor-harness.js'
import { completeProfile } from '../profile/client.js'
import { createFirstLaunch, emptyProfileForm } from './first-launch.js'

/**
 * First launch against a real conductor, wired the way `npm run dev` wires
 * the app: the dev server issues connection details from the admin port,
 * and the page's profile client uses them. Run with `npm run test:conductor`.
 */

/** A profile client connected the way the app is in dev. */
async function devClient (player: PlayerApp) {
  const port = await player.conductor.attachAppInterface({ port: 0, allowed_origins: 'ahau-test' })
  const adminUrl = player.conductor.adminWs().client.url
  if (!adminUrl) throw new Error('the admin websocket has no url')
  return createDevProfileClient({
    url: new URL(`ws://127.0.0.1:${port}`),
    origin: 'ahau-test',
    timeoutMs: 10_000,
    // Through JSON, as the dev server sends it to the page.
    fetchConnection: async () => JSON.parse(JSON.stringify(
      await issueDevConnection({ adminUrl, adminOrigin: 'tryorama-interface', appId: player.appId })
    ))
  })
}

test('first launch on Holochain: a new agent creates a profile, sees the avatar step and goes in', async () => {
  await runScenario(async scenario => {
    const player = await scenario.addPlayerWithApp({
      appBundleSource: { type: 'path', value: happ }
    })
    const client = await devClient(player)
    const firstLaunch = createFirstLaunch(client)

    await firstLaunch.start()
    assert.deepEqual(firstLaunch.state, { kind: 'welcome' })
    firstLaunch.begin()

    await firstLaunch.submit({ ...emptyProfileForm(), name: 'Mere' })
    assert.deepEqual(firstLaunch.state, { kind: 'has-profile', profile: completeProfile({ name: 'Mere' }) })

    firstLaunch.enter()
    assert.deepEqual(firstLaunch.state, { kind: 'ready', profile: completeProfile({ name: 'Mere' }) })
    await client.close()
  })
})

test('first launch on Holochain: opening the app again as the same agent shows the avatar step, then goes in', async () => {
  await runScenario(async scenario => {
    const player = await scenario.addPlayerWithApp({
      appBundleSource: { type: 'path', value: happ }
    })
    const first = await devClient(player)
    const firstOpen = createFirstLaunch(first)
    await firstOpen.start()
    firstOpen.begin()
    await firstOpen.submit({ ...emptyProfileForm(), name: 'Mere' })
    firstOpen.enter()
    await first.close()

    // A reload: a new page, new connection details, the same agent key.
    const again = await devClient(player)
    const reopened = createFirstLaunch(again)
    await reopened.start()
    assert.deepEqual(reopened.state, { kind: 'has-profile', profile: completeProfile({ name: 'Mere' }) })

    reopened.enter()
    assert.deepEqual(reopened.state, { kind: 'ready', profile: completeProfile({ name: 'Mere' }) })
    await again.close()
  })
})
