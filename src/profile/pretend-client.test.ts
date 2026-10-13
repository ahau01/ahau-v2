import test from 'node:test'
import assert from 'node:assert/strict'

import { ALREADY_HAS_PROFILE, NO_PROFILE_TO_UPDATE, completeProfile } from './client.js'
import { createPretendProfileClient } from './pretend-client.js'

const KEY = 'ahau:pretend-profile'

function storageHolding (saved: unknown): { getItem: (key: string) => string | null, setItem: (key: string, value: string) => void } {
  const items = new Map<string, string>([[KEY, JSON.stringify(saved)]])
  return {
    getItem: key => items.get(key) ?? null,
    setItem: (key, value) => { items.set(key, value) }
  }
}

const NO_PERSONAL_INFORMATION = { email: null, phone: null, address: null, postcode: null, city: null, country: null }

test('pretend client: a hand-edited saved profile loads with wrongly typed fields left empty', async () => {
  const client = createPretendProfileClient({
    storage: storageHolding({
      name: 'Mere',
      birthOrder: 'first',
      gender: 'tane',
      fullName: 'Mere Rangi',
      skills: 'raranga',
      education: ['Te Wānanga o Raukawa', 7],
      personal: { email: 5, city: 'Ōtaki' }
    })
  })

  assert.deepEqual(await client.getMyProfile(), {
    name: 'Mere',
    birthOrder: null,
    gender: null,
    fullName: 'Mere Rangi',
    altNames: [],
    dateOfBirth: null,
    placeOfBirth: null,
    description: null,
    profession: null,
    skills: [],
    education: [],
    personal: { ...NO_PERSONAL_INFORMATION, city: 'Ōtaki' }
  })
})

test('pretend client: a saved profile with every field reads back unchanged', async () => {
  const saved = {
    name: 'Mere',
    birthOrder: 2,
    gender: 'female',
    fullName: 'Mere Rangi',
    altNames: ['Mereana'],
    dateOfBirth: '1990-03',
    placeOfBirth: 'Ōtaki',
    description: 'Kairaranga',
    profession: 'Teacher',
    skills: ['raranga'],
    education: ['Te Wānanga o Raukawa'],
    personal: { email: 'mere@example.com', phone: '021 000 0000', address: '1 Main St', postcode: '5512', city: 'Ōtaki', country: 'Aotearoa' }
  }
  const client = createPretendProfileClient({ storage: storageHolding(saved) })

  assert.deepEqual(await client.getMyProfile(), saved)
})

test('pretend client: a second profile is refused with the zome\'s own reason', async () => {
  const client = createPretendProfileClient({ storage: storageHolding({ name: 'Mere' }) })

  const second = await client.createMyProfile({ name: 'Someone else' })

  assert.deepEqual(second, { status: 'failed', reason: ALREADY_HAS_PROFILE })
})

test('pretend client: updating before a profile exists is refused and writes nothing', async () => {
  const writes: string[] = []
  const client = createPretendProfileClient({
    storage: {
      getItem: () => null,
      setItem: (key, value) => { writes.push(`${key}:${value}`) }
    }
  })

  assert.deepEqual(await client.updateMyProfile({ name: 'Mere' }), {
    status: 'failed',
    reason: NO_PROFILE_TO_UPDATE
  })
  assert.deepEqual(writes, [])
})

test('pretend client: updating a profile reports updated and returns the saved profile', async () => {
  const client = createPretendProfileClient({ storage: storageHolding({ name: 'Mere' }) })

  assert.deepEqual(await client.updateMyProfile({ name: 'Mere Rangi' }), {
    status: 'updated',
    profile: completeProfile({ name: 'Mere Rangi' })
  })
})
