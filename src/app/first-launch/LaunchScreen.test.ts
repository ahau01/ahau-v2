import { describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'

import LaunchScreen from './LaunchScreen.svelte'

/** Copy from docs/old-app-capture/01-launch.png and notes.md. */
describe('launch screen: welcome', () => {
  test('greets the person as the old app did', () => {
    render(LaunchScreen, { current: { kind: 'welcome' }, onbegin: () => {} })

    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/Nau mai\s*whakatau mai/i)
    expect(screen.getByText(/^welcome$/i)).toBeTruthy()
  })

  test('"Ko wai koe -- who are you?" opens the profile form', async () => {
    const onbegin = vi.fn()
    render(LaunchScreen, { current: { kind: 'welcome' }, onbegin })

    await userEvent.click(screen.getByRole('button', { name: /ko wai koe\s*--\s*--\s*who are you\?/i }))

    expect(onbegin).toHaveBeenCalledOnce()
  })
})
