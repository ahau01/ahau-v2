/**
 * The backend the shell talks to.
 *
 * One seam. The shell imports DataAccess and nothing protocol-specific, so
 * swapping this for a Holochain or nostr adapter in Leg 2 changes this file
 * and no screen.
 */

import type { Capabilities, DataAccess } from '../contract/index.js'
import { createFixtureBackend } from '../fixtures/backend.js'
import { degraded, fullyEnforced } from '../fixtures/profiles.js'

export type ProfileName = 'enforced' | 'degraded'

const profiles: Record<ProfileName, Capabilities> = {
  enforced: fullyEnforced,
  degraded
}

export function createBackend (profile: ProfileName): DataAccess {
  return createFixtureBackend({ capabilities: profiles[profile] })
}
