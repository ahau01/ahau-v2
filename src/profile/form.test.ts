import test from 'node:test'
import assert from 'node:assert/strict'

import { GENDERS, completeProfile } from './client.js'
import { emptyProfileForm, profileForm, readForm } from './form.js'

test('profile form: seeds every field from a saved profile', () => {
  const profile = completeProfile({
    name: 'Mere',
    birthOrder: 2,
    gender: 'female',
    fullName: 'Mere Rangi',
    altNames: ['Mereana'],
    dateOfBirth: '1990-03-09',
    placeOfBirth: 'Ōtaki',
    description: 'Kairaranga',
    profession: 'Kaiako',
    skills: ['raranga'],
    education: ['Te Wānanga o Raukawa'],
    personal: {
      email: 'mere@example.com',
      phone: '021 000 0000',
      address: '1 Main Street',
      postcode: '5512',
      city: 'Ōtaki',
      country: 'Aotearoa'
    }
  })

  assert.deepEqual(profileForm(profile), {
    name: 'Mere',
    birthOrder: '2',
    gender: 'female',
    fullName: 'Mere Rangi',
    altNames: ['Mereana'],
    dateOfBirth: { day: '09', month: '03', year: '1990' },
    placeOfBirth: 'Ōtaki',
    description: 'Kairaranga',
    profession: 'Kaiako',
    skills: ['raranga'],
    education: ['Te Wānanga o Raukawa'],
    personal: {
      email: 'mere@example.com',
      phone: '021 000 0000',
      address: '1 Main Street',
      postcode: '5512',
      city: 'Ōtaki',
      country: 'Aotearoa'
    }
  })
})

test('profile form: nulls and empty lists seed blank fields', () => {
  assert.deepEqual(profileForm(completeProfile({ name: 'Mere' })), {
    ...emptyProfileForm(),
    name: 'Mere'
  })
})

test('profile form: a year-only date leaves its day and month unset', () => {
  assert.deepEqual(profileForm(completeProfile({ name: 'Mere', dateOfBirth: '1952' })).dateOfBirth, {
    day: '', month: '', year: '1952'
  })
})

test('profile form: unknown digits in the year are kept', () => {
  assert.deepEqual(profileForm(completeProfile({ name: 'Mere', dateOfBirth: '192X' })).dateOfBirth, {
    day: '', month: '', year: '192X'
  })
})

test('profile form: a date outside the dropdowns is explicit and survives an untouched save', () => {
  const futureYear = String(new Date().getUTCFullYear() + 1)
  const form = profileForm(completeProfile({ name: 'Mere', dateOfBirth: futureYear }))

  assert.deepEqual(form.dateOfBirth, {
    day: '', month: '', year: '', unrepresentable: futureYear
  })
  assert.deepEqual(readForm(form), { profile: { name: 'Mere', dateOfBirth: futureYear } })
})

test('profile form: reading a seeded form preserves generated profiles across every field', () => {
  const dates = [null, '1952', '1990-03', '1990-03-09', '192X', '19XX', 'XXXX', '1990-XX', '1990-XX-XX', '1990-03-1X']
  const profiles = Array.from({ length: 40 }, (_, index) => completeProfile({
    name: `Person ${index}`,
    birthOrder: index % 2 === 0 ? index + 1 : null,
    gender: index % 5 === 0 ? null : GENDERS[index % GENDERS.length]!,
    fullName: index % 3 === 0 ? `Person ${index} Rangi` : null,
    altNames: index % 2 === 0 ? [`Known as ${index}`] : [],
    dateOfBirth: dates[index % dates.length]!,
    placeOfBirth: index % 3 === 0 ? `Place ${index}` : null,
    description: index % 2 === 0 ? `About ${index}` : null,
    profession: index % 4 === 0 ? `Work ${index}` : null,
    skills: index % 3 === 0 ? [`Skill ${index}`] : [],
    education: index % 4 === 0 ? [`School ${index}`] : [],
    personal: {
      ...(index % 2 === 0 ? { email: `person${index}@example.com` } : {}),
      ...(index % 3 === 0 ? { phone: `021 ${index}` } : {}),
      ...(index % 4 === 0 ? { address: `${index} Main Street` } : {}),
      ...(index % 2 === 0 ? { city: `City ${index}` } : {})
    }
  }))

  for (const profile of profiles) {
    const read = readForm(profileForm(profile))
    assert.ok('profile' in read)
    if ('profile' in read) assert.deepEqual(completeProfile(read.profile), profile)
  }
})
