import test from 'node:test'
import assert from 'node:assert/strict'

import { completeProfile, type NewProfile, type ProfileClient } from '../profile/client.js'
import { createFirstLaunch, emptyProfileForm, type FirstLaunch, type ProfileForm } from './first-launch.js'

/**
 * Which first-launch screen to show, decided without Holochain. The client
 * is a stub of the real profile client interface.
 */

function stubClient(overrides: Partial<ProfileClient> = {}): ProfileClient {
  return {
    waitUntilReady: async () => ({ status: 'ready' }),
    getMyProfile: async () => null,
    createMyProfile: async profile => ({ status: 'created', profile: completeProfile(profile) }),
    close: async () => {},
    ...overrides
  }
}

const never = <T>() => new Promise<T>(() => {})

/** A form as the person left it: empty but for the given fields. */
function formWith (fields: Partial<ProfileForm>): ProfileForm {
  return { ...emptyProfileForm(), ...fields }
}

/** A createMyProfile that counts how often it is called. */
function countingCreate (answer: (profile: NewProfile) => ReturnType<ProfileClient['createMyProfile']>) {
  const calls = { count: 0 }
  const createMyProfile: ProfileClient['createMyProfile'] = profile => { calls.count++; return answer(profile) }
  return { createMyProfile, calls }
}

const created = async (profile: NewProfile) => ({ status: 'created', profile: completeProfile(profile) }) as const

test('first launch: while Holochain is not ready, it is starting', () => {
  const firstLaunch = createFirstLaunch(stubClient({ waitUntilReady: never }))

  void firstLaunch.start()

  assert.deepEqual(firstLaunch.state, { kind: 'starting' })
})

test('first launch: when Holochain fails to start, it says why', async () => {
  const firstLaunch = createFirstLaunch(stubClient({
    waitUntilReady: async () => ({ status: 'failed', reason: 'Holochain did not start: connection refused' })
  }))

  await firstLaunch.start()

  assert.deepEqual(firstLaunch.state, {
    kind: 'failed-to-start',
    reason: 'Holochain did not start: connection refused'
  })
})

test('first launch: starting again does not knock the screen backwards', async () => {
  let lookups = 0
  const firstLaunch = createFirstLaunch(stubClient({
    // The second lookup is slow and answers "no profile" after the person has saved.
    getMyProfile: async () => { lookups++; return lookups === 1 ? null : never() }
  }))

  const first = firstLaunch.start()
  void firstLaunch.start()
  await first
  firstLaunch.begin()
  await firstLaunch.submit(formWith({ name: 'Mere' }))

  assert.deepEqual(firstLaunch.state, { kind: 'has-profile', profile: completeProfile({ name: 'Mere' }) })
  assert.equal(lookups, 1)
})

test('first launch: an agent with no profile is welcomed and asked who they are', async () => {
  const firstLaunch = createFirstLaunch(stubClient({ getMyProfile: async () => null }))

  await firstLaunch.start()

  assert.deepEqual(firstLaunch.state, { kind: 'welcome' })
})

test('first launch: saying who you are opens an empty profile form', async () => {
  const firstLaunch = createFirstLaunch(stubClient())
  await firstLaunch.start()

  firstLaunch.begin()

  assert.deepEqual(firstLaunch.state, { kind: 'needs-profile', form: emptyProfileForm() })
})

test('first launch: cancelling the profile form goes back to the welcome, saving nothing', async () => {
  const { createMyProfile, calls } = countingCreate(created)
  const firstLaunch = createFirstLaunch(stubClient({ createMyProfile }))
  await firstLaunch.start()
  firstLaunch.begin()

  firstLaunch.cancel()

  assert.deepEqual(firstLaunch.state, { kind: 'welcome' })
  assert.equal(calls.count, 0)
})

test('first launch: a returning agent sees their avatar step, not the shell', async () => {
  const firstLaunch = createFirstLaunch(stubClient({ getMyProfile: async () => completeProfile({ name: 'Mere' }) }))

  await firstLaunch.start()

  assert.deepEqual(firstLaunch.state, { kind: 'has-profile', profile: completeProfile({ name: 'Mere' }) })
})

test('first launch: if Holochain cannot say whether this agent has a profile, it failed to start', async () => {
  const firstLaunch = createFirstLaunch(stubClient({
    getMyProfile: async () => { throw new Error('Source chain error: database locked') }
  }))

  await firstLaunch.start()

  assert.deepEqual(firstLaunch.state, {
    kind: 'failed-to-start',
    reason: 'Source chain error: database locked'
  })
})

test('first launch: creating a profile leads to the avatar step', async () => {
  const firstLaunch = createFirstLaunch(stubClient())
  await firstLaunch.start()
  firstLaunch.begin()

  await firstLaunch.submit(formWith({ name: 'Mere' }))

  assert.deepEqual(firstLaunch.state, { kind: 'has-profile', profile: completeProfile({ name: 'Mere' }) })
})

test('first launch: if saving fails, the person can try again without retyping', async () => {
  const firstLaunch = createFirstLaunch(stubClient({
    createMyProfile: async () => ({ status: 'failed', reason: 'Holochain did not answer' })
  }))
  await firstLaunch.start()
  firstLaunch.begin()

  await firstLaunch.submit(formWith({ name: 'Mere' }))

  assert.deepEqual(firstLaunch.state, {
    kind: 'needs-profile',
    form: formWith({ name: 'Mere' }),
    errors: { save: 'Holochain did not answer' }
  })
})

test('first launch: while saving, it shows saving and pressing save again does not save twice', async () => {
  const { createMyProfile, calls } = countingCreate(never)
  const firstLaunch = createFirstLaunch(stubClient({ createMyProfile }))
  await firstLaunch.start()
  firstLaunch.begin()

  void firstLaunch.submit(formWith({ name: 'Mere' }))
  void firstLaunch.submit(formWith({ name: 'Mere' }))

  assert.deepEqual(firstLaunch.state, { kind: 'saving', form: formWith({ name: 'Mere' }) })
  assert.equal(calls.count, 1)
})

test('first launch: a profile needs a name before it is saved', async () => {
  const { createMyProfile, calls } = countingCreate(created)
  const firstLaunch = createFirstLaunch(stubClient({ createMyProfile }))
  await firstLaunch.start()
  firstLaunch.begin()

  await firstLaunch.submit(formWith({ name: '' }))

  assert.deepEqual(firstLaunch.state, { kind: 'needs-profile', form: formWith({ name: '' }), errors: { name: 'Please enter a name.' } })
  assert.equal(calls.count, 0)
})

test('first launch: refusing the same name twice is a new error each time, so the screen can tell', async () => {
  const firstLaunch = createFirstLaunch(stubClient())
  await firstLaunch.start()
  firstLaunch.begin()
  const errors: unknown[] = []
  firstLaunch.subscribe(state => { if (state.kind === 'needs-profile' && state.errors) errors.push(state.errors) })

  await firstLaunch.submit(formWith({ name: '' }))
  await firstLaunch.submit(formWith({ name: '' }))

  assert.equal(errors.length, 2)
  assert.notStrictEqual(errors[0], errors[1])
})

test('first launch: a name of only spaces is no name', async () => {
  const { createMyProfile, calls } = countingCreate(created)
  const firstLaunch = createFirstLaunch(stubClient({ createMyProfile }))
  await firstLaunch.start()
  firstLaunch.begin()

  await firstLaunch.submit(formWith({ name: '   ' }))

  assert.equal(firstLaunch.state.kind, 'needs-profile')
  assert.equal(calls.count, 0)
})

test('first launch: a name is saved without surrounding spaces', async () => {
  let saved: NewProfile | undefined
  const firstLaunch = createFirstLaunch(stubClient({
    createMyProfile: async profile => { saved = profile; return { status: 'created', profile: completeProfile(profile) } }
  }))
  await firstLaunch.start()
  firstLaunch.begin()

  await firstLaunch.submit(formWith({ name: '  Mere ' }))

  assert.deepEqual(saved, { name: 'Mere' })
})

test('first launch: every field the person filled in is saved', async () => {
  let saved: NewProfile | undefined
  const firstLaunch = createFirstLaunch(stubClient({
    createMyProfile: async profile => { saved = profile; return { status: 'created', profile: completeProfile(profile) } }
  }))
  await firstLaunch.start()
  firstLaunch.begin()

  // As typed for the old app's "filled in" capture (docs/old-app-capture/notes.md).
  await firstLaunch.submit({
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

  assert.deepEqual(saved, {
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
  assert.equal(firstLaunch.state.kind, 'has-profile')
})

// The old app's rules (ahau-monorepo apps/ahau/ui/src/lib/date-helpers.mjs,
// convertDateObjToString): a year alone or a year and month is fine; a gap is not.
for (const [day, month, year, saved] of [
  ['', '', '1990', '1990'],
  ['', '03', '1990', '1990-03'],
  ['09', '03', '1990', '1990-03-09']
] as const) {
  test(`first launch: a date of birth of day '${day}', month '${month}', year '${year}' is saved as ${saved}`, async () => {
    let dateOfBirth: string | undefined
    const firstLaunch = createFirstLaunch(stubClient({
      createMyProfile: async profile => { dateOfBirth = profile.dateOfBirth ?? undefined; return created(profile) }
    }))
    await firstLaunch.start()
    firstLaunch.begin()

    await firstLaunch.submit(formWith({ name: 'Mere', dateOfBirth: { day, month, year } }))

    assert.equal(dateOfBirth, saved)
  })
}

for (const [day, month, year, message] of [
  ['09', '', '1990', 'Please specify a month'],
  ['09', '03', '', 'Please specify a year'],
  ['09', '', '', 'Please specify a year and month'],
  ['', '03', '', 'Please specify a year']
] as const) {
  test(`first launch: a date of birth of day '${day}', month '${month}', year '${year}' says "${message}"`, async () => {
    const { createMyProfile, calls } = countingCreate(created)
    const firstLaunch = createFirstLaunch(stubClient({ createMyProfile }))
    await firstLaunch.start()
    firstLaunch.begin()
    const form = formWith({ name: 'Mere', dateOfBirth: { day, month, year } })

    await firstLaunch.submit(form)

    assert.deepEqual(firstLaunch.state, { kind: 'needs-profile', form, errors: { dateOfBirth: message } })
    assert.equal(calls.count, 0)
  })
}

for (const birthOrder of ['0', '-1', '1.5', 'abc']) {
  test(`first launch: an order of birth of '${birthOrder}' is refused`, async () => {
    const { createMyProfile, calls } = countingCreate(created)
    const firstLaunch = createFirstLaunch(stubClient({ createMyProfile }))
    await firstLaunch.start()
    firstLaunch.begin()
    const form = formWith({ name: 'Mere', birthOrder })

    await firstLaunch.submit(form)

    assert.deepEqual(firstLaunch.state, {
      kind: 'needs-profile',
      form,
      errors: { birthOrder: 'Order of birth must be a whole number, from 1' }
    })
    assert.equal(calls.count, 0)
  })
}

test('first launch: every problem with the form is reported at once', async () => {
  const firstLaunch = createFirstLaunch(stubClient())
  await firstLaunch.start()
  firstLaunch.begin()
  const form = formWith({ name: ' ', birthOrder: '0', dateOfBirth: { day: '09', month: '', year: '' } })

  await firstLaunch.submit(form)

  assert.deepEqual(firstLaunch.state, {
    kind: 'needs-profile',
    form,
    errors: {
      name: 'Please enter a name.',
      birthOrder: 'Order of birth must be a whole number, from 1',
      dateOfBirth: 'Please specify a year and month'
    }
  })
})

test('first launch: boxes added but left blank are not saved', async () => {
  let saved: NewProfile | undefined
  const firstLaunch = createFirstLaunch(stubClient({
    createMyProfile: async profile => { saved = profile; return created(profile) }
  }))
  await firstLaunch.start()
  firstLaunch.begin()

  await firstLaunch.submit(formWith({ name: 'Mere', altNames: ['  ', ' Mere Rangi '], skills: [''] }))

  assert.deepEqual(saved, { name: 'Mere', altNames: ['Mere Rangi'] })
})

test('first launch: a screen can follow each state as it changes', async () => {
  const firstLaunch = createFirstLaunch(stubClient())
  const seen: string[] = []
  firstLaunch.subscribe(state => seen.push(state.kind))

  await firstLaunch.start()
  firstLaunch.begin()
  await firstLaunch.submit(formWith({ name: 'Mere' }))

  firstLaunch.enter()

  assert.deepEqual(seen, ['starting', 'welcome', 'needs-profile', 'saving', 'has-profile', 'ready'])
})

test('first launch: going in from the avatar step reaches the shell with the same profile', async () => {
  const mere = completeProfile({ name: 'Mere', gender: 'female' })
  const firstLaunch = createFirstLaunch(stubClient({ getMyProfile: async () => mere }))
  await firstLaunch.start()

  firstLaunch.enter()

  assert.deepEqual(firstLaunch.state, { kind: 'ready', profile: mere })
})

test('first launch: going in does nothing from any state but the avatar step', async () => {
  const states: Array<[string, () => Promise<FirstLaunch>]> = [
    ['starting', async () => {
      const firstLaunch = createFirstLaunch(stubClient({ waitUntilReady: never }))
      void firstLaunch.start()
      return firstLaunch
    }],
    ['failed-to-start', async () => {
      const firstLaunch = createFirstLaunch(stubClient({ waitUntilReady: async () => ({ status: 'failed', reason: 'no' }) }))
      await firstLaunch.start()
      return firstLaunch
    }],
    ['welcome', async () => {
      const firstLaunch = createFirstLaunch(stubClient())
      await firstLaunch.start()
      return firstLaunch
    }],
    ['needs-profile', async () => {
      const firstLaunch = createFirstLaunch(stubClient())
      await firstLaunch.start()
      firstLaunch.begin()
      return firstLaunch
    }],
    ['saving', async () => {
      const firstLaunch = createFirstLaunch(stubClient({ createMyProfile: never }))
      await firstLaunch.start()
      firstLaunch.begin()
      void firstLaunch.submit(formWith({ name: 'Mere' }))
      return firstLaunch
    }],
    ['ready', async () => {
      const firstLaunch = createFirstLaunch(stubClient({ getMyProfile: async () => completeProfile({ name: 'Mere' }) }))
      await firstLaunch.start()
      firstLaunch.enter()
      return firstLaunch
    }]
  ]

  for (const [kind, reach] of states) {
    const firstLaunch = await reach()
    assert.equal(firstLaunch.state.kind, kind)
    const before = firstLaunch.state
    const seen: unknown[] = []
    const stop = firstLaunch.subscribe(state => seen.push(state))

    firstLaunch.enter()

    stop()
    assert.strictEqual(firstLaunch.state, before, kind)
    assert.equal(seen.length, 1, `${kind}: no change announced`)
  }
})

test('first launch: going in is not a login; it calls nothing', async () => {
  // Every client method fails once launch has read the profile, and is
  // recorded, as an async method's throw would otherwise go unnoticed.
  let launched = false
  const callsAfterLaunch: string[] = []
  const guard = (name: string) => {
    if (!launched) return
    callsAfterLaunch.push(name)
    throw new Error(`${name} called after launch`)
  }
  const firstLaunch = createFirstLaunch({
    waitUntilReady: async () => { guard('waitUntilReady'); return { status: 'ready' } },
    getMyProfile: async () => { guard('getMyProfile'); return completeProfile({ name: 'Mere' }) },
    createMyProfile: async () => { guard('createMyProfile'); throw new Error('unreachable') },
    close: async () => { guard('close') }
  })
  await firstLaunch.start()
  launched = true

  firstLaunch.enter()

  assert.equal(firstLaunch.state.kind, 'ready')
  assert.deepEqual(callsAfterLaunch, [])
})

test('first launch: a screen that stops following hears no more', async () => {
  const firstLaunch = createFirstLaunch(stubClient())
  const seen: string[] = []
  const unsubscribe = firstLaunch.subscribe(state => seen.push(state.kind))

  unsubscribe()
  await firstLaunch.start()

  assert.deepEqual(seen, ['starting'])
})
