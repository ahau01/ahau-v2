<script lang="ts">
  import type { CreateProfileState } from '../../first-launch/first-launch.js'
  import type { ProfileForm } from '../../profile/form.js'
  import ProfileFormDialog from './ProfileForm.svelte'

  let { current, onsubmit, oncancel }: {
    current: CreateProfileState
    onsubmit: (form: ProfileForm) => void
    oncancel: () => void
  } = $props()

  const saving = $derived(current.kind === 'saving')
  const errors = $derived(current.kind === 'needs-profile' ? current.errors : undefined)
</script>

<ProfileFormDialog
  initialForm={current.form}
  {saving}
  {errors}
  saveLabel="Save"
  cancelLabel="Cancel"
  {onsubmit}
  {oncancel}
>
  {#snippet title()}
    <span lang="mi" class="maori">Ahau --</span><span>-- I am</span>
  {/snippet}
</ProfileFormDialog>
