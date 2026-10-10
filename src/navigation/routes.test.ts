import test from 'node:test'
import assert from 'node:assert/strict'

import { parseRoute, routeHref, type Route } from './routes.js'

/** The shell's addresses, without a browser (navigation spec, design D2–D3). */

for (const [hash, route] of [
  ['#/me/profile', { space: 'me', section: 'profile' }],
  ['#/me/archive', { space: 'me', section: 'archive' }],
  ['#/me/whakapapa', { space: 'me', section: 'whakapapa' }],
  ['#/tribes', { space: 'tribes' }]
] as Array<[string, Route]>) {
  test(`routes: ${hash} names a page, and that page's address is ${hash}`, () => {
    assert.deepEqual(parseRoute(hash), route)
    assert.equal(routeHref(route), hash)
  })
}

for (const hash of ['', '#', '#/', '#/me', '#/me/', '#/me/wallet', '#/me/profile/x', '#/tribe/x/profile', '#/tribes/x', 'me/profile', '#me/profile']) {
  test(`routes: '${hash}' names no page`, () => {
    assert.equal(parseRoute(hash), null)
  })
}

test('routes: your own space carries no group, tribe or agent id', () => {
  for (const section of ['profile', 'archive', 'whakapapa'] as const) {
    assert.match(routeHref({ space: 'me', section }), /^#\/me\/[a-z]+$/)
  }
})
