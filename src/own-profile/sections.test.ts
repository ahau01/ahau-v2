import test from 'node:test'
import assert from 'node:assert/strict'

import { completeProfile } from '../profile/client.js'
import { formatDate, profileSections } from './sections.js'

/** What your own profile page shows, without Svelte (own-profile spec, design D6). */

const labels = (items: Array<{ label: string }>) => items.map(item => item.label)

test('own profile: only what was given is shown; blank fields are left out', () => {
  const { profile } = profileSections(completeProfile({
    name: 'Mere',
    placeOfBirth: 'Rotorua',
    skills: ['Raranga', 'Te reo Māori'],
    fullName: '   ',
    profession: ''
  }))

  assert.deepEqual(profile.items, [
    { label: 'First name / known as', value: 'Mere' },
    { label: 'Place of birth', value: 'Rotorua' },
    { label: 'Skill/qualification', value: 'Raranga' },
    { label: 'Skill/qualification', value: 'Te reo Māori' }
  ])
})

test('own profile: each also-known-as, skill and place of education is its own item', () => {
  const { profile } = profileSections(completeProfile({
    name: 'Mere',
    altNames: ['Mere Rangi', 'Nanny Mere'],
    skills: ['Raranga'],
    education: ['Te Wānanga o Aotearoa', 'Rotorua Girls\' High School']
  }))

  assert.deepEqual(profile.items.slice(1), [
    { label: 'Also known as', value: 'Mere Rangi' },
    { label: 'Also known as', value: 'Nanny Mere' },
    { label: 'Skill/qualification', value: 'Raranga' },
    { label: 'Place of education', value: 'Te Wānanga o Aotearoa' },
    { label: 'Place of education', value: 'Rotorua Girls\' High School' }
  ])
})

for (const [date, shown] of [
  ['1952', '1952'],
  ['1952-03', 'March 1952'],
  ['1952-03-09', '9 March 1952'],
  ['192X', '192X'],
  ['1952-XX', '1952'],
  ['1952-03-XX', 'March 1952'],
  ['1952-03-1X', '1X March 1952']
] as const) {
  test(`own profile: a date of birth of ${date} shows as "${shown}", with no made-up parts`, () => {
    assert.equal(formatDate(date), shown)

    const { profile } = profileSections(completeProfile({ name: 'Mere', dateOfBirth: date }))
    assert.deepEqual(profile.items.find(item => item.label === 'Date of birth'), { label: 'Date of birth', value: shown })
  })
}

test('own profile: every field, in the order the create-profile form asks for it', () => {
  const { profile } = profileSections(completeProfile({
    name: 'Test',
    birthOrder: 1,
    gender: 'other',
    fullName: 'Test User',
    altNames: ['Tester'],
    dateOfBirth: '1990-01-01',
    placeOfBirth: 'Auckland',
    description: 'Test profile for screenshots',
    profession: 'Developer',
    skills: ['Te reo Māori'],
    education: ['Test School']
  }))

  assert.deepEqual(profile.items, [
    { label: 'First name / known as', value: 'Test' },
    { label: 'Order of birth', value: '1' },
    { label: 'Identifies as', value: 'Other' },
    { label: 'Full name', value: 'Test User' },
    { label: 'Also known as', value: 'Tester' },
    { label: 'Date of birth', value: '1 January 1990' },
    { label: 'Place of birth', value: 'Auckland' },
    { label: 'About Test', value: 'Test profile for screenshots' },
    { label: 'Profession', value: 'Developer' },
    { label: 'Skill/qualification', value: 'Te reo Māori' },
    { label: 'Place of education', value: 'Test School' }
  ])
})

test('own profile: contact details are all in Personal information, and only those', () => {
  const sections = profileSections(completeProfile({
    name: 'Mere',
    profession: 'Kaiako',
    personal: {
      email: 'mere@example.com',
      phone: '021 000 0000',
      address: '1 Test Street',
      postcode: '1010',
      city: 'Rotorua',
      country: 'Aotearoa'
    }
  }))

  assert.deepEqual(sections.personal.items, [
    { label: 'Email', value: 'mere@example.com' },
    { label: 'Phone', value: '021 000 0000' },
    { label: 'Address', value: '1 Test Street' },
    { label: 'Postcode', value: '1010' },
    { label: 'City', value: 'Rotorua' },
    { label: 'Country', value: 'Aotearoa' }
  ])
  assert.equal(sections.personal.isEmpty, false)
  assert.deepEqual(labels(sections.profile.items), ['First name / known as', 'Profession'])
  for (const value of ['mere@example.com', '021 000 0000', '1 Test Street', '1010', 'Rotorua', 'Aotearoa']) {
    assert.ok(!sections.profile.items.some(item => item.value === value), `${value} is not in Profile`)
  }
})

test('own profile: no contact details gives an empty Personal information section', () => {
  const sections = profileSections(completeProfile({ name: 'Mere', profession: 'Kaiako' }))

  assert.deepEqual(sections.personal, { items: [], isEmpty: true })
  assert.equal(sections.profile.isEmpty, false)
})
