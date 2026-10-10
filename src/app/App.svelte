<script lang="ts">
  import { untrack } from 'svelte'

  import {
    createFirstLaunch,
    isCreateProfileState,
    isLaunchState,
    type FirstLaunchState
  } from '../first-launch/first-launch.js'
  import { LANDING } from '../navigation/routes.js'
  import type { ProfileClient } from '../profile/client.js'
  import niho from './assets/niho.svg'
  import CreateProfile from './first-launch/CreateProfile.svelte'
  import LaunchScreen from './first-launch/LaunchScreen.svelte'
  import { replaceRoute } from './shell/route.js'
  import Shell from './shell/Shell.svelte'

  // Screens render whichever state the launch logic is in; they never call
  // the profile client themselves. The shell shows the profile launch read,
  // and fetches nothing (design D5).
  let { client }: { client: ProfileClient } = $props()

  // One client for the app's life; a new one means a new app, not a re-render.
  const firstLaunch = createFirstLaunch(untrack(() => client))
  let current = $state<FirstLaunchState>(firstLaunch.state)

  $effect(() => firstLaunch.subscribe(next => { current = next }))
  $effect(() => { void firstLaunch.start() })

  // Going in always lands on your profile, whatever the address held before
  // launch (design D3). Replaced, so back doesn't return to it.
  function enter () {
    replaceRoute(LANDING)
    firstLaunch.enter()
  }
</script>

{#if current.kind === 'ready'}
  <Shell profile={current.profile} />
{:else}
  <main class="launch" style:--niho={`url(${niho})`}>
    {#if isLaunchState(current)}
      <LaunchScreen {current} onbegin={() => firstLaunch.begin()} onenter={enter} />
    {:else if isCreateProfileState(current)}
      <!-- As in the old app, the form opens over the welcome. Hidden from
           assistive tech while the dialog is open, which is modal. -->
      <div inert>
        <LaunchScreen current={{ kind: 'welcome' }} onbegin={() => {}} onenter={() => {}} />
      </div>
      <CreateProfile
        {current}
        onsubmit={form => firstLaunch.submit(form)}
        oncancel={() => firstLaunch.cancel()}
      />
    {/if}
  </main>
{/if}

<style>
  /* The old app's body.page--login (src/App.vue). Its views/Login.vue
     centred the welcome in the top 90% of the page. */
  main.launch {
    display: grid;
    place-items: center;
    min-height: 100vh;
    padding: var(--ahau-space-4);
    padding-bottom: 10vh;
    background: var(--niho) no-repeat;
    background-color: var(--ahau-page-background);
    background-size: cover;
    background-position-y: 10vh;
  }
</style>
