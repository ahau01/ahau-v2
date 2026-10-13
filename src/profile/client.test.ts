import test from 'node:test'
import assert from 'node:assert/strict'
import { AppWebsocket } from '@holochain/client'

import { completeProfile, createProfileClient, PROFILE_FUNCTIONS } from './client.js'

/**
 * Profile client behaviour that needs no conductor. TypeScript client
 * integration tests against a real conductor are deferred; Sweettest covers
 * the Rust zome guarantees separately.
 */

const NOT_CONNECTED = 'Not connected to Holochain: call waitUntilReady first'

test('promise: getMyProfile before waitUntilReady fails with a plain reason', async () => {
  const client = createProfileClient()

  await assert.rejects(client.getMyProfile(), { message: NOT_CONNECTED })
})

test('promise: createMyProfile before waitUntilReady reports failed, not a validation reason', async () => {
  const client = createProfileClient()

  assert.deepEqual(
    await client.createMyProfile({ name: 'Mere' }),
    { status: 'failed', reason: NOT_CONNECTED }
  )
})

test('promise: updateMyProfile reports the updated result and saved profile', async t => {
  const saved = completeProfile({ name: 'Mere Rangi' })
  const connection = {
    appInfo: async () => ({ status: { type: 'enabled' } }),
    client: { close: async () => {} },
    callZome: async () => saved
  } as unknown as AppWebsocket
  t.mock.method(AppWebsocket, 'connect', async () => connection)
  const client = createProfileClient()

  await client.waitUntilReady()

  assert.deepEqual(await client.updateMyProfile({ name: 'Mere Rangi' }), {
    status: 'updated',
    profile: saved
  })
})

test('the dev signing grant lists exactly the profile functions the client calls', () => {
  assert.deepEqual(PROFILE_FUNCTIONS, ['get_my_profile', 'create_my_profile', 'update_my_profile'])
})
