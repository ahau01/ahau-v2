import test from 'node:test'
import assert from 'node:assert/strict'

import { completeProfile } from './client.js'
import { profileForm } from './form.js'
import { createProfileEdit } from './edit.js'

test('profile edit: opening seeds the form, saving returns the saved profile', async () => {
  const edit = createProfileEdit(async profile => ({ status: 'updated', profile: completeProfile(profile) }))
  const saved = completeProfile({ name: 'Mere', profession: 'Kaiako' })
  edit.open(saved)
  assert.deepEqual(edit.state, { kind: 'open', form: profileForm(saved) })

  await edit.submit({ ...profileForm(saved), name: 'Mere Rangi' })

  assert.deepEqual(edit.state, { kind: 'saved', profile: completeProfile({ name: 'Mere Rangi', profession: 'Kaiako' }) })
})

test('profile edit: refusal keeps the typed form open with its validation error', async () => {
  const edit = createProfileEdit(async () => ({ status: 'failed', reason: 'unreachable' }))
  edit.open(completeProfile({ name: 'Mere' }))
  const typed = { ...profileForm(completeProfile({ name: 'Mere' })), name: '   ', profession: 'Kaiako' }

  await edit.submit(typed)

  assert.deepEqual(edit.state, { kind: 'refused', form: typed, errors: { name: 'Please enter a name.' } })
})

test('profile edit: each repeated refusal creates a fresh errors object', async () => {
  const edit = createProfileEdit(async () => ({ status: 'failed', reason: 'Holochain did not answer' }))
  edit.open(completeProfile({ name: 'Mere' }))
  const typed = { ...profileForm(completeProfile({ name: 'Mere' })), profession: 'Kaiako' }

  await edit.submit(typed)
  const first = edit.state
  await edit.submit(typed)
  const second = edit.state

  assert.equal(first.kind, 'refused')
  assert.equal(second.kind, 'refused')
  if (first.kind === 'refused' && second.kind === 'refused') {
    assert.deepEqual(second.form, typed)
    assert.notStrictEqual(first.errors, second.errors)
  }
})
