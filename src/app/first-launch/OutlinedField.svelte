<script lang="ts">
  import { icons } from './icons.js'

  // A Vuetify 2 "outlined" text field: the label sits in the border.
  let {
    id,
    label,
    value = $bindable(),
    input = $bindable(),
    required = false,
    error,
    multiline = false,
    readonly = false,
    autocomplete,
    inputmode,
    onremove
  }: {
    id: string
    label: string
    value: string
    input?: HTMLInputElement | HTMLTextAreaElement | undefined
    required?: boolean
    error?: string | undefined
    multiline?: boolean
    readonly?: boolean
    autocomplete?: import('svelte/elements').FullAutoFill
    inputmode?: 'numeric' | 'text'
    /** Shows a bin that removes this box. */
    onremove?: () => void
  } = $props()

  const errorId = $derived(`${id}-error`)
</script>

<div class="field" class:invalid={error}>
  <label for={id}>{label}</label>
  {#if multiline}
    <textarea
      {id}
      bind:this={input}
      bind:value
      rows="3"
      {readonly}
      aria-required={required ? 'true' : undefined}
      aria-invalid={error ? 'true' : undefined}
      aria-errormessage={error ? errorId : undefined}
    ></textarea>
  {:else}
    <input
      {id}
      bind:this={input}
      bind:value
      {autocomplete}
      {inputmode}
      {readonly}
      aria-required={required ? 'true' : undefined}
      aria-invalid={error ? 'true' : undefined}
      aria-errormessage={error ? errorId : undefined}
    />
  {/if}
  {#if onremove}
    <button type="button" class="remove" aria-label={`Remove ${label}`} onclick={onremove}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icons.delete} /></svg>
    </button>
  {/if}
</div>
{#if error}
  <p id={errorId} class="error">{error}</p>
{/if}

<style>
  .field {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 56px;
    border: 1px solid var(--ahau-dialog-outline);
    border-radius: var(--ahau-radius);
    margin-top: 8px;
  }

  .field:focus-within {
    border: 2px solid var(--ahau-dialog-text);
  }

  .field.invalid {
    border: 2px solid var(--ahau-error);
  }

  label {
    position: absolute;
    top: -9px;
    left: 8px;
    padding: 0 4px;
    background: var(--ahau-dialog-surface);
    color: var(--ahau-dialog-text-muted);
    font-size: 12px;
    line-height: 16px;
  }

  .invalid label {
    color: var(--ahau-error);
  }

  input,
  textarea {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    color: var(--ahau-dialog-text);
    font: inherit;
    padding: 12px;
    outline: none;
  }

  textarea {
    resize: vertical;
    min-height: 80px;
    align-self: stretch;
  }

  .remove {
    margin-right: 8px;
    padding: 4px;
    border: none;
    border-radius: 50%;
    background: none;
    color: rgba(0, 0, 0, 0.54);
    cursor: pointer;
  }

  .remove svg {
    display: block;
    width: 24px;
    height: 24px;
    fill: currentColor;
  }

  .error {
    margin: 4px 12px 0;
    color: var(--ahau-error);
    font-size: 12px;
  }
</style>
