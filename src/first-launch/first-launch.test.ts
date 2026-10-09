import test from 'node:test'
import assert from 'node:assert/strict'

import type { Profile, ProfileClient } from '../profile/client.js'
import { createFirstLaunch } from './first-launch.js'

/**
 * Which first-launch screen to show, decided without Holochain. The client
 * is a stub of the real profile client interface.
 */

function stubClient(overrides: Partial<ProfileClient> = {}): ProfileClient {
  return {
    waitUntilReady: async () => ({ status: 'ready' }),
    getMyProfile: async () => null,
    createMyProfile: async profile => ({ status: 'created', profile }),
    close: async () => {},
    ...overrides
  }
}

const never = <T>() => new Promise<T>(() => {})

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

test('first launch: an agent with no profile needs to create one', async () => {
  const firstLaunch = createFirstLaunch(stubClient({ getMyProfile: async () => null }))

  await firstLaunch.start()

  assert.deepEqual(firstLaunch.state, { kind: 'needs-profile', name: '' })
})

test('first launch: a returning agent goes straight in', async () => {
  const firstLaunch = createFirstLaunch(stubClient({ getMyProfile: async () => ({ name: 'Mere' }) }))

  await firstLaunch.start()

  assert.deepEqual(firstLaunch.state, { kind: 'ready', profile: { name: 'Mere' } })
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

test('first launch: creating a profile lets the person in', async () => {
  const firstLaunch = createFirstLaunch(stubClient())
  await firstLaunch.start()

  await firstLaunch.submit('Mere')

  assert.deepEqual(firstLaunch.state, { kind: 'ready', profile: { name: 'Mere' } })
})

test('first launch: if saving fails, the person can try again without retyping', async () => {
  const firstLaunch = createFirstLaunch(stubClient({
    createMyProfile: async () => ({ status: 'failed', reason: 'Holochain did not answer' })
  }))
  await firstLaunch.start()

  await firstLaunch.submit('Mere')

  assert.deepEqual(firstLaunch.state, {
    kind: 'needs-profile',
    name: 'Mere',
    error: 'Holochain did not answer'
  })
})

test('first launch: while saving, it shows saving and pressing save again does not save twice', async () => {
  let creates = 0
  const firstLaunch = createFirstLaunch(stubClient({
    createMyProfile: () => { creates++; return never() }
  }))
  await firstLaunch.start()

  void firstLaunch.submit('Mere')
  void firstLaunch.submit('Mere')

  assert.deepEqual(firstLaunch.state, { kind: 'saving', name: 'Mere' })
  assert.equal(creates, 1)
})

test('first launch: a profile needs a name before it is saved', async () => {
  let creates = 0
  const firstLaunch = createFirstLaunch(stubClient({
    createMyProfile: async profile => { creates++; return { status: 'created', profile } }
  }))
  await firstLaunch.start()

  await firstLaunch.submit('')

  assert.equal(firstLaunch.state.kind, 'needs-profile')
  assert.ok(firstLaunch.state.kind === 'needs-profile' && firstLaunch.state.error, 'Please enter a name.')
  assert.equal(creates, 0)
})

test('first launch: a name of only spaces is no name', async () => {
  let creates = 0
  const firstLaunch = createFirstLaunch(stubClient({
    createMyProfile: async profile => { creates++; return { status: 'created', profile } }
  }))
  await firstLaunch.start()

  await firstLaunch.submit('   ')

  assert.equal(firstLaunch.state.kind, 'needs-profile')
  assert.equal(creates, 0)
})

test('first launch: a name is saved without surrounding spaces', async () => {
  let saved: Profile | undefined
  const firstLaunch = createFirstLaunch(stubClient({
    createMyProfile: async profile => { saved = profile; return { status: 'created', profile } }
  }))
  await firstLaunch.start()

  await firstLaunch.submit('  Mere ')

  assert.deepEqual(saved, { name: 'Mere' })
})

test('first launch: a screen can follow each state as it changes', async () => {
  const firstLaunch = createFirstLaunch(stubClient())
  const seen: string[] = []
  firstLaunch.subscribe(state => seen.push(state.kind))

  await firstLaunch.start()
  await firstLaunch.submit('Mere')

  assert.deepEqual(seen, ['starting', 'needs-profile', 'saving', 'ready'])
})

test('first launch: a screen that stops following hears no more', async () => {
  const firstLaunch = createFirstLaunch(stubClient())
  const seen: string[] = []
  const unsubscribe = firstLaunch.subscribe(state => seen.push(state.kind))

  unsubscribe()
  await firstLaunch.start()

  assert.deepEqual(seen, ['starting'])
})
