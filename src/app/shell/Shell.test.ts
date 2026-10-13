import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'

import { completeProfile, type NewProfile } from '../../profile/client.js'
import wahine from '../assets/wahine.svg'
import Shell from './Shell.svelte'

/**
 * The shell once a person is in: whose space, which section, and each page.
 * Through links, headings and the address, as a person meets them
 * (navigation and own-profile specs).
 */

const mere = completeProfile({ name: 'Mere', gender: 'female' })

/** Lets the browser's `hashchange` from a link or a typed address fire. */
const settle = () => new Promise(resolve => setTimeout(resolve, 0))

async function showAt (hash: string, profile = mere) {
  location.hash = hash
  await settle()
  render(Shell, {
    profile,
    onupdate: async input => ({ status: 'created', profile: completeProfile(input) }),
    onsave: () => {}
  })
  return userEvent.setup()
}

async function follow (user: ReturnType<typeof userEvent.setup>, link: HTMLElement) {
  await user.click(link)
  await settle()
}

const topBar = () => screen.getByRole('navigation', { name: 'Spaces' })
const sideNav = () => screen.getByRole('navigation', { name: 'Your space' })
const pageHeading = () => screen.getByRole('heading', { level: 1 })

beforeEach(() => { history.replaceState(null, '', location.pathname) })
afterEach(() => { cleanup() })

describe('shell: top bar', () => {
  test('on #/me/profile it shows "Add tribes" and your avatar, with your avatar as the current space', async () => {
    await showAt('#/me/profile')

    const tribes = within(topBar()).getByRole('link', { name: 'Add tribes' })
    const me = within(topBar()).getByRole('link', { name: 'Mere' })
    expect(tribes.getAttribute('href')).toBe('#/tribes')
    expect(me.getAttribute('href')).toBe('#/me/profile')
    expect(me.getAttribute('aria-current')).toBe('true')
    expect(tribes.hasAttribute('aria-current')).toBe(false)
  })

  test('on #/tribes, "Add tribes" is the current space', async () => {
    await showAt('#/tribes')

    expect(within(topBar()).getByRole('link', { name: 'Add tribes' }).getAttribute('aria-current')).toBe('true')
    expect(within(topBar()).getByRole('link', { name: 'Mere' }).hasAttribute('aria-current')).toBe(false)
  })

  test('from tribes, your avatar goes to #/me/profile', async () => {
    const user = await showAt('#/tribes')

    await follow(user, within(topBar()).getByRole('link', { name: 'Mere' }))

    expect(location.hash).toBe('#/me/profile')
    expect(pageHeading().textContent).toBe('Mere')
  })

  test('has no notifications, help or tribe controls', async () => {
    await showAt('#/me/profile')

    expect(within(topBar()).getAllByRole('link').map(link => link.getAttribute('href'))).toEqual(['#/tribes', '#/me/profile'])
    expect(within(topBar()).queryAllByRole('button')).toHaveLength(0)
    expect(screen.queryByText(/notification|help/i)).toBeNull()
  })

  test('your avatar is the silhouette for your gender', async () => {
    await showAt('#/me/profile')

    expect(within(topBar()).getByRole('img', { name: 'Mere' }).getAttribute('src')).toBe(wahine)
    expect(within(sideNav()).getByRole('img', { name: 'Mere' }).getAttribute('src')).toBe(wahine)
  })
})

describe('shell: side nav', () => {
  test('shows your avatar, then Profile, Archive and Whakapapa in that order', async () => {
    await showAt('#/me/profile')

    expect(within(sideNav()).getByRole('img', { name: 'Mere' })).toBeTruthy()
    expect(within(sideNav()).getAllByRole('link').map(link => [link.textContent?.trim(), link.getAttribute('href')])).toEqual([
      ['Profile', '#/me/profile'],
      ['Archive', '#/me/archive'],
      ['Whakapapa', '#/me/whakapapa']
    ])
  })

  test('moving from profile to Whakapapa changes the address and the current item', async () => {
    const user = await showAt('#/me/profile')
    expect(within(sideNav()).getByRole('link', { name: 'Profile' }).getAttribute('aria-current')).toBe('page')

    await follow(user, within(sideNav()).getByRole('link', { name: 'Whakapapa' }))

    expect(location.hash).toBe('#/me/whakapapa')
    expect(within(sideNav()).getByRole('link', { name: 'Whakapapa' }).getAttribute('aria-current')).toBe('page')
    expect(within(sideNav()).getByRole('link', { name: 'Profile' }).hasAttribute('aria-current')).toBe(false)
    expect(pageHeading().textContent).toBe('Whakapapa')
  })

  for (const section of ['profile', 'archive', 'whakapapa']) {
    test(`on #/me/${section} it has no Wallet or People item`, async () => {
      await showAt(`#/me/${section}`)

      expect(within(sideNav()).queryByRole('link', { name: /wallet|people/i })).toBeNull()
    })
  }

  test('the tribe list has no side nav', async () => {
    await showAt('#/tribes')

    expect(screen.queryByRole('navigation', { name: 'Your space' })).toBeNull()
  })
})

describe('shell: moving between pages', () => {
  test('focus moves to the new page\'s heading', async () => {
    const user = await showAt('#/me/profile')

    await follow(user, within(sideNav()).getByRole('link', { name: 'Archive' }))

    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1, name: 'Archive' }))
  })

  test('back from Archive returns to your profile', async () => {
    const user = await showAt('#/me/profile')
    await follow(user, within(sideNav()).getByRole('link', { name: 'Archive' }))

    history.back()
    await waitFor(() => { expect(location.hash).toBe('#/me/profile') })

    await waitFor(() => { expect(pageHeading().textContent).toBe('Mere') })
  })

  test('a mistyped address shows your profile at #/me/profile', async () => {
    await showAt('#/me/archive')

    location.hash = '#/me/wallet'
    await settle()
    await settle()

    expect(location.hash).toBe('#/me/profile')
    expect(pageHeading().textContent).toBe('Mere')
  })
})

describe('shell: your own space', () => {
  test('its addresses carry no group, tribe or agent id', async () => {
    await showAt('#/me/profile')

    for (const link of within(sideNav()).getAllByRole('link')) {
      expect(link.getAttribute('href')).toMatch(/^#\/me\/(profile|archive|whakapapa)$/)
    }
  })
})

describe('shell: sections still to come', () => {
  for (const [hash, heading, says] of [
    ['#/me/archive', 'Archive', /archive is still to come/i],
    ['#/me/whakapapa', 'Whakapapa', /whakapapa is still to come/i],
    ['#/tribes', 'Tribes', /tribes are still to come/i]
  ] as const) {
    test(`${hash} has a ${heading} heading, says it is still to come, and offers nothing that does nothing`, async () => {
      await showAt(hash)

      const main = screen.getByRole('main')
      expect(within(main).getByRole('heading', { level: 1 }).textContent).toBe(heading)
      expect(within(main).getByText(says)).toBeTruthy()
      // Not "you have none", not a failure.
      expect(within(main).queryByText(/no (whakapapa|tribes|items|records)|you (have|haven't)|error|failed|couldn't/i)).toBeNull()
      expect(within(main).queryAllByRole('button')).toHaveLength(0)
      expect(within(main).queryAllByRole('link')).toHaveLength(0)
      expect(within(main).queryAllByRole('img')).toHaveLength(0)
      expect(within(main).queryByRole('alert')).toBeNull()
    })
  }
})

describe('own profile page', () => {
  const show = (profile: NewProfile) => showAt('#/me/profile', completeProfile(profile))
  const section = (name: string) => screen.getByRole('region', { name })
  const shown = (name: string) => within(section(name)).queryAllByRole('term').map(term => [term.textContent, term.nextElementSibling?.textContent])

  test('the main heading is your name', async () => {
    await show({ name: 'Mere' })

    expect(pageHeading().textContent).toBe('Mere')
  })

  test('profession is in Profile and email in Personal information', async () => {
    await show({ name: 'Mere', profession: 'Kaiako', personal: { email: 'mere@example.com' } })

    expect(within(section('Profile')).getByText('Kaiako')).toBeTruthy()
    expect(within(section('Profile')).queryByText('mere@example.com')).toBeNull()
    expect(within(section('Personal information')).getByText('mere@example.com')).toBeTruthy()
    expect(within(section('Personal information')).queryByText('Kaiako')).toBeNull()
  })

  test('each section says who can see it, next to its heading', async () => {
    await show({ name: 'Mere' })

    for (const [name, label] of [
      ['Profile', 'Anyone using Āhau can see this.'],
      ['Personal information', 'Only you can see this.']
    ]) {
      const heading = within(section(name)).getByRole('heading', { level: 2, name })
      expect(heading.nextElementSibling?.textContent).toBe(label)
    }
  })

  test('only what was given: a name, a place of birth and two skills', async () => {
    await show({ name: 'Mere', placeOfBirth: 'Rotorua', skills: ['Raranga', 'Te reo Māori'] })

    expect(shown('Profile')).toEqual([
      ['First name / known as', 'Mere'],
      ['Place of birth', 'Rotorua'],
      ['Skill/qualification', 'Raranga'],
      ['Skill/qualification', 'Te reo Māori']
    ])
  })

  test('a year of birth alone shows as that year', async () => {
    await show({ name: 'Mere', dateOfBirth: '1952' })

    expect(shown('Profile')).toContainEqual(['Date of birth', '1952'])
  })

  test('with no contact details, Personal information still shows, labelled, saying nothing has been added', async () => {
    await show({ name: 'Mere' })

    const personal = section('Personal information')
    expect(within(personal).getByText('Only you can see this.')).toBeTruthy()
    expect(within(personal).getByText(/nothing has been added/i)).toBeTruthy()
    expect(within(personal).queryAllByRole('term')).toHaveLength(0)
  })

  test('offers profile editing but no header-image or photo control', async () => {
    await show({ name: 'Mere', profession: 'Kaiako' })

    const main = screen.getByRole('main')
    expect(within(main).getByRole('button', { name: 'Edit profile' })).toBeTruthy()
    expect(within(main).queryByRole('button', { name: /upload profile photo/i })).toBeNull()
    expect(within(main).queryAllByRole('link')).toHaveLength(0)
    expect(main.querySelector('input')).toBeNull()
    expect(within(main).queryByText(/upload|photo|header image/i)).toBeNull()
  })
})
