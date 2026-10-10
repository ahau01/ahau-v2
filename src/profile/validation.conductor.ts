import test from 'node:test'
import assert from 'node:assert/strict'

import { dhtSync, runScenario, type PlayerApp } from '@holochain/tryorama'

import { BIRTH_ORDER_INVALID, GENDERS, completeProfile } from './client.js'
import { cellOf, happ, readyClient, rogueHapp } from './conductor-harness.js'

/**
 * Profile rules that must hold even when someone bypasses the app. The
 * second agent runs a rogue coordinator (test only) on the same DNA, so its
 * writes skip our client and coordinator entirely; only validation stands
 * between it and the first agent's profile. What we check is what each side
 * sees: the rogue write fails, and the owner still sees their own profile.
 *
 * Needs `nix develop`; run with `npm run test:conductor`.
 */

test('promise: another agent cannot overwrite my profile, even bypassing the app', async () => {
  await runScenario(async scenario => {
    const [owner, rogue] = await twoAgentsOnOneNetwork(scenario)
    const ownerClient = await readyClient(owner)
    await ownerClient.createMyProfile({ name: 'Mere' })
    await dhtSync([owner, rogue], cellOf(owner).cell_id[0])

    await assert.rejects(
      cellOf(rogue).callZome({
        zome_name: 'rogue_profiles',
        fn_name: 'update_agent_profile',
        payload: { agent: owner.agentPubKey, profile: { name: 'Not Mere' } }
      }),
      /Only the author of a profile can change it/
    )
    assert.deepEqual(await ownerClient.getMyProfile(), completeProfile({ name: 'Mere' }))
    await ownerClient.close()
  })
})

test('promise: another agent cannot create a profile for me, even bypassing the app', async () => {
  await runScenario(async scenario => {
    const [owner, rogue] = await twoAgentsOnOneNetwork(scenario)
    // Every action is signed by its author, so the rogue's write can only
    // ever be the rogue's own profile, never one under the owner's key.
    await cellOf(rogue).callZome({
      zome_name: 'rogue_profiles',
      fn_name: 'create_profile',
      payload: { name: 'Mere, as written by someone else' }
    })
    await dhtSync([owner, rogue], cellOf(owner).cell_id[0])

    const ownerClient = await readyClient(owner)
    assert.equal(await ownerClient.getMyProfile(), null)
    const created = await ownerClient.createMyProfile({ name: 'Mere' })
    assert.equal(created.status, 'created')
    assert.deepEqual(await ownerClient.getMyProfile(), completeProfile({ name: 'Mere' }))
    await ownerClient.close()
  })
})

test('promise: another agent cannot delete my profile, even bypassing the app', async () => {
  await runScenario(async scenario => {
    const [owner, rogue] = await twoAgentsOnOneNetwork(scenario)
    const ownerClient = await readyClient(owner)
    await ownerClient.createMyProfile({ name: 'Mere' })
    await dhtSync([owner, rogue], cellOf(owner).cell_id[0])

    await assert.rejects(
      cellOf(rogue).callZome({
        zome_name: 'rogue_profiles',
        fn_name: 'delete_agent_profile',
        payload: owner.agentPubKey
      }),
      /Profiles can't be deleted yet/
    )
    assert.deepEqual(await ownerClient.getMyProfile(), completeProfile({ name: 'Mere' }))
    await ownerClient.close()
  })
})

test('promise: another agent cannot read my personal information, even bypassing the app', async () => {
  await runScenario(async scenario => {
    const [owner, rogue] = await twoAgentsOnOneNetwork(scenario)
    const ownerClient = await readyClient(owner)
    await ownerClient.createMyProfile({ name: 'Mere', personal: { email: 'mere@example.com', phone: '021 000 0000' } })
    await dhtSync([owner, rogue], cellOf(owner).cell_id[0])

    const seen = await cellOf(rogue).callZome({
      zome_name: 'rogue_profiles',
      fn_name: 'get_agent_personal_information',
      payload: owner.agentPubKey
    })
    // The rogue finds the entry's action, which is public, but not its contents.
    assert.deepEqual(seen, { actionFound: true, contents: null })
    await ownerClient.close()
  })
})

test('promise: another agent cannot overwrite my personal information, even bypassing the app', async () => {
  await runScenario(async scenario => {
    const [owner, rogue] = await twoAgentsOnOneNetwork(scenario)
    const ownerClient = await readyClient(owner)
    await ownerClient.createMyProfile({ name: 'Mere', personal: { email: 'mere@example.com' } })
    await dhtSync([owner, rogue], cellOf(owner).cell_id[0])

    await assert.rejects(
      cellOf(rogue).callZome({
        zome_name: 'rogue_profiles',
        fn_name: 'update_agent_personal_information',
        payload: { agent: owner.agentPubKey, personal: { email: 'not-mere@example.com' } }
      }),
      /Only the author of a profile can change it/
    )
    assert.deepEqual(
      (await ownerClient.getMyProfile())?.personal,
      completeProfile({ name: 'Mere', personal: { email: 'mere@example.com' } }).personal
    )
    await ownerClient.close()
  })
})

test('promise: another agent cannot delete my personal information, even bypassing the app', async () => {
  await runScenario(async scenario => {
    const [owner, rogue] = await twoAgentsOnOneNetwork(scenario)
    const ownerClient = await readyClient(owner)
    await ownerClient.createMyProfile({ name: 'Mere', personal: { email: 'mere@example.com' } })
    await dhtSync([owner, rogue], cellOf(owner).cell_id[0])

    await assert.rejects(
      cellOf(rogue).callZome({
        zome_name: 'rogue_profiles',
        fn_name: 'delete_agent_personal_information',
        payload: owner.agentPubKey
      }),
      /Personal information can't be deleted yet/
    )
    await ownerClient.close()
  })
})

test('promise: personal information cannot be written without a profile, even bypassing the app', async () => {
  await runScenario(async scenario => {
    const [owner] = await oneAgentWithTestZome(scenario)

    await assert.rejects(
      testZome(owner, 'create_personal_information', { email: 'mere@example.com' }),
      /Personal information needs a profile first/
    )
  })
})

test('promise: an agent cannot hold a second personal information, even bypassing the app', async () => {
  await runScenario(async scenario => {
    const [owner] = await oneAgentWithTestZome(scenario)
    await testZome(owner, 'create_profile', { name: 'Mere' })
    await testZome(owner, 'create_personal_information', { email: 'mere@example.com' })

    await assert.rejects(
      testZome(owner, 'create_personal_information', { email: 'other@example.com' }),
      /This agent already has personal information/
    )
    const ownerClient = await readyClient(owner)
    assert.equal((await ownerClient.getMyProfile())?.personal.email, 'mere@example.com')
    await ownerClient.close()
  })
})

// No screen offers editing yet (ADR-0008): these pin what validation allows,
// so editing needs no rule change when it ships.
test('promise: I can change my own profile, and the change reads back', async () => {
  await runScenario(async scenario => {
    const [owner] = await oneAgentWithTestZome(scenario)
    await testZome(owner, 'create_profile', { name: 'Mere' })

    await testZome(owner, 'update_my_profile', { name: 'Mere Rangi' })
    const ownerClient = await readyClient(owner)
    assert.deepEqual(await ownerClient.getMyProfile(), completeProfile({ name: 'Mere Rangi' }))
    await ownerClient.close()
  })
})

test('promise: I can change my own personal information, and the change reads back', async () => {
  await runScenario(async scenario => {
    const [owner] = await oneAgentWithTestZome(scenario)
    await testZome(owner, 'create_profile', { name: 'Mere' })
    await testZome(owner, 'create_personal_information', { email: 'mere@example.com' })

    await testZome(owner, 'update_my_personal_information', { email: 'mere.rangi@example.com' })
    const ownerClient = await readyClient(owner)
    assert.equal((await ownerClient.getMyProfile())?.personal.email, 'mere.rangi@example.com')
    await ownerClient.close()
  })
})

// Every version hangs off the first one, so none can be orphaned on a fork
// of updates (ADR-0008).
test('promise: a profile change that points at an earlier change is refused, even bypassing the app', async () => {
  await runScenario(async scenario => {
    const [owner] = await oneAgentWithTestZome(scenario)
    await testZome(owner, 'create_profile', { name: 'Mere' })
    await testZome(owner, 'update_my_profile', { name: 'Mere Rangi' })

    await assert.rejects(
      testZome(owner, 'update_my_latest_profile', { name: 'Mere R.' }),
      /Changes to a profile must point at its first version/
    )
    const ownerClient = await readyClient(owner)
    assert.deepEqual(await ownerClient.getMyProfile(), completeProfile({ name: 'Mere Rangi' }))
    await ownerClient.close()
  })
})

test('promise: a personal information change that points at an earlier change is refused, even bypassing the app', async () => {
  await runScenario(async scenario => {
    const [owner] = await oneAgentWithTestZome(scenario)
    await testZome(owner, 'create_profile', { name: 'Mere' })
    await testZome(owner, 'create_personal_information', { email: 'mere@example.com' })
    await testZome(owner, 'update_my_personal_information', { email: 'mere.rangi@example.com' })

    await assert.rejects(
      testZome(owner, 'update_my_latest_personal_information', { email: 'mere.r@example.com' }),
      /Changes to a profile must point at its first version/
    )
    const ownerClient = await readyClient(owner)
    assert.equal((await ownerClient.getMyProfile())?.personal.email, 'mere.rangi@example.com')
    await ownerClient.close()
  })
})

// Deleting would hide a profile the one-profile rule then never lets you
// replace, so deletes wait until retraction is designed with editing.
test('promise: a profile cannot be deleted yet, even by its author', async () => {
  await runScenario(async scenario => {
    const [owner] = await oneAgentWithTestZome(scenario)
    await testZome(owner, 'create_profile', { name: 'Mere' })

    await assert.rejects(testZome(owner, 'delete_my_profile', null), /Profiles can't be deleted yet/)
    const ownerClient = await readyClient(owner)
    assert.deepEqual(await ownerClient.getMyProfile(), completeProfile({ name: 'Mere' }))
    await ownerClient.close()
  })
})

test('promise: an agent cannot hold a second profile, even bypassing the app', async () => {
  await runScenario(async scenario => {
    const [, rogue] = await twoAgentsOnOneNetwork(scenario)
    const write = (name: string) => cellOf(rogue).callZome({
      zome_name: 'rogue_profiles',
      fn_name: 'create_profile',
      payload: { name }
    })

    await write('First')
    await assert.rejects(write('Second'), /This agent already has a profile/)
  })
})

test('promise: a profile with invalid fields is refused, even bypassing the app', async () => {
  await runScenario(async scenario => {
    const [, rogue] = await twoAgentsOnOneNetwork(scenario)
    const write = (profile: unknown) => cellOf(rogue).callZome({
      zome_name: 'rogue_profiles',
      fn_name: 'create_profile',
      payload: profile
    })

    await assert.rejects(write({ name: '' }), /A profile needs a name/)
    await assert.rejects(write({ name: 'Mere', dateOfBirth: '01/01/1990' }), /Date of birth must be a real date/)
    // The form shows this same message before saving, so the two can't drift.
    await assert.rejects(write({ name: 'Mere', birthOrder: 0 }), (err: Error) => err.message.includes(BIRTH_ORDER_INVALID))
  })
})

test('promise: the zome takes exactly the genders the app offers, even bypassing the app', async () => {
  await runScenario(async scenario => {
    const [, rogue] = await twoAgentsOnOneNetwork(scenario)
    const write = (fnName: string, gender: string) => cellOf(rogue).callZome({
      zome_name: 'rogue_profiles',
      fn_name: fnName,
      payload: { name: 'Mere', gender }
    })

    // One profile per agent, so the first gender creates it and the rest change it.
    const [first, ...rest] = GENDERS
    await write('create_profile', first)
    for (const gender of rest) await write('update_my_profile', gender)
    await assert.rejects(write('update_my_profile', 'tane'))
  })
})

type Scenario = Parameters<Parameters<typeof runScenario>[0]>[0]

/** An owner on the real app and a rogue agent on the same DNA, connected. */
async function twoAgentsOnOneNetwork (scenario: Scenario): Promise<[PlayerApp, PlayerApp]> {
  const [owner, rogue] = await scenario.addPlayersWithApps([
    { appBundleSource: { type: 'path', value: happ } },
    { appBundleSource: { type: 'path', value: rogueHapp } }
  ])
  if (!owner || !rogue) throw new Error('expected two players')
  // If the rogue hApp were a different DNA, its writes would never reach the
  // owner's network and these tests would prove nothing.
  assert.deepEqual(cellOf(rogue).cell_id[0], cellOf(owner).cell_id[0], 'same DNA hash')
  await scenario.shareAllAgents()
  return [owner, rogue]
}

/** One agent whose app has both the real coordinator and the test one. */
async function oneAgentWithTestZome (scenario: Scenario): Promise<[PlayerApp]> {
  const player = await scenario.addPlayerWithApp({ appBundleSource: { type: 'path', value: rogueHapp } })
  return [player]
}

/**
 * Calls the test zome as this agent. Call before `readyClient`, whose
 * signing grant covers only the real profile functions.
 */
async function testZome (player: PlayerApp, fnName: string, payload: unknown): Promise<unknown> {
  return await cellOf(player).callZome({ zome_name: 'rogue_profiles', fn_name: fnName, payload })
}

