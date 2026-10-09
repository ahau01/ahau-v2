/// <reference types="vite/client" />
import { mount, unmount } from 'svelte'

import './tokens.css'
import FirstLaunch from './first-launch/FirstLaunch.svelte'
import type { ProfileClient } from '../profile/client.js'
import { createDevProfileClient } from '../profile/dev-connection.js'
import { createPretendProfileClient } from '../profile/pretend-client.js'

const target = document.getElementById('app')
if (!target) throw new Error('#app not found')

const client = profileClient()
const app = mount(FirstLaunch, { target, props: { client } })

// main.ts made the client, so main.ts closes it. Not the component: Svelte HMR
// can swap FirstLaunch without rerunning this file, which would hand the new
// component a closed client.
import.meta.hot?.dispose(() => {
  void unmount(app)
  void client.close()
})

/**
 * In dev, the local conductor from `npm run conductor`, reached through the
 * dev server. `?pretend` runs without Holochain instead; `?pretend=fail-start`
 * or `?pretend=fail-save` demos the failure screens.
 */
function profileClient (): ProfileClient {
  const pretend = new URLSearchParams(location.search).get('pretend')
  if (pretend !== null) {
    return createPretendProfileClient({
      storage: localStorage,
      latencyMs: 600,
      ...(pretend === 'fail-start' && { fail: 'start' as const }),
      ...(pretend === 'fail-save' && { fail: 'save' as const })
    })
  }
  return createDevProfileClient()
}

export default app
