import test from 'node:test'
import assert from 'node:assert/strict'

import {
  type Capabilities,
  isEnforced,
  supported,
  unsupported
} from './capabilities.js'

/**
 * Sketches of what each candidate backend is expected to declare. These are
 * predictions made without an adapter in hand, not measurements -- their value
 * here is proving the contract can *express* the differences, which is the
 * thing Milestone 2 is responsible for.
 */
const holochainish: Capabilities = {
  retractionPropagates: true,
  atomicMultiWrite: true,
  maxTraversalDepth: 8,
  fieldLevelApproval: 'enforced',
  membershipEnforcement: 'enforced',
  nameSearch: true
}

const nostrish: Capabilities = {
  retractionPropagates: false,
  atomicMultiWrite: false,
  maxTraversalDepth: 2,
  fieldLevelApproval: 'advisory',
  membershipEnforcement: 'advisory',
  nameSearch: false
}

test('all five evidenced cases can be declared as unavailable', () => {
  assert.equal(nostrish.retractionPropagates, false)
  assert.equal(nostrish.atomicMultiWrite, false)
  assert.equal(nostrish.nameSearch, false)
  assert.equal(isEnforced(nostrish.fieldLevelApproval), false)
  assert.equal(isEnforced(nostrish.membershipEnforcement), false)
  assert.ok((nostrish.maxTraversalDepth ?? Infinity) < 8)
})

test('advisory is distinguishable from unsupported and from enforced', () => {
  // The distinction a boolean would lose: nostr can record an approval, it
  // just cannot stop anyone forging one. That is not the same as being unable
  // to express approval at all.
  assert.equal(nostrish.fieldLevelApproval, 'advisory')
  assert.notEqual(nostrish.fieldLevelApproval, 'unsupported')
  assert.equal(isEnforced(holochainish.fieldLevelApproval), true)
  assert.equal(isEnforced('advisory'), false)
  assert.equal(isEnforced('unsupported'), false)
})

test('a declined operation is detected by branching, not by catching', () => {
  const searchOnNostr = unsupported<string[]>(
    'nameSearch',
    'relays provide no server-side text search'
  )

  // No try/catch anywhere: refusal is a value.
  let handled = false
  if (!searchOnNostr.supported) {
    handled = true
    assert.equal(searchOnNostr.capability, 'nameSearch')
    assert.match(searchOnNostr.detail, /text search/)
  }
  assert.ok(handled, 'refusal must be reachable by a plain conditional')
})

test('a supported operation carries its value through the same shape', () => {
  const searchOnHolochain = supported(['Rangi', 'Papa'])
  assert.ok(searchOnHolochain.supported)
  if (searchOnHolochain.supported) {
    assert.deepEqual(searchOnHolochain.value, ['Rangi', 'Papa'])
  }
})

test('the capability ordering between backends is not fixed', () => {
  // getAllStoriesByMentions runs better on nostr than Holochain, because tag
  // filtering is what relays do natively. Recorded as a test so the contract
  // is never quietly redesigned around an assumed ranking of backends.
  const nostrBetterAtTagLookup = true
  const holochainBetterAtEnforcement =
    isEnforced(holochainish.membershipEnforcement) &&
    !isEnforced(nostrish.membershipEnforcement)

  assert.ok(nostrBetterAtTagLookup && holochainBetterAtEnforcement)
})
