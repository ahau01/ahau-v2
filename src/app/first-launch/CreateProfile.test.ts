import { describe, expect, test, vi } from 'vitest'
import { render, screen, within } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'

import { emptyProfileForm, type CreateProfileState } from '../../first-launch/first-launch.js'
import CreateProfile from './CreateProfile.svelte'

/**
 * The create-profile form, through what a person sees and does: labels,
 * buttons and keyboard, not markup. Copy and fields from
 * docs/old-app-capture/notes.md.
 */

const filling: CreateProfileState = { kind: 'needs-profile', form: emptyProfileForm() }

function show (current: CreateProfileState = filling) {
  const onsubmit = vi.fn()
  const oncancel = vi.fn()
  render(CreateProfile, { current, onsubmit, oncancel })
  return { onsubmit, oncancel, user: userEvent.setup() }
}

describe('create profile: fields', () => {
  test('is titled "Ahau -- -- I am"', () => {
    show()

    expect(screen.getByRole('dialog', { name: /ahau\s*--\s*--\s*i am/i })).toBeTruthy()
  })

  test('has every field the old create-profile screen asked for', () => {
    show()

    for (const label of [
      'First name / known as', 'Order of birth', 'Full name', 'Place of birth',
      'Profession', 'Email', 'Phone', 'Address', 'Postcode', 'City', 'Country'
    ]) {
      expect(screen.getByRole('textbox', { name: label }), label).toBeTruthy()
    }
    expect(screen.getByRole('textbox', { name: /^About/ })).toBeTruthy()

    const identifiesAs = screen.getByRole('group', { name: 'Identifies as' })
    for (const gender of ['Male', 'Female', 'Other']) {
      expect(within(identifiesAs).getByRole('radio', { name: gender }), gender).toBeTruthy()
    }
    expect(within(identifiesAs).getByRole('checkbox', { name: 'Unknown' })).toBeTruthy()

    const dateOfBirth = screen.getByRole('group', { name: 'Date of birth' })
    for (const part of ['Day', 'Month', 'Year']) {
      expect(within(dateOfBirth).getByRole('combobox', { name: part }), part).toBeTruthy()
    }

    expect(screen.getByRole('heading', { name: 'Skills and qualifications' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Personal information' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Upload profile photo' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByText('Only you can see this.')).toBeTruthy()
  })

  test('"About" names the person once they have typed their name', async () => {
    const { user } = show()

    await user.type(screen.getByRole('textbox', { name: 'First name / known as' }), 'Test')

    expect(screen.getByRole('textbox', { name: 'About Test' })).toBeTruthy()
  })

  test('only the name is required', () => {
    show()

    const required = screen.getAllByRole('textbox').filter(box => box.getAttribute('aria-required') === 'true')
    expect(required.map(box => box.getAttribute('id'))).toEqual(['profile-name'])
  })
})

describe('create profile: lists of names, skills and places of education', () => {
  for (const [button, box] of [
    ['Add another name', 'Also known as'],
    ['Add skill/qualification', 'Skill/qualification'],
    ['Add a place of education', 'Place of education']
  ] as const) {
    test(`"${button}" adds a "${box}" box to type in, and its bin removes it`, async () => {
      const { user } = show()
      expect(screen.queryByRole('textbox', { name: box })).toBeNull()

      await user.click(screen.getByRole('button', { name: button }))

      const added = screen.getByRole('textbox', { name: box })
      expect(document.activeElement).toBe(added)

      await user.click(screen.getByRole('button', { name: `Remove ${box}` }))

      expect(screen.queryByRole('textbox', { name: box })).toBeNull()
    })
  }
})

describe('create profile: gender', () => {
  test('Unknown and the gender buttons are one choice', async () => {
    const { user, onsubmit } = show()
    await user.type(screen.getByRole('textbox', { name: 'First name / known as' }), 'Test')

    await user.click(screen.getByRole('radio', { name: 'Male' }))
    await user.click(screen.getByRole('checkbox', { name: 'Unknown' }))

    expect((screen.getByRole('radio', { name: 'Male' }) as HTMLInputElement).checked).toBe(false)
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onsubmit.mock.calls[0]?.[0].gender).toBe('unknown')
  })
})

describe('create profile: saving and cancelling', () => {
  test('Save sends everything the person filled in', async () => {
    const { user, onsubmit } = show()
    const box = (name: string) => screen.getByRole('textbox', { name })

    await user.type(box('First name / known as'), 'Test')
    await user.type(box('Order of birth'), '1')
    await user.click(screen.getByRole('radio', { name: 'Other' }))
    await user.type(box('Full name'), 'Test User')
    await user.click(screen.getByRole('button', { name: 'Add another name' }))
    await user.type(box('Also known as'), 'Tester')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Day' }), '01')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Month' }), 'January')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Year' }), '1990')
    await user.type(box('Place of birth'), 'Auckland')
    await user.type(box('About Test'), 'Test profile for screenshots')
    await user.type(box('Profession'), 'Developer')
    await user.click(screen.getByRole('button', { name: 'Add skill/qualification' }))
    await user.type(box('Skill/qualification'), 'Te reo Māori')
    await user.click(screen.getByRole('button', { name: 'Add a place of education' }))
    await user.type(box('Place of education'), 'Test School')
    await user.type(box('Email'), 'test@example.com')
    await user.type(box('Phone'), '021 000 0000')
    await user.type(box('Address'), '1 Test Street')
    await user.type(box('Postcode'), '1010')
    await user.type(box('City'), 'Auckland')
    await user.type(box('Country'), 'Aotearoa')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onsubmit).toHaveBeenCalledWith({
      name: 'Test',
      birthOrder: '1',
      gender: 'other',
      fullName: 'Test User',
      altNames: ['Tester'],
      dateOfBirth: { day: '01', month: '01', year: '1990' },
      placeOfBirth: 'Auckland',
      description: 'Test profile for screenshots',
      profession: 'Developer',
      skills: ['Te reo Māori'],
      education: ['Test School'],
      personal: {
        email: 'test@example.com',
        phone: '021 000 0000',
        address: '1 Test Street',
        postcode: '1010',
        city: 'Auckland',
        country: 'Aotearoa'
      }
    })
  })

  test('the date of birth offers unknown digits, as the old app did', () => {
    show()

    const options = (name: string) => within(screen.getByRole('combobox', { name }))
      .getAllByRole('option').map(option => (option as HTMLOptionElement).value)
    expect(options('Day')).toEqual(expect.arrayContaining(['XX', '1X', '31']))
    expect(options('Month')).toEqual(expect.arrayContaining(['XX', '01', '12']))
    expect(options('Year')).toEqual(expect.arrayContaining(['XXXX', '19XX', '192X', '1925', '0000']))
  })

  test('Cancel and the close button both close without saving', async () => {
    const { user, oncancel, onsubmit } = show()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(oncancel).toHaveBeenCalledTimes(2)
    expect(onsubmit).not.toHaveBeenCalled()
  })

  test('Escape closes it, like other dialogs', async () => {
    const { user, oncancel } = show()

    await user.keyboard('{Escape}')

    expect(oncancel).toHaveBeenCalledOnce()
  })
})

describe('create profile: problems', () => {
  test('each problem shows on its field, and the person is put in the first one', () => {
    show({
      kind: 'needs-profile',
      form: emptyProfileForm(),
      errors: { name: 'Please enter a name.', dateOfBirth: 'Please specify a year and month' }
    })

    const name = screen.getByRole('textbox', { name: 'First name / known as' })
    expect(name.getAttribute('aria-invalid')).toBe('true')
    expect(name.getAttribute('aria-errormessage') && document.getElementById(name.getAttribute('aria-errormessage')!)?.textContent)
      .toBe('Please enter a name.')
    expect(within(screen.getByRole('group', { name: 'Date of birth' })).getByText('Please specify a year and month')).toBeTruthy()
    expect(document.activeElement).toBe(name)
  })

  test('a refused save is announced', () => {
    show({ kind: 'needs-profile', form: emptyProfileForm(), errors: { save: 'Holochain did not answer' } })

    expect(screen.getByRole('alert').textContent).toContain('Holochain did not answer')
  })

  test('while saving, Save says so and the form is busy', () => {
    show({ kind: 'saving', form: { ...emptyProfileForm(), name: 'Test' } })

    expect(screen.getByRole('button', { name: 'Saving…' }).getAttribute('aria-disabled')).toBe('true')
    expect(screen.getByRole('status').textContent).toBe('Saving your profile')
  })
})
