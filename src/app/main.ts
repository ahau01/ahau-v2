/// <reference types="vite/client" />
import { mount, unmount } from 'svelte'

import './tokens.css'
import FirstLaunch from './first-launch/FirstLaunch.svelte'
import { createPretendProfileClient } from '../profile/pretend-client.js'

// Pretend client until #18 connects the real conductor. `?pretend=fail-start`
// or `?pretend=fail-save` demos the failure screens.
const pretend = new URLSearchParams(location.search).get('pretend')
const client = createPretendProfileClient({
  storage: localStorage,
  latencyMs: 600,
  ...(pretend === 'fail-start' && { fail: 'start' as const }),
  ...(pretend === 'fail-save' && { fail: 'save' as const })
})

const target = document.getElementById('app')
if (!target) throw new Error('#app not found')

const app = mount(FirstLaunch, { target, props: { client } })

// main.ts made the client, so main.ts closes it. Not the component: Svelte HMR
// can swap FirstLaunch without rerunning this file, which would hand the new
// component a closed client.
import.meta.hot?.dispose(() => {
  void unmount(app)
  void client.close()
})

export default app
