<script lang="ts">
  import type { Profile } from '../../profile/client.js'
  import { focusOnMount } from './focus-on-mount.js'

  // A bare landing spot; real screens come with later features.
  let { profile }: { profile: Profile } = $props()
</script>

<section aria-labelledby="home-heading">
  <h1 id="home-heading" tabindex="-1" use:focusOnMount>Kia ora, {profile.name}</h1>
  <p>You're in.</p>
</section>

<style>
  section {
    text-align: center;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 500;
  }
</style>
