import { afterEach, describe, expect, test } from 'vitest'
import { get } from 'svelte/store'

import { currentRoute } from './route.js'

/** The address as the shell follows it, in a DOM (navigation spec, design D2). */

/** Changes the address as a person typing it would, then lets `hashchange` fire. */
async function goTo (hash: string) {
  location.hash = hash
  await new Promise(resolve => setTimeout(resolve, 0))
}

describe('current route', () => {
  let stop: (() => void) | undefined
  afterEach(() => { stop?.() })

  test('follows the address as it changes', async () => {
    await goTo('#/me/profile')
    const route = currentRoute()
    const seen: unknown[] = []
    stop = route.subscribe(value => seen.push(value))

    await goTo('#/me/archive')
    await goTo('#/tribes')

    expect(get(route)).toEqual({ space: 'tribes' })
    expect(seen).toContainEqual({ space: 'me', section: 'archive' })
  })

  test('a mistyped address shows your profile and is replaced, not added to history', async () => {
    await goTo('#/me/profile')
    const route = currentRoute()
    stop = route.subscribe(() => {})

    const before = history.length

    await goTo('#/me/wallet')
    // Let the replacement's own hashchange settle.
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(get(route)).toEqual({ space: 'me', section: 'profile' })
    expect(location.hash).toBe('#/me/profile')
    // One entry for the typed address, replaced in place; none for the fix.
    expect(history.length).toBe(before + 1)
  })

  test('an empty address on first read is your profile', async () => {
    history.replaceState(null, '', location.pathname)

    const route = currentRoute()
    stop = route.subscribe(() => {})

    expect(get(route)).toEqual({ space: 'me', section: 'profile' })
    expect(location.hash).toBe('#/me/profile')
  })
})
