import test from 'node:test'
import assert from 'node:assert/strict'

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
