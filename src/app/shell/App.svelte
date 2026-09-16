<script lang="ts">
  import { createBackend, type ProfileName } from '../backend.js'
  import { currentPath, onRouteChange, routes } from '../router.js'
  import Nav from './Nav.svelte'
  import Screen from './Screen.svelte'

  let path = $state(currentPath())
  let profile = $state<ProfileName>('enforced')

  // The shell holds one backend. Screens receive it; none of them knows what
  // is behind it, which is the property Leg 2 has to preserve.
  let backend = $derived(createBackend(profile))

  $effect(() => onRouteChange(next => { path = next }))

  const title = $derived(routes.find(r => r.path === path)?.title ?? 'Āhau')
</script>

<div class="shell">
  <header>
    <h1>Āhau</h1>
    <label>
      <span class="visually-hidden">Backend capability profile</span>
      <select bind:value={profile} aria-label="Backend capability profile">
        <option value="enforced">Enforcing backend</option>
        <option value="degraded">Weak backend</option>
      </select>
    </label>
  </header>

  <Nav {path} />

  <main aria-live="polite">
    <Screen {backend} {path} {title} />
  </main>
</div>

<style>
  .shell {
    display: grid;
    grid-template-areas: 'header header' 'nav main';
    grid-template-columns: 14rem 1fr;
    grid-template-rows: auto 1fr;
    min-height: 100vh;
  }

  header {
    grid-area: header;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ahau-space-3);
    padding: var(--ahau-space-3) var(--ahau-space-4);
    background: var(--ahau-primary);
    border-bottom: 1px solid var(--ahau-divider);
  }

  h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 500;
  }

  select {
    background: var(--ahau-surface-raised);
    color: var(--ahau-text);
    border: 1px solid var(--ahau-divider);
    border-radius: var(--ahau-radius);
    padding: var(--ahau-space-1) var(--ahau-space-2);
    font: inherit;
  }

  main {
    grid-area: main;
    padding: var(--ahau-space-4);
    overflow: auto;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  @media (max-width: 40rem) {
    .shell {
      grid-template-areas: 'header' 'nav' 'main';
      grid-template-columns: 1fr;
    }
  }
</style>
