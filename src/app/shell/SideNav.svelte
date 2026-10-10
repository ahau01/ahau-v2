<script lang="ts">
  import { routeHref, type MySection } from '../../navigation/routes.js'
  import type { Profile } from '../../profile/client.js'
  import Avatar from '../Avatar.svelte'
  import ArchiveIcon from './ArchiveIcon.svelte'
  import ProfileIcon from './ProfileIcon.svelte'
  import WhakapapaIcon from './WhakapapaIcon.svelte'

  // Chooses a section of your own space. No Wallet or People: cut (#63).
  let { profile, section }: { profile: Profile, section: MySection } = $props()

  const sections: Array<{ section: MySection, label: string }> = [
    { section: 'profile', label: 'Profile' },
    { section: 'archive', label: 'Archive' },
    { section: 'whakapapa', label: 'Whakapapa' }
  ]
</script>

<nav aria-label="Your space">
  <div class="avatar">
    <Avatar name={profile.name} gender={profile.gender} size={170} />
  </div>
  <ul>
    {#each sections as item (item.section)}
      <li>
        <a
          href={routeHref({ space: 'me', section: item.section })}
          aria-current={item.section === section ? 'page' : undefined}
        >
          {#if item.section === 'profile'}
            <ProfileIcon />
          {:else if item.section === 'archive'}
            <ArchiveIcon />
          {:else}
            <WhakapapaIcon />
          {/if}
          <span class="label">{item.label}</span>
        </a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  /* components/menu/SideNavMenu.vue: avatar above a vertical list of
     icon+label links, the current one coloured. */
  nav {
    display: grid;
    justify-items: center;
    align-content: start;
    gap: var(--ahau-space-4);
    padding: var(--ahau-space-4) var(--ahau-space-3);
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--ahau-space-3);
    width: 100%;
  }

  a {
    display: flex;
    align-items: center;
    gap: var(--ahau-space-2);
    color: var(--ahau-shell-nav-inactive);
    text-decoration: none;
  }

  .label {
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.9rem;
  }

  a :global(svg) {
    width: 1.4em;
    height: 1.4em;
  }

  a[aria-current='page'] {
    color: var(--ahau-shell-nav-active);
    font-weight: 500;
  }

  /* Narrow width: a row of icons under the header, not a column beside the
     content (design D9, task 6.4). Labels still exist for anyone listening
     with a screen reader; they're visually hidden here, not removed. */
  @media (max-width: 640px) {
    nav {
      grid-auto-flow: column;
      justify-content: center;
      gap: var(--ahau-space-5);
      padding: var(--ahau-space-3);
    }

    .avatar {
      display: none;
    }

    ul {
      grid-auto-flow: column;
      width: auto;
    }

    a {
      flex-direction: column;
      gap: var(--ahau-space-1);
    }

    a :global(svg) {
      width: 1.8em;
      height: 1.8em;
    }

    .label {
      font-size: 0.65rem;
    }
  }
</style>
