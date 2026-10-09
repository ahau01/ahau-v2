<script lang="ts">
  import { untrack } from 'svelte'

  import type { CreateProfileState } from '../../first-launch/first-launch.js'
  import { focusOnMount } from './focus-on-mount.js'

  let { current, onsubmit }: {
    current: CreateProfileState
    onsubmit: (name: string) => void
  } = $props()

  // What the person has typed. Kept here across a failed save; the logic
  // hands the same name back with its error.
  let name = $state(untrack(() => current.name))
  let input: HTMLInputElement | undefined = $state()

  const saving = $derived(current.kind === 'saving')
  const error = $derived(current.kind === 'needs-profile' ? current.error : undefined)

  // Put the person back in the field when there is something to fix. Each
  // refusal is a new error object, so this reruns even for the same message.
  $effect(() => { if (error) input?.focus() })

  function submit (event: SubmitEvent) {
    event.preventDefault()
    onsubmit(name)
  }
</script>

<section aria-labelledby="create-heading">
  <h1 id="create-heading" tabindex="-1" use:focusOnMount>Create your profile</h1>

  <form onsubmit={submit} novalidate aria-busy={saving}>
    <label for="profile-name">Your name</label>
    <input
      id="profile-name"
      bind:this={input}
      bind:value={name}
      autocomplete="name"
      readonly={saving}
      aria-required="true"
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={error ? 'profile-name-error' : undefined}
    />
    {#if error}
      <!-- Re-created per refusal so the alert is announced again. -->
      {#key error}
        <p id="profile-name-error" class="error" role="alert">{error.message}</p>
      {/key}
    {/if}

    <!-- Not disabled while saving, so focus stays put; the logic ignores a second save. -->
    <button type="submit" aria-disabled={saving}>
      {saving ? 'Saving…' : 'Save'}
    </button>
    {#if saving}
      <p class="visually-hidden" role="status">Saving your profile</p>
    {/if}
  </form>
</section>

<style>
  section {
    width: min(100%, 24rem);
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 500;
  }

  form {
    display: grid;
    gap: var(--ahau-space-2);
  }

  input {
    background: var(--ahau-surface-raised);
    color: var(--ahau-text);
    border: 1px solid var(--ahau-divider);
    border-radius: var(--ahau-radius);
    padding: var(--ahau-space-2);
    font: inherit;
  }

  input[aria-invalid='true'] {
    border-color: var(--ahau-error);
  }

  .error {
    margin: 0;
    color: var(--ahau-error);
  }

  button {
    justify-self: start;
    margin-top: var(--ahau-space-2);
    background: var(--ahau-accent);
    color: var(--ahau-text);
    border: none;
    border-radius: var(--ahau-radius);
    padding: var(--ahau-space-2) var(--ahau-space-4);
    font: inherit;
    cursor: pointer;
  }

  button[aria-disabled='true'] {
    color: var(--ahau-text-disabled);
    cursor: progress;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
</style>
