import test from 'node:test'
import assert from 'node:assert/strict'
import { AppWebsocket } from '@holochain/client'

import { createWhakapapaClient, WHAKAPAPA_NEEDS_PROFILE } from './client.js'

test('client calls the whakapapa zome and returns the saved account', async t => {
  const saved = { relatives: [], relationships: [] }
  const connection = {
    appInfo: async () => ({ status: { type: 'enabled' } }),
    client: { close: async () => {} },
    callZome: async () => saved
  } as unknown as AppWebsocket
  t.mock.method(AppWebsocket, 'connect', async () => connection)
  const client = createWhakapapaClient()
  assert.deepEqual(await client.waitUntilReady(), { status: 'ready' })
  assert.deepEqual(await client.addRelative({ name: 'Mere', direction: 'Parent', of: 'Me' }), {
    status: 'added', whakapapa: saved
  })
  assert.deepEqual(await client.getWhakapapa(), saved)
  await client.close()
})

test('client reuses a ready connection on repeated readiness checks', async t => {
  const connection = {
    appInfo: async () => ({ status: { type: 'enabled' } }),
    client: { close: async () => {} },
    callZome: async () => null
  } as unknown as AppWebsocket
  let connects = 0
  t.mock.method(AppWebsocket, 'connect', async () => {
    connects += 1
    return connection
  })
  const client = createWhakapapaClient()
  assert.deepEqual(await client.waitUntilReady(), { status: 'ready' })
  assert.deepEqual(await client.waitUntilReady(), { status: 'ready' })
  assert.equal(connects, 1)
  await client.close()
})

test('client readiness fails when a websocket never answers', async t => {
  t.mock.method(AppWebsocket, 'connect', () => new Promise<AppWebsocket>(() => {}))
  const client = createWhakapapaClient({ timeoutMs: 5 })
  assert.deepEqual(await client.waitUntilReady(), {
    status: 'failed', reason: 'Holochain did not answer before the timeout'
  })
})

test('client reports the shared profile-required refusal as a plain reason', async t => {
  const connection = {
    appInfo: async () => ({ status: { type: 'enabled' } }),
    client: { close: async () => {} },
    callZome: async () => { throw new Error(`Validation failed while committing: ${WHAKAPAPA_NEEDS_PROFILE}`) }
  } as unknown as AppWebsocket
  t.mock.method(AppWebsocket, 'connect', async () => connection)
  const client = createWhakapapaClient()
  await client.waitUntilReady()
  assert.deepEqual(await client.addRelative({ name: 'Mere', direction: 'Parent', of: 'Me' }), {
    status: 'failed', reason: WHAKAPAPA_NEEDS_PROFILE
  })
})
