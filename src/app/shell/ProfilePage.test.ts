import { describe, expect, test, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'

import { completeProfile } from '../../profile/client.js'
import ProfilePage from './ProfilePage.svelte'

describe('profile page: edit dialog', () => {
  test('opens with the saved values and cancelling writes nothing', async () => {
    const user = userEvent.setup()
    const profile = completeProfile({ name: 'Mere', profession: 'Kaiako' })
    const onupdate = vi.fn(async input => ({ status: 'created' as const, profile: completeProfile(input) }))
    const onsave = vi.fn()
    render(ProfilePage, { profile, onupdate, onsave })

    await user.click(screen.getByRole('button', { name: 'Edit profile' }))

    const dialog = await screen.findByRole('dialog', { name: 'Change your profile' })
    expect((screen.getByRole('textbox', { name: 'First name / known as' }) as HTMLInputElement).value).toBe('Mere')
    expect((screen.getByRole('textbox', { name: 'Profession' }) as HTMLInputElement).value).toBe('Kaiako')
    expect((screen.getByRole('textbox', { name: 'Place of birth' }) as HTMLInputElement).value).toBe('')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })
    expect(onupdate).not.toHaveBeenCalled()
    expect(onsave).not.toHaveBeenCalled()
  })

  test('states that public changes add versions and earlier versions stay on the network', () => {
    render(ProfilePage, {
      profile: completeProfile({ name: 'Mere' }),
      onupdate: async input => ({ status: 'created', profile: completeProfile(input) }),
      onsave: () => {}
    })

    const profile = screen.getByRole('region', { name: 'Profile' })
    expect(within(profile).getByText('Anyone using Āhau can see this.')).toBeTruthy()
    expect(within(profile).getByText('Changes add a new version. Earlier versions stay on the network.')).toBeTruthy()
  })
})
