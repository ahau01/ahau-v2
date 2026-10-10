import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer, type Socket } from 'node:net'

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

test('dev connection: a dev app port that accepts but never answers fails in seconds, not the launcher\'s 30', async () => {
  // Accepts TCP connections and then says nothing, so the WebSocket upgrade never completes.
  const sockets: Socket[] = []
  const silent = createServer(socket => { sockets.push(socket) })
  await new Promise<void>(resolve => silent.listen(0, '127.0.0.1', resolve))
  const address = silent.address()
  if (address === null || typeof address === 'string') throw new Error('no TCP port')

  const client = createDevProfileClient({
    url: new URL(`ws://127.0.0.1:${address.port}`),
    origin: 'ahau-test',
    fetchConnection: async () => ({
      appToken: [1, 2, 3],
      cellId: [new Array(39).fill(0), new Array(39).fill(0)],
      signing: { capSecret: [], privateKey: [], publicKey: [], signingKey: [] }
    })
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
