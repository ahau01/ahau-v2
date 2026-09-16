import test from 'node:test'
import assert from 'node:assert/strict'

import { asRecordId } from '../contract/semantics.js'
import { createFixtureBackend } from './backend.js'
import { degraded, fullyEnforced } from './profiles.js'
import { GROUPS, IDENTITIES } from './data.js'
import { resetIds } from './store.js'

/**
 * Tests what the contract promises, not what the fixture happens to do.
 * Each names the promise it covers.
 */

const enforced = () => {
  resetIds()
  return createFixtureBackend({ capabilities: fullyEnforced })
}
const weak = () => {
  resetIds()
  return createFixtureBackend({ capabilities: degraded })
}

test('promise: a retracted record is hidden from reads', async () => {
  const backend = enforced()
  const withdrawn = asRecordId('person-withdrawn')
  assert.equal(await backend.person.getPerson(withdrawn), null)

  const listed = await backend.person.listPeople(GROUPS.main)
  assert.ok(!listed.some(p => p.id === withdrawn))
})

test('promise: retraction hides without erasing', async () => {
  const backend = enforced()
  const target = asRecordId('person-mere')
  assert.ok(await backend.person.getPerson(target), 'visible before retraction')

  await backend.person.retractPerson(target, 'withdrawn by whānau')
  assert.equal(await backend.person.getPerson(target), null, 'hidden after')

  // Not erased: retracting again still finds the record to retract.
  const second = await backend.person.retractPerson(target, 'again')
  assert.ok(second.id, 'the record is still there to act on')
})

test('promise: retracting a person also retracts their links', async () => {
  const backend = enforced()
  await backend.person.retractPerson(asRecordId('person-tane'), null)
  const family = await backend.whakapapa.getFamily({
    from: asRecordId('person-rangi'),
    depth: 1
  })
  assert.ok(family.supported)
  if (family.supported) {
    assert.ok(!family.value.some(l => l.child === asRecordId('person-tane')))
  }
})

test('promise: group-scoped records are invisible to a non-member', async () => {
  resetIds()
  const outsider = createFixtureBackend({
    viewer: IDENTITIES.outsider,
    capabilities: fullyEnforced
  })
  assert.deepEqual(await outsider.person.listPeople(GROUPS.main), [])
  assert.equal(await outsider.person.getPerson(asRecordId('person-rangi')), null)

  const member = enforced()
  assert.ok((await member.person.listPeople(GROUPS.main)).length > 0)
})

test('promise: a public record stays visible to a non-member', async () => {
  resetIds()
  const outsider = createFixtureBackend({
    viewer: IDENTITIES.outsider,
    capabilities: fullyEnforced
  })
  const groups = await outsider.group.listGroups()
  assert.ok(groups.length > 0, 'the public face of a group is discoverable')
})

test('promise: a declined capability is a value, not an exception', async () => {
  const backend = weak()
  const result = await backend.person.findPeopleByName('Mere', null)
  assert.equal(result.supported, false)
  if (!result.supported) assert.equal(result.capability, 'nameSearch')
})

test('promise: the same call path works under both profiles', async () => {
  for (const backend of [enforced(), weak()]) {
    const result = await backend.person.findPeopleByName('Mere', null)
    // No branching on which backend this is -- only on what it answered.
    if (result.supported) assert.ok(Array.isArray(result.value))
    else assert.equal(typeof result.detail, 'string')
  }
})

test('promise: traversal refuses a walk deeper than declared', async () => {
  const backend = weak()
  const deep = await backend.whakapapa.getDescendants({
    from: asRecordId('person-rangi'),
    depth: 5
  })
  assert.equal(deep.supported, false)
  if (!deep.supported) assert.equal(deep.capability, 'maxTraversalDepth')

  const shallow = await backend.whakapapa.getDescendants({
    from: asRecordId('person-rangi'),
    depth: 2
  })
  assert.ok(shallow.supported)
})

test('promise: an unbounded walk reaches a grandchild', async () => {
  const backend = enforced()
  const result = await backend.whakapapa.getDescendants({
    from: asRecordId('person-rangi'),
    depth: null
  })
  assert.ok(result.supported)
  if (result.supported) {
    assert.ok(
      result.value.some(l => l.child === asRecordId('person-ari')),
      'two generations down'
    )
  }
})

test('promise: paired writes report atomicity honestly', async () => {
  const strong = await enforced().group.retractGroup(GROUPS.main, 'closing')
  assert.equal(strong.status, 'atomic')

  const loose = await weak().group.retractGroup(GROUPS.main, 'closing')
  assert.equal(loose.status, 'independent')
  if (loose.status === 'independent') {
    assert.ok(loose.parts.some(p => !p.outcome.ok), 'partial completion is visible')
  }
})

test('promise: writes acknowledge committed or partial', async () => {
  const strong = await enforced().story.retractStory(asRecordId('story-hui'), null)
  assert.equal(strong.acknowledgement.status, 'committed')

  const loose = await weak().story.retractStory(asRecordId('story-hui'), null)
  assert.equal(loose.acknowledgement.status, 'partial')
  if (loose.acknowledgement.status === 'partial') {
    assert.ok(loose.acknowledgement.accepted < loose.acknowledgement.attempted)
  }
})

test('promise: accepting an application confers membership', async () => {
  const backend = enforced()
  const before = await backend.group.listMembers(GROUPS.main)
  await backend.applications.acceptApplication(asRecordId('application-pending'), null)
  const after = await backend.group.listMembers(GROUPS.main)
  assert.equal(after.length, before.length + 1)
  assert.ok(after.some(m => m.identity === IDENTITIES.outsider))
})

test('promise: declining leaves the proposal visible, retracting does not', async () => {
  const backend = enforced()
  const target = asRecordId('submission-pending')

  await backend.submissions.rejectSubmission(target, 'not this time')
  assert.ok(
    (await backend.submissions.listSubmissions(null)).some(s => s.id === target),
    'a declined proposal stays on the record'
  )

  await backend.submissions.retractSubmission(target, 'withdrawn')
  assert.ok(
    !(await backend.submissions.listSubmissions(null)).some(s => s.id === target),
    'a retracted proposal is gone from view'
  )
})

test('promise: the viewer reports their own memberships', async () => {
  const viewer = await enforced().person.getViewer()
  assert.equal(viewer.identity, IDENTITIES.kaitiaki)
  assert.ok(viewer.memberships.some(m => m.role === 'kaitiaki'))
})

// --- Added after acting on friction findings 1-3 ---

test('finding 2: creating a group returns an identity you can use', async () => {
  const backend = enforced()
  const created = await backend.group.createGroup({
    id: null,
    name: 'Te Rōpū Hou',
    description: null,
    avatar: null
  })
  // The returned id is a GroupId, so it can be passed straight back in.
  const fetched = await backend.group.getGroup(created.id)
  assert.ok(fetched, 'the created group is retrievable by the returned id')
  assert.equal(fetched?.id, created.id)
})

test('finding 2: creating a subgroup returns a usable identity too', async () => {
  const backend = enforced()
  const created = await backend.group.createSubgroup(GROUPS.main, {
    id: null,
    name: 'Te Whānau Hou',
    description: null,
    avatar: null
  })
  const listed = await backend.group.listSubgroups(GROUPS.main)
  assert.ok(listed.some(g => g.id === created.id))
})

test('finding 3: a permission write reports how strongly it was applied', async () => {
  const strong = await enforced().group.grantAdministration(GROUPS.main, [
    IDENTITIES.member
  ])
  assert.equal(strong.enforcement, 'enforced')

  const loose = await weak().group.grantAdministration(GROUPS.main, [
    IDENTITIES.member
  ])
  assert.equal(loose.enforcement, 'advisory')
  // Both succeeded. Only the enforcement field distinguishes a permission from
  // a suggestion, which is the point of the finding.
  assert.ok(strong.id && loose.id)
})

test('finding 3: admitting a member reports enforcement', async () => {
  const loose = await weak().applications.acceptApplication(
    asRecordId('application-pending'),
    null
  )
  assert.equal(loose.enforcement, 'advisory')
})

test('finding 1: approval states what it applied', async () => {
  const backend = enforced()
  const result = await backend.submissions.approveSubmission(
    asRecordId('submission-pending'),
    null
  )
  assert.equal(result.submission, asRecordId('submission-pending'))
  assert.ok(Array.isArray(result.applied))
  assert.equal(result.enforcement, 'enforced')
})

test('finding 1: field approval reports advisory enforcement on a weak backend', async () => {
  const result = await weak().submissions.approveSubmissionFields(
    asRecordId('submission-pending'),
    'edit-person',
    ['preferredName'],
    null
  )
  assert.equal(result.enforcement, 'advisory')
})
