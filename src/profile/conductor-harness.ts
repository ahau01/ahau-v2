/**
 * Shared setup for the profile real-conductor tests. Not a test file itself.
 */

import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

import type { PlayerApp } from '@holochain/tryorama'

import { PROFILE_FUNCTIONS, ZOME, createProfileClient, type ProfileClient } from './client.js'

/** The real ahau hApp. */
export const happ = fileURLToPath(new URL('../../workdir/ahau.happ', import.meta.url))

/** TEST ONLY: the same DNA with a rogue coordinator that bypasses the app. */
export const rogueHapp = fileURLToPath(new URL('../../workdir/rogue/ahau-rogue.happ', import.meta.url))

/**
 * A profile client connected to the player's app and ready to use. Like the
 * app token, signing credentials stand in for what a launcher provides; they
 * let this process sign zome calls for the agent, nothing more.
 */
export async function readyClient (player: PlayerApp): Promise<ProfileClient> {
  const admin = player.conductor.adminWs()
  const port = await player.conductor.attachAppInterface({ port: 0, allowed_origins: 'ahau-test' })
  const { token } = await admin.issueAppAuthenticationToken({ installed_app_id: player.appId })
  await admin.authorizeSigningCredentials(cellOf(player).cell_id, {
    type: 'listed',
    value: PROFILE_FUNCTIONS.map((fn): [string, string] => [ZOME, fn])
  })
  const client = createProfileClient({
    url: new URL(`ws://127.0.0.1:${port}`),
    appToken: token,
    origin: 'ahau-test',
    timeoutMs: 10_000
  })
  const readiness = await client.waitUntilReady()
  assert.deepEqual(readiness, { status: 'ready' })
  return client
}

/** The player's one cell. */
export function cellOf (player: PlayerApp) {
  const [cell] = player.cells
  if (!cell) throw new Error('the app has no cell')
  return cell
}
