import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'

import { completeProfile, type Profile, type ProfileClient } from '../profile/client.js'
import { stubProfileClient } from '../profile/test-client.js'
import wahine from './assets/wahine.svg'
import App from './App.svelte'

/**
 * The whole app with a stub profile client: launch, the avatar step, and
 * going in (launch and navigation specs).
 */

const mere = completeProfile({ name: 'Mere', gender: 'female' })

/**
 * A profile client that answers launch, then refuses, and records, every
 * call once the person has gone in. Nothing after launch may reach Holochain.
 */
function launchOnlyClient (profile: Profile | null) {
  const callsAfterLaunch: string[] = []
  let launched = false
  const guard = (name: string) => {
    if (!launched) return
    callsAfterLaunch.push(name)
    throw new Error(`${name} called after launch`)
  }
  const client: ProfileClient = stubProfileClient({
    waitUntilReady: async () => { guard('waitUntilReady'); return { status: 'ready' } },
    // Launch ends once the profile is known: read, or just created.
    getMyProfile: async () => {
      guard('getMyProfile')
      if (profile) launched = true
      return profile
    },
    createMyProfile: async created => {
      guard('createMyProfile')
      launched = true
      return { status: 'created', profile: completeProfile(created) }
    },
    updateMyProfile: async updated => {
      guard('updateMyProfile')
      return { status: 'updated', profile: completeProfile(updated) }
    },
    close: async () => { guard('close') }
  })
  return { client, callsAfterLaunch }
}

const settle = () => new Promise(resolve => setTimeout(resolve, 0))

beforeEach(() => { history.replaceState(null, '', location.pathname) })
afterEach(() => { cleanup() })

describe('app: the avatar step', () => {
  test('a returning person sees their avatar and name, and no part of the shell', async () => {
    render(App, { client: launchOnlyClient(mere).client })

    await screen.findByRole('button', { name: 'Mere' })
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Profile' })).toBeNull()
  })

  test('opened on #/me/whakapapa, going in lands on #/me/profile', async () => {
    location.hash = '#/me/whakapapa'
    await settle()
    const user = userEvent.setup()
    render(App, { client: launchOnlyClient(mere).client })

    await user.click(await screen.findByRole('button', { name: 'Mere' }))

    expect(location.hash).toBe('#/me/profile')
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Mere')
    expect(screen.getByRole('navigation', { name: 'Your space' })).toBeTruthy()
  })

  test('going in by keyboard lands on your profile, with focus on its heading', async () => {
    const user = userEvent.setup()
    render(App, { client: launchOnlyClient(mere).client })
    await screen.findByRole('button', { name: 'Mere' })

    await user.keyboard('{Enter}')

    expect(location.hash).toBe('#/me/profile')
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1, name: 'Mere' }))
  })

  test('after creating a profile, the person sees the avatar step, then goes in', async () => {
    const user = userEvent.setup()
    render(App, { client: launchOnlyClient(null).client })

    await user.click(await screen.findByRole('button', { name: /who are you/i }))
    await user.type(screen.getByRole('textbox', { name: 'First name / known as' }), 'Mere')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    const avatar = await screen.findByRole('button', { name: 'Mere' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.queryByRole('navigation')).toBeNull()
    // bits-ui gives the page its pointer back a moment after the modal
    // closes; a person can't click sooner than that.
    await waitFor(() => { expect(document.body.style.pointerEvents).not.toBe('none') })

    await user.click(avatar)
    expect(location.hash).toBe('#/me/profile')
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Mere')
  })
})

describe('app: sections still to come make no Holochain calls', () => {
  test('opening Archive, Whakapapa and the tribe list calls nothing, and nothing throws', async () => {
    const { client, callsAfterLaunch } = launchOnlyClient(mere)
    const user = userEvent.setup()
    render(App, { client })
    await user.click(await screen.findByRole('button', { name: 'Mere' }))

    for (const [name, nav] of [['Archive', 'Your space'], ['Whakapapa', 'Your space'], ['Add tribes', 'Spaces']] as const) {
      await user.click(within(screen.getByRole('navigation', { name: nav })).getByRole('link', { name }))
      await settle()
    }
    await waitFor(() => { expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Tribes') })

    expect(callsAfterLaunch).toEqual([])
  })
})

describe('app: editing your profile updates the shell', () => {
  test('a saved name and gender reach the heading and both shell avatars without reloading', async () => {
    const user = userEvent.setup()
    const client: ProfileClient = stubProfileClient({
      waitUntilReady: async () => ({ status: 'ready' }),
      getMyProfile: async () => completeProfile({ name: 'Mere', gender: 'male' }),
      createMyProfile: async input => ({ status: 'created', profile: completeProfile(input) }),
      updateMyProfile: async input => ({ status: 'updated', profile: completeProfile(input) }),
      close: async () => {}
    })
    render(App, { client })

    await user.click(await screen.findByRole('button', { name: 'Mere' }))
    await user.click(screen.getByRole('button', { name: 'Edit profile' }))
    const name = screen.getByRole('textbox', { name: 'First name / known as' })
    await user.clear(name)
    await user.type(name, 'Mere Rangi')
    await user.click(screen.getByRole('radio', { name: 'Female' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Mere Rangi' })).toBeTruthy()
    })
    for (const navigation of [
      screen.getByRole('navigation', { name: 'Spaces' }),
      screen.getByRole('navigation', { name: 'Your space' })
    ]) {
      const avatar = within(navigation).getByRole('img', { name: 'Mere Rangi' })
      expect(avatar.getAttribute('src')).toBe(wahine)
    }
    expect(location.hash).toBe('#/me/profile')
  })
})
