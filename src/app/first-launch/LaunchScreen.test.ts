import { describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'

import { completeProfile } from '../../profile/client.js'
import wahine from '../assets/wahine.svg'
import LaunchScreen from './LaunchScreen.svelte'

/** Copy from docs/old-app-capture/01-launch.png and notes.md. */
describe('launch screen: welcome', () => {
  test('greets the person as the old app did', () => {
    render(LaunchScreen, { current: { kind: 'welcome' }, onbegin: () => {}, onenter: () => {} })

    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/Nau mai\s*whakatau mai/i)
    expect(screen.getByText(/^welcome$/i)).toBeTruthy()
  })

  test('"Ko wai koe -- who are you?" opens the profile form', async () => {
    const onbegin = vi.fn()
    render(LaunchScreen, { current: { kind: 'welcome' }, onbegin, onenter: () => {} })

    await userEvent.click(screen.getByRole('button', { name: /ko wai koe\s*--\s*--\s*who are you\?/i }))

    expect(onbegin).toHaveBeenCalledOnce()
  })
})

/** An agent on this device that already has a profile. Not a login (launch spec). */
describe('launch screen: avatar step', () => {
  const mere = completeProfile({ name: 'Mere', gender: 'female' })

  function show () {
    const onenter = vi.fn()
    render(LaunchScreen, { current: { kind: 'has-profile', profile: mere }, onbegin: () => {}, onenter })
    return { onenter, user: userEvent.setup() }
  }

  test("shows Mere's avatar and name", () => {
    show()

    const button = screen.getByRole('button', { name: 'Mere' })
    expect(button.querySelector('img')?.getAttribute('src')).toBe(wahine)
    expect(button.querySelector('img')?.getAttribute('alt')).toBe('Mere')
    expect(button.textContent).toContain('Mere')
  })

  test('is focused, ready to go in', () => {
    show()

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Mere' }))
  })

  test('clicking it calls onenter', async () => {
    const { onenter, user } = show()

    await user.click(screen.getByRole('button', { name: 'Mere' }))

    expect(onenter).toHaveBeenCalledOnce()
  })

  for (const key of ['{Enter}', ' ']) {
    test(`activating by keyboard (${key === ' ' ? 'Space' : 'Enter'}) calls onenter`, async () => {
      const { onenter, user } = show()

      await user.keyboard(key)

      expect(onenter).toHaveBeenCalledOnce()
    })
  }

  test('no other controls: no password, account or sign out', () => {
    show()

    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.queryAllByRole('textbox')).toHaveLength(0)
    expect(screen.queryAllByRole('link')).toHaveLength(0)
    expect(document.querySelector('input')).toBeNull()
    expect(screen.queryByText(/password|sign (in|out)|log ?(in|out)|account/i)).toBeNull()
  })
})
