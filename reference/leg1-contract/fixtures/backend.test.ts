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
    ['preferredName'],
    null
  )
  assert.equal(result.enforcement, 'advisory')
})

// --- Added after acting on finding 10 ---

test('finding 10: approval applies the proposed change', async () => {
  const backend = enforced()
  const target = asRecordId('person-mere')

  const before = await backend.person.getPerson(target)
  assert.equal(before?.preferredName, 'Mere')

  const result = await backend.submissions.approveSubmission(
    asRecordId('submission-pending'),
    null
  )

  assert.deepEqual(result.applied, [target], 'the approval names what it changed')
  const after = await backend.person.getPerson(target)
  assert.equal(after?.preferredName, 'Mere Ānaru', 'the change was actually applied')
})

test('finding 10: an enforcing backend honours the field restriction', async () => {
  const backend = enforced()
  const target = asRecordId('person-mere')

  // The proposal changes preferredName. Allow a different field only.
  await backend.submissions.approveSubmissionFields(
    asRecordId('submission-pending'),
    ['legalName'],
    null
  )

  const after = await backend.person.getPerson(target)
  assert.equal(
    after?.preferredName,
    'Mere',
    'preferredName was not in allowedFields, so it was not applied'
  )
})

test('finding 10: an advisory backend records the restriction but cannot apply it', async () => {
  const backend = weak()
  const target = asRecordId('person-mere')

  const result = await backend.submissions.approveSubmissionFields(
    asRecordId('submission-pending'),
    ['legalName'],
    null
  )

  assert.equal(result.enforcement, 'advisory')
  const after = await backend.person.getPerson(target)
  assert.equal(
    after?.preferredName,
    'Mere Ānaru',
    'the restriction was not enforced -- the whole change landed'
  )
})

test('finding 4: writing takes the identifier as an argument', async () => {
  const backend = enforced()
  const created = await backend.person.savePerson(null, {
    preferredName: 'Anaru',
    legalName: null,
    gender: null,
    birthOrder: null,
    customFields: []
  })
  assert.ok(created.id, 'null creates')

  const updated = await backend.person.savePerson(created.id, {
    preferredName: 'Anaru Rātana',
    legalName: null,
    gender: null,
    birthOrder: null,
    customFields: []
  })
  assert.equal(updated.id, created.id, 'an id updates in place')
})

// --- Added after acting on findings 5 and 6 ---

test('finding 6: a storehouse can be introduced, then blocked', async () => {
  const backend = enforced()
  assert.deepEqual(await backend.storehouse.listStorehouses(), [], 'none known yet')

  const accepted = await backend.storehouse.acceptInvite('abc123')
  const known = await backend.storehouse.listStorehouses()
  assert.equal(known.length, 1, 'accepting an invite introduces a storehouse')
  assert.equal(known[0]?.id, accepted.id)

  const connectedBefore = await backend.storehouse.listConnectedPeers()
  assert.equal(connectedBefore.length, 1)

  await backend.storehouse.blockStorehouse(accepted.id)
  const connectedAfter = await backend.storehouse.listConnectedPeers()
  assert.equal(connectedAfter.length, 0, 'a blocked storehouse is not connected')
  assert.equal(
    (await backend.storehouse.listStorehouses()).length,
    1,
    'but it is still known'
  )
})

test('finding 5: media can be introduced and reaches a story inline', async () => {
  const backend = enforced()

  const media = await backend.artefact.uploadMedia({
    content: null,
    sizeBytes: 1024,
    mimeType: 'image/png',
    encrypt: true
  })
  assert.ok(media.ref, 'upload produces a reference')

  const artefact = await backend.artefact.saveArtefact(null, {
    media,
    description: 'A fictional photograph',
    visibility: { scope: 'group', group: GROUPS.main }
  })

  const story = await backend.story.saveStory(null, {
    title: 'With a photograph',
    description: null,
    artefacts: [artefact.id],
    mentions: [],
    visibility: { scope: 'group', group: GROUPS.main }
  })

  const read = await backend.story.getStory(story.id)
  assert.equal(read?.artefacts.length, 1, 'the artefact arrives with the story')
  assert.equal(
    read?.artefacts[0]?.media?.mimeType,
    'image/png',
    'delivered inline, not as an id nothing could resolve'
  )
})

test('a credential can be presented, not only listed', async () => {
  const result = await enforced().credentials.presentCredential(
    'https://example.invalid/verify',
    'credential-membership'
  )
  assert.ok(result.id)
})
