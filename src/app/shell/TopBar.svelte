<script lang="ts">
  import { routeHref, type Route } from '../../navigation/routes.js'
  import type { Profile } from '../../profile/client.js'
  import Avatar from '../Avatar.svelte'

  // Chooses whose space: yours, or the tribe list. No bell, Help or tribe
  // avatars (navigation spec); tribe avatars arrive with tribe spaces.
  let { profile, route }: { profile: Profile, route: Route } = $props()
</script>

<header>
  <nav aria-label="Spaces">
    <a href={routeHref({ space: 'tribes' })} class="add-tribes" aria-current={route.space === 'tribes' ? 'true' : undefined}>
      <span aria-hidden="true">+</span>
      <span class="visually-hidden">Add tribes</span>
    </a>
    <a href={routeHref({ space: 'me', section: 'profile' })} class="me" aria-current={route.space === 'me' ? 'true' : undefined}>
      <Avatar name={profile.name} gender={profile.gender} size={46} />
    </a>
  </nav>
</header>

<style>
  /* components/menu/Appbar.vue: a dark bar, its two controls at the right. */
  header {
    height: 64px;
    display: flex;
    align-items: center;
    padding: 0 var(--ahau-space-4);
    background: var(--ahau-shell-app-bar);
    color: #fff;
  }

  nav {
    display: flex;
    align-items: center;
    gap: var(--ahau-space-4);
    margin-left: auto;
  }

  a {
    display: block;
    color: inherit;
    border-radius: 50%;
  }

  a[aria-current] {
    outline: 2px solid #fff;
    outline-offset: 3px;
  }

  .add-tribes {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    font-size: 1.75rem;
    font-weight: 300;
    line-height: 1;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
</style>
