<script lang="ts">
  import type { Profile } from '../../profile/client.js'

  // A bare landing spot; real screens come with later features.
  let { profile }: { profile: Profile } = $props()
</script>

<section aria-labelledby="home-heading">
  <h1 id="home-heading">Kia ora, {profile.name}</h1>
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
