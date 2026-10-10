<script lang="ts">
  import type { Gender } from '../profile/client.js'
  import other from './assets/account-fill.svg'
  import tane from './assets/tane.svg'
  import wahine from './assets/wahine.svg'

  // The silhouette for the gender the person chose, as the create-profile
  // gender picker shows it. Photos are #43.
  let { name, gender, size }: { name: string, gender: Gender | null, size: number } = $props()

  const src = $derived(gender === 'male' ? tane : gender === 'female' ? wahine : other)
</script>

<img {src} alt={name} width={size} height={size} />

<style>
  img {
    display: block;
    border-radius: 50%;
    object-fit: cover;
  }
</style>
