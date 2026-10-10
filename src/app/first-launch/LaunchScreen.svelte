<script lang="ts">
  import type { LaunchState } from '../../first-launch/first-launch.js'
  import logo from '../assets/logo_red.svg'
  import Avatar from '../Avatar.svelte'
  import { focusOnMount } from './focus-on-mount.js'

  let { current, onbegin, onenter }: {
    current: LaunchState
    onbegin: () => void
    /** From the avatar step: go in. Records nothing; it is not a login. */
    onenter: () => void
  } = $props()
</script>

<!-- Layout and copy from the old app's views/Login.vue; see docs/old-app-capture/01-launch.png. -->
{#if current.kind === 'starting'}
  <section class="splash" aria-labelledby="launch-heading">
    <img src={logo} alt="" />
    <h1 id="launch-heading" tabindex="-1" use:focusOnMount>Āhau</h1>
    <p class="visually-hidden" role="status">Starting Āhau…</p>
  </section>
{:else if current.kind === 'welcome'}
  <section class="welcome" aria-labelledby="launch-heading">
    <h1 id="launch-heading" tabindex="-1" use:focusOnMount>
      <span lang="mi">Nau mai</span>
      <span lang="mi">Whakatau mai</span>
    </h1>
    <p class="welcome-word">welcome</p>
    <button type="button" class="who" onclick={onbegin}>
      <span lang="mi" class="maori">Ko wai koe --</span><span class="english">-- who are you?</span>
    </button>
  </section>
{:else if current.kind === 'has-profile'}
  <!-- The agent on this device has a profile. One control: no password,
       account or sign-out, because there is no login. Size and spacing are
       provisional until the #61 captures (design D9). -->
  <section class="splash" aria-labelledby="launch-heading">
    <h1 id="launch-heading" class="visually-hidden">Āhau</h1>
    <button
      type="button"
      class="enter"
      aria-labelledby="launch-person-name"
      onclick={onenter}
      use:focusOnMount
    >
      <Avatar name={current.profile.name} gender={current.profile.gender} size={170} />
      <span id="launch-person-name">{current.profile.name}</span>
    </button>
  </section>
{:else}
  <section class="splash" aria-labelledby="launch-heading">
    <h1 id="launch-heading" tabindex="-1" use:focusOnMount>Āhau</h1>
    <div role="alert">
      <h2>Āhau couldn't start</h2>
      <p>{current.reason}</p>
    </div>
    <button type="button" class="retry" onclick={() => location.reload()}>Try again</button>
  </section>
{/if}

<style>
  .splash {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .splash img {
    width: 20vh;
  }

  .splash h1 {
    text-transform: uppercase;
    letter-spacing: 0.5vw;
    font-weight: 500;
  }

  .welcome {
    display: grid;
    justify-items: center;
    text-align: center;
    position: relative;
    top: -10%;
  }

  .welcome h1 {
    margin: 0;
    font-size: 1.5em;
    font-weight: 400;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: white;
  }

  .welcome h1 span {
    display: block;
  }

  .welcome-word {
    margin: 0;
    padding-top: 50px;
    padding-bottom: var(--ahau-space-6);
    font-size: 1.5em;
    font-weight: 300;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--ahau-welcome-muted);
  }

  .who {
    margin-top: 40px;
    padding: 0 28px;
    height: 52px;
    background: var(--ahau-page-background);
    border: 1px solid var(--ahau-secondary);
    border-radius: var(--ahau-radius);
    font: inherit;
    font-size: 0.9375rem;
    font-weight: 500;
    letter-spacing: 0.0892857143em;
    text-transform: uppercase;
    cursor: pointer;
  }

  .who .maori {
    color: var(--ahau-secondary);
  }

  .who .english {
    color: var(--ahau-welcome-english);
  }

  .enter {
    display: grid;
    justify-items: center;
    gap: var(--ahau-space-3);
    padding: var(--ahau-space-3);
    border: none;
    border-radius: var(--ahau-radius);
    background: none;
    color: var(--ahau-text);
    font: inherit;
    font-size: 1.25rem;
    letter-spacing: 3px;
    text-transform: uppercase;
    cursor: pointer;
  }

  h2 {
    font-size: 1.25rem;
    color: var(--ahau-error);
  }

  .retry {
    background: var(--ahau-surface-raised);
    color: var(--ahau-text);
    border: 1px solid var(--ahau-divider);
    border-radius: var(--ahau-radius);
    padding: var(--ahau-space-2) var(--ahau-space-4);
    font: inherit;
    cursor: pointer;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
</style>
