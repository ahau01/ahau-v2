import test from 'node:test'
import assert from 'node:assert/strict'

import { createProfileClient } from './client.js'

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
