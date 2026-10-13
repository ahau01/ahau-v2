import { completeProfile, type ProfileClient } from './client.js'

/** Standard successful client behavior for tests that only override selected calls. */
export function stubProfileClient (overrides: Partial<ProfileClient> = {}): ProfileClient {
  return {
    waitUntilReady: async () => ({ status: 'ready' }),
    getMyProfile: async () => null,
    createMyProfile: async profile => ({ status: 'created', profile: completeProfile(profile) }),
    updateMyProfile: async profile => ({ status: 'updated', profile: completeProfile(profile) }),
    close: async () => {},
    ...overrides
  }
}
