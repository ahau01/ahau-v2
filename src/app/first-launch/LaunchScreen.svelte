<script lang="ts">
  import type { FirstLaunchState } from '../../first-launch/first-launch.js'

  let { current }: { current: Extract<FirstLaunchState, { kind: 'starting' | 'failed-to-start' }> } = $props()
</script>

<section aria-labelledby="launch-heading">
  <h1 id="launch-heading">Āhau</h1>
  {#if current.kind === 'starting'}
    <p role="status">Starting Āhau…</p>
  {:else}
    <div role="alert">
      <h2>Āhau couldn't start</h2>
      <p>{current.reason}</p>
    </div>
    <button type="button" onclick={() => location.reload()}>Try again</button>
  {/if}
</section>

<style>
  section {
    text-align: center;
  }

  h1 {
    font-size: 2rem;
    font-weight: 500;
  }

  h2 {
    font-size: 1.25rem;
    color: var(--ahau-error);
  }

  button {
    background: var(--ahau-surface-raised);
    color: var(--ahau-text);
    border: 1px solid var(--ahau-divider);
    border-radius: var(--ahau-radius);
    padding: var(--ahau-space-2) var(--ahau-space-4);
    font: inherit;
    cursor: pointer;
  }
</style>
