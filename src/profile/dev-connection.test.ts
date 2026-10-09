import test from 'node:test'
import assert from 'node:assert/strict'

import { createDevProfileClient } from './dev-connection.js'

/**
 * The dev profile client when the dev server can't reach the conductor.
 * No conductor needed: the dev server's answer is stubbed.
 */

test('dev connection: when the conductor is not running, the client reports failed, not a hang', async () => {
  const client = createDevProfileClient({
    url: new URL('ws://127.0.0.1:1'),
    fetchConnection: async () => { throw new Error('connect ECONNREFUSED 127.0.0.1:4444') }
  })

  const readiness = await client.waitUntilReady()

  assert.equal(readiness.status, 'failed')
})
