import test from 'node:test'
import assert from 'node:assert/strict'

import { dhtSync, runScenario, type PlayerApp } from '@holochain/tryorama'

import { happ, readyClient, rogueHapp } from './conductor-harness.js'

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
    assert.deepEqual(await ownerClient.getMyProfile(), { name: 'Mere' })
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
      /Only the author of a profile can change it/
    )
    assert.deepEqual(await ownerClient.getMyProfile(), { name: 'Mere' })
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

function cellOf (player: PlayerApp) {
  const [cell] = player.cells
  if (!cell) throw new Error('the app has no cell')
  return cell
}
