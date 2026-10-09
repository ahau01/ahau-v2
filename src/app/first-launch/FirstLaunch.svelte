<script lang="ts">
  import { untrack } from 'svelte'

  import { createFirstLaunch, type FirstLaunchState } from '../../first-launch/first-launch.js'
  import type { ProfileClient } from '../../profile/client.js'
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

<main>
  {#if current.kind === 'starting' || current.kind === 'failed-to-start'}
    <LaunchScreen {current} />
  {:else if current.kind === 'needs-profile' || current.kind === 'saving'}
    <CreateProfile {current} onsubmit={name => firstLaunch.submit(name)} />
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
</style>
