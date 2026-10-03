import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer, type Socket } from 'node:net'
import { fileURLToPath } from 'node:url'

import { runScenario, type PlayerApp } from '@holochain/tryorama'

import { createProfileClient, type ProfileClient } from './client.js'

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
    await client.close()
  })
})

test('promise: waitUntilReady can be called again on the same client', async () => {
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
      origin: 'ahau-test',
      timeoutMs: 2000
    })

    assert.deepEqual(await client.waitUntilReady(), { status: 'ready' })
    assert.deepEqual(await client.waitUntilReady(), { status: 'ready' })
    await client.close()
  })
})

test('promise: waitUntilReady resolves ready once a conductor that was still starting becomes reachable', async () => {
  await runScenario(async scenario => {
    const player = await scenario.addPlayerWithApp({
      appBundleSource: { type: 'path', value: happ }
    })
    const { token } = await player.conductor.adminWs()
      .issueAppAuthenticationToken({ installed_app_id: player.appId })
    const port = await freePort()

    const client = createProfileClient({
      url: new URL(`ws://127.0.0.1:${port}`),
      appToken: token,
      origin: 'ahau-test',
      timeoutMs: 10_000
    })

    // Nothing is listening yet: the app interface opens after the client starts trying.
    const readiness = client.waitUntilReady()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await player.conductor.attachAppInterface({ port, allowed_origins: 'ahau-test' })

    assert.deepEqual(await readiness, { status: 'ready' })
    await client.close()
  })
})

test('promise: waitUntilReady fails at once, naming the token, when the conductor rejects it', async () => {
  await runScenario(async scenario => {
    const player = await scenario.addPlayerWithApp({
      appBundleSource: { type: 'path', value: happ }
    })
    const port = await player.conductor.attachAppInterface({ port: 0, allowed_origins: 'ahau-test' })

    const client = createProfileClient({
      url: new URL(`ws://127.0.0.1:${port}`),
      appToken: [1, 2, 3],
      origin: 'ahau-test',
      timeoutMs: 10_000
    })

    const started = Date.now()
    const readiness = await client.waitUntilReady()
    assert.equal(readiness.status, 'failed')
    assert.ok(Date.now() - started < 5000, 'does not retry a rejected token until the deadline')
    assert.match(readiness.status === 'failed' ? readiness.reason : '', /app authentication token/)
    assert.doesNotMatch(readiness.status === 'failed' ? readiness.reason : '', /did not start/)
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
    assert.match(readiness.status === 'failed' ? readiness.reason : '', /^Holochain did not start:/)
  })
})

test('promise: waitUntilReady reports failed when the app is installed but disabled', async () => {
  await runScenario(async scenario => {
    const player = await scenario.addPlayerWithApp({
      appBundleSource: { type: 'path', value: happ }
    })
    const port = await player.conductor.attachAppInterface({ port: 0, allowed_origins: 'ahau-test' })
    const admin = player.conductor.adminWs()
    const { token } = await admin.issueAppAuthenticationToken({ installed_app_id: player.appId })
    await admin.disableApp({ installed_app_id: player.appId })

    const client = createProfileClient({
      url: new URL(`ws://127.0.0.1:${port}`),
      appToken: token,
      origin: 'ahau-test',
      timeoutMs: 2000
    })

    const readiness = await client.waitUntilReady()
    assert.equal(readiness.status, 'failed')
    assert.match(readiness.status === 'failed' ? readiness.reason : '', /disabled/)
    await client.close()
  })
})

test('promise: waitUntilReady reports failed within timeoutMs when the port accepts but never answers', async () => {
  // Accepts TCP connections and then says nothing, so the WebSocket upgrade never completes.
  const sockets: Socket[] = []
  const silent = createServer(socket => { sockets.push(socket) })
  await new Promise<void>(resolve => silent.listen(0, '127.0.0.1', resolve))
  const address = silent.address()
  if (address === null || typeof address === 'string') throw new Error('no TCP port')

  const client = createProfileClient({
    url: new URL(`ws://127.0.0.1:${address.port}`),
    origin: 'ahau-test',
    timeoutMs: 1000
  })

  try {
    const outcome = await Promise.race([
      client.waitUntilReady(),
      new Promise(resolve => setTimeout(() => resolve('still waiting'), 5000).unref())
    ])
    assert.equal(outcome === 'still waiting' ? outcome : (outcome as { status: string }).status, 'failed')
  } finally {
    for (const socket of sockets) socket.destroy()
    await new Promise(resolve => silent.close(resolve))
  }
})

test('promise: get my profile returns none before I have created one', async () => {
  await runScenario(async scenario => {
    const player = await scenario.addPlayerWithApp({
      appBundleSource: { type: 'path', value: happ }
    })
    const client = await readyClientFor(player)

    assert.deepEqual(await client.getMyProfile(), { status: 'none' })
    await client.close()
  })
})

/** A profile client connected to this player's app, ready to use. */
async function readyClientFor (player: PlayerApp): Promise<ProfileClient> {
  const port = await player.conductor.attachAppInterface({ port: 0, allowed_origins: 'ahau-test' })
  const { token } = await player.conductor.adminWs()
    .issueAppAuthenticationToken({ installed_app_id: player.appId })
  const client = createProfileClient({
    url: new URL(`ws://127.0.0.1:${port}`),
    appToken: token,
    origin: 'ahau-test'
  })
  assert.deepEqual(await client.waitUntilReady(), { status: 'ready' })
  return client
}

/** A local port nothing is listening on right now. */
async function freePort (): Promise<number> {
  const server = createServer()
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  await new Promise(resolve => server.close(resolve))
  if (address === null || typeof address === 'string') throw new Error('no TCP port')
  return address.port
}
