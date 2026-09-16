<script lang="ts">
  import { Dialog } from 'bits-ui'

  /**
   * The one component proving the hybrid decision.
   *
   * Dialogs are where hand-rolled components most often go subtly wrong --
   * focus trapping, focus restore, escape handling, aria wiring, inert
   * background. bits-ui supplies that behaviour; every visual here is ours,
   * driven by the verified tokens.
   *
   * Built as one component on purpose. If the library fights Āhau's styling,
   * reversing one dialog is cheap; discovering it after thirty components is
   * how the Vuetify situation arose.
   *
   * The action is retraction rather than deletion, because that is what the
   * contract promises: the record stops being returned, it is not erased.
   */
  let { name, onretract }: { name: string, onretract: (reason: string) => void } = $props()

  let open = $state(false)
  let reason = $state('')

  function confirm (): void {
    onretract(reason)
    reason = ''
    open = false
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger class="trigger">Retract…</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay class="overlay" />
    <Dialog.Content class="content">
      <Dialog.Title class="title">Retract {name}</Dialog.Title>
      <Dialog.Description class="description">
        This record will stop being returned. It is not erased, and anyone who
        already holds a copy keeps it.
      </Dialog.Description>

      <label for="retract-reason">Reason (optional)</label>
      <input id="retract-reason" bind:value={reason} autocomplete="off" />

      <div class="actions">
        <Dialog.Close class="cancel">Cancel</Dialog.Close>
        <button type="button" class="danger" onclick={confirm}>Retract</button>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

<style>
  :global(.trigger), :global(.cancel) {
    background: var(--ahau-surface-raised);
    color: var(--ahau-text);
    border: 1px solid var(--ahau-divider);
    border-radius: var(--ahau-radius);
    padding: var(--ahau-space-2) var(--ahau-space-3);
    font: inherit;
    cursor: pointer;
  }

  :global(.overlay) {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 0.6);
  }

  :global(.content) {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(28rem, calc(100vw - 2rem));
    background: var(--ahau-surface-raised);
    border: 1px solid var(--ahau-divider);
    border-radius: var(--ahau-radius);
    padding: var(--ahau-space-4);
  }

  :global(.title) { margin: 0 0 var(--ahau-space-2); font-size: 1.125rem; font-weight: 500; }
  :global(.description) { margin: 0 0 var(--ahau-space-3); color: var(--ahau-text-muted); }

  label { display: block; font-size: 0.875rem; color: var(--ahau-text-muted); }
  input {
    width: 100%;
    background: var(--ahau-surface-sunken);
    color: var(--ahau-text);
    border: 1px solid var(--ahau-divider);
    border-radius: var(--ahau-radius);
    padding: var(--ahau-space-2);
    font: inherit;
  }

  .actions { display: flex; gap: var(--ahau-space-2); justify-content: end; margin-top: var(--ahau-space-4); }

  .danger {
    background: var(--ahau-secondary);
    color: #fff;
    border: 0;
    border-radius: var(--ahau-radius);
    padding: var(--ahau-space-2) var(--ahau-space-3);
    font: inherit;
    cursor: pointer;
  }
</style>
