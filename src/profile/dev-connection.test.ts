import test from 'node:test'
import assert from 'node:assert/strict'

import { createDevProfileClient, devConnectionResponse } from './dev-connection.js'

/**
 * The dev profile client when it can't get connected. No conductor needed:
 * either nothing listens on the admin port, or the dev server's answer is stubbed.
 */

test('dev connection: when the conductor is not running, the client reports failed, not a hang', async () => {
  const client = createDevProfileClient({
    url: new URL('ws://127.0.0.1:1'),
    fetchConnection: async () => { throw new Error('connect ECONNREFUSED 127.0.0.1:4444') }
  })

  const readiness = await client.waitUntilReady()

  assert.equal(readiness.status, 'failed')
})

test('dev connection: the dev server answers 503 when nothing is on the admin port', async () => {
  const response = await devConnectionResponse({ adminUrl: new URL('ws://127.0.0.1:1'), adminOrigin: 'ahau-test' })

  assert.equal(response.status, 503)
})

/** What the page shows for a dev server answer, using the real page-side fetch. */
async function reasonFor (answer: () => Promise<Response>): Promise<string> {
  const realFetch = globalThis.fetch
  globalThis.fetch = answer
  try {
    const readiness = await createDevProfileClient().waitUntilReady()
    assert.equal(readiness.status, 'failed')
    return readiness.status === 'failed' ? readiness.reason : ''
  } finally {
    globalThis.fetch = realFetch
  }
}

test('dev connection: the failure message says what actually went wrong', async () => {
  const down = await reasonFor(async () => new Response('could not connect', { status: 503 }))
  assert.match(down, /Holochain isn't running/)

  const broken = await reasonFor(async () => new Response('The ahau app has no ahau cell', { status: 500 }))
  assert.doesNotMatch(broken, /isn't running/)
  assert.match(broken, /Holochain is running.*no ahau cell/)

  const noRoute = await reasonFor(async () => new Response('Not Found', { status: 404 }))
  assert.match(noRoute, /no dev server/)

  const noServer = await reasonFor(async () => { throw new TypeError('fetch failed') })
  assert.match(noServer, /Couldn't reach the dev server/)
})
