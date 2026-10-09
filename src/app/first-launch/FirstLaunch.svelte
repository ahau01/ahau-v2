<script lang="ts">
  import { untrack } from 'svelte'

  import {
    createFirstLaunch,
    isCreateProfileState,
    isLaunchState,
    type FirstLaunchState
  } from '../../first-launch/first-launch.js'
  import type { ProfileClient } from '../../profile/client.js'
  import niho from '../assets/niho.svg'
  import CreateProfile from './CreateProfile.svelte'
  import Home from './Home.svelte'
  import LaunchScreen from './LaunchScreen.svelte'

  // Screens render whichever state the first-launch logic is in; they never
  // call the profile client themselves.
  let { client }: { client: ProfileClient } = $props()

  // One client for the app's life; a new one means a new app, not a re-render.
  const firstLaunch = createFirstLaunch(untrack(() => client))
  let current = $state<FirstLaunchState>(firstLaunch.state)

  $effect(() => firstLaunch.subscribe(next => { current = next }))
  $effect(() => { void firstLaunch.start() })
</script>

<main class:launch={current.kind !== 'ready'} style:--niho={`url(${niho})`}>
  {#if isLaunchState(current)}
    <LaunchScreen {current} onbegin={() => firstLaunch.begin()} />
  {:else if isCreateProfileState(current)}
    <!-- As in the old app, the form opens over the welcome. Hidden from
         assistive tech while the dialog is open, which is modal. -->
    <div inert>
      <LaunchScreen current={{ kind: 'welcome' }} onbegin={() => {}} />
    </div>
    <CreateProfile
      {current}
      onsubmit={form => firstLaunch.submit(form)}
      oncancel={() => firstLaunch.cancel()}
    />
  {:else}
    <Home profile={current.profile} />
  {/if}
</main>

<style>
  main {
    display: grid;
    place-items: center;
    min-height: 100vh;
    padding: var(--ahau-space-4);
  }

  /* The old app's body.page--login (src/App.vue). Its views/Login.vue
     centred the welcome in the top 90% of the page. */
  main.launch {
    padding-bottom: 10vh;
    background: var(--niho) no-repeat;
    background-color: var(--ahau-page-background);
    background-size: cover;
    background-position-y: 10vh;
  }
</style>
