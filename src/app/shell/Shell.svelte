<script lang="ts">
  import type { Profile } from '../../profile/client.js'
  import niho from '../assets/niho.svg'
  import ArchivePage from './ArchivePage.svelte'
  import ProfilePage from './ProfilePage.svelte'
  import { currentRoute } from './route.js'
  import SideNav from './SideNav.svelte'
  import TopBar from './TopBar.svelte'
  import TribesPage from './TribesPage.svelte'
  import WhakapapaPage from './WhakapapaPage.svelte'

  // A pure view of the profile launch read. No component here imports the
  // profile client; the empty pages have no client at all (design D4).
  let { profile }: { profile: Profile } = $props()

  const route = currentRoute()
</script>

<div class="shell" style:--niho={`url(${niho})`}>
  <TopBar {profile} route={$route} />

  <div class="surface">
    {#if $route.space === 'me'}
      <div class="space">
        <SideNav {profile} section={$route.section} />
        <main>
          <!-- Each page mounts afresh on navigating, so its heading takes focus. -->
          {#if $route.section === 'profile'}
            <ProfilePage {profile} />
          {:else if $route.section === 'archive'}
            <ArchivePage />
          {:else}
            <WhakapapaPage />
          {/if}
        </main>
      </div>
    {:else}
      <main class="tribes">
        <TribesPage />
      </main>
    {/if}
  </div>
</div>

<style>
  /* Light pages: a different colour-scheme from launch's, scoped to the
     shell root so native controls (e.g. select arrows) match each surface
     (design D8). */
  .shell {
    color-scheme: light;
    min-height: 100vh;
    background: #fff;
    color: var(--ahau-shell-text);
  }

  /* views/ProfileShow.vue .niho-bg: the gradient-over-niho background below
     the (separately dark) app bar. */
  .surface {
    background: var(--ahau-shell-overlay), var(--niho) no-repeat;
    background-position-x: 100px;
    background-attachment: fixed;
    min-height: calc(100vh - 64px);
  }

  .space {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
  }

  main {
    padding: var(--ahau-space-5) var(--ahau-space-5) var(--ahau-space-6);
  }

  /* Narrow width: the side nav becomes a row above the content, not a
     column beside it (design D9, task 6.4). No drawer: the top bar's two
     controls stay in the bar at every width (design Non-Goals). */
  @media (max-width: 640px) {
    .space {
      grid-template-columns: 1fr;
    }
  }
</style>
