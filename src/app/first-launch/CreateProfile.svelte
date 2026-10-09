<script lang="ts">
  import { tick, untrack } from 'svelte'
  import { Dialog } from 'bits-ui'

  import type { CreateProfileState, ProfileForm } from '../../first-launch/first-launch.js'
  import type { Gender } from '../../profile/client.js'
  import banner from '../assets/bg-tohu.webp'
  import otherOutlined from '../assets/account-outlined.svg'
  import otherFilled from '../assets/account-fill.svg'
  import taneOutlined from '../assets/tane-outlined.svg'
  import taneFilled from '../assets/tane.svg'
  import wahineOutlined from '../assets/wahine-outlined.svg'
  import wahineFilled from '../assets/wahine.svg'
  import { dayOptions, monthOptions, yearOptions } from './date-options.js'
  import { icons } from './icons.js'
  import OutlinedField from './OutlinedField.svelte'

  let { current, onsubmit, oncancel }: {
    current: CreateProfileState
    onsubmit: (form: ProfileForm) => void
    oncancel: () => void
  } = $props()

  // What the person has typed. Kept here across a refused save; the logic
  // hands the same form back with its errors.
  let form = $state<ProfileForm>(structuredClone(untrack(() => $state.snapshot(current.form))))

  const saving = $derived(current.kind === 'saving')
  const errors = $derived(current.kind === 'needs-profile' ? current.errors : undefined)
  const dateInvalid = $derived(errors?.dateOfBirth ? 'true' as const : undefined)

  let nameInput: HTMLInputElement | HTMLTextAreaElement | undefined = $state()
  let birthOrderInput: HTMLInputElement | HTMLTextAreaElement | undefined = $state()
  let daySelect: HTMLSelectElement | undefined = $state()

  // Put the person in the first field to fix. Each refusal is a new errors
  // object, so this reruns even when the messages are the same.
  $effect(() => {
    if (!errors) return
    if (errors.name) nameInput?.focus()
    else if (errors.birthOrder) birthOrderInput?.focus()
    else if (errors.dateOfBirth) daySelect?.focus()
  })

  const genders: Array<{ value: Exclude<Gender, 'unknown'>, label: string, outlined: string, filled: string }> = [
    { value: 'male', label: 'Male', outlined: taneOutlined, filled: taneFilled },
    { value: 'female', label: 'Female', outlined: wahineOutlined, filled: wahineFilled },
    { value: 'other', label: 'Other', outlined: otherOutlined, filled: otherFilled }
  ]

  type ListKey = 'altNames' | 'skills' | 'education'
  const lists: Record<ListKey, { box: string, add: string, id: string }> = {
    altNames: { box: 'Also known as', add: 'Add another name', id: 'profile-alt-name' },
    skills: { box: 'Skill/qualification', add: 'Add skill/qualification', id: 'profile-skill' },
    education: { box: 'Place of education', add: 'Add a place of education', id: 'profile-education' }
  }

  async function addBox (key: ListKey) {
    form[key].push('')
    await tick()
    document.getElementById(`${lists[key].id}-${form[key].length - 1}`)?.focus()
  }

  function submit (event: SubmitEvent) {
    event.preventDefault()
    onsubmit($state.snapshot(form))
  }
</script>

{#snippet list (key: ListKey)}
  <div class="list">
    <div class="boxes">
      {#each form[key] as _, index (index)}
        <OutlinedField
          id={`${lists[key].id}-${index}`}
          label={lists[key].box}
          bind:value={form[key][index]!}
          readonly={saving}
          onremove={() => form[key].splice(index, 1)}
        />
      {/each}
    </div>
    <button type="button" class="add" onclick={() => addBox(key)}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icons.plus} /></svg>
      {lists[key].add}
    </button>
  </div>
{/snippet}

<Dialog.Root open onOpenChange={open => { if (!open) oncancel() }}>
  <Dialog.Portal>
    <Dialog.Overlay class="create-profile-overlay" />
    <Dialog.Content
      class="create-profile"
      interactOutsideBehavior="ignore"
      onOpenAutoFocus={event => { event.preventDefault(); nameInput?.focus() }}
    >
      <header style:--banner={`url(${banner})`}>
        <Dialog.Title level={1} class="title">
          <span lang="mi" class="maori">Ahau --</span><span>-- I am</span>
        </Dialog.Title>
        <Dialog.Close class="close" aria-label="Close">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icons.close} /></svg>
        </Dialog.Close>
      </header>

      <form onsubmit={submit} novalidate aria-busy={saving}>
        <div class="body">
          <div class="top">
            <div class="who">
              <OutlinedField
                id="profile-name"
                label="First name / known as"
                bind:value={form.name}
                bind:input={nameInput}
                required
                error={errors?.name}
                autocomplete="given-name"
                readonly={saving}
              />
              <div class="narrow">
                <OutlinedField
                  id="profile-birth-order"
                  label="Order of birth"
                  bind:value={form.birthOrder}
                  bind:input={birthOrderInput}
                  error={errors?.birthOrder}
                  inputmode="numeric"
                  readonly={saving}
                />
              </div>
              <fieldset class="gender">
                <legend>Identifies as</legend>
                {#each genders as gender (gender.value)}
                  <label class="gender-choice">
                    <input
                      type="radio"
                      name="gender"
                      value={gender.value}
                      checked={form.gender === gender.value}
                      disabled={saving}
                      onchange={() => { form.gender = gender.value }}
                    />
                    <img src={form.gender === gender.value ? gender.filled : gender.outlined} alt="" />
                    <span>{gender.label}</span>
                  </label>
                {/each}
                <label class="unknown">
                  <input
                    type="checkbox"
                    checked={form.gender === 'unknown'}
                    disabled={saving}
                    onchange={event => { form.gender = event.currentTarget.checked ? 'unknown' : null }}
                  />
                  Unknown
                </label>
              </fieldset>
            </div>

            <div class="photo">
              <img src={otherOutlined} alt="" />
              <!-- Photos need file storage on Holochain, designed separately. -->
              <button type="button" class="upload" disabled>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icons.camera} /></svg>
                Upload profile photo
              </button>
            </div>
          </div>

          <hr />

          <div class="pair">
            <OutlinedField id="profile-full-name" label="Full name" bind:value={form.fullName} autocomplete="name" readonly={saving} />
            {@render list('altNames')}
          </div>

          <div class="half">
            <fieldset
              class="date"
              class:invalid={errors?.dateOfBirth}
              aria-describedby={errors?.dateOfBirth ? 'profile-dob-error' : undefined}
            >
              <legend>Date of birth</legend>
              <label>
                Day
                <select bind:this={daySelect} bind:value={form.dateOfBirth.day} disabled={saving} aria-invalid={dateInvalid}>
                  {#each dayOptions as day (day)}<option value={day}>{day}</option>{/each}
                </select>
              </label>
              <label>
                Month
                <select bind:value={form.dateOfBirth.month} disabled={saving} aria-invalid={dateInvalid}>
                  {#each monthOptions as month (month.value)}<option value={month.value}>{month.text}</option>{/each}
                </select>
              </label>
              <label>
                Year
                <select bind:value={form.dateOfBirth.year} disabled={saving} aria-invalid={dateInvalid}>
                  {#each yearOptions as year (year)}<option value={year}>{year}</option>{/each}
                </select>
              </label>
              {#if errors?.dateOfBirth}
                <p id="profile-dob-error" class="error">{errors.dateOfBirth}</p>
              {/if}
            </fieldset>
            <OutlinedField id="profile-place-of-birth" label="Place of birth" bind:value={form.placeOfBirth} readonly={saving} />
          </div>
          <OutlinedField
            id="profile-about"
            label={`About ${form.name.trim()}`.trim()}
            bind:value={form.description}
            multiline
            readonly={saving}
          />

          <hr />

          <h2>Skills and qualifications</h2>
          <div class="half">
            <OutlinedField id="profile-profession" label="Profession" bind:value={form.profession} readonly={saving} />
          </div>
          {@render list('skills')}
          {@render list('education')}

          <hr />

          <h2>Personal information</h2>
          <p class="private-note">Only you can see this.</p>
          <div class="grid">
            <OutlinedField id="profile-email" label="Email" bind:value={form.personal.email} autocomplete="email" readonly={saving} />
            <OutlinedField id="profile-phone" label="Phone" bind:value={form.personal.phone} autocomplete="tel" readonly={saving} />
            <OutlinedField id="profile-address" label="Address" bind:value={form.personal.address} autocomplete="street-address" readonly={saving} />
            <OutlinedField id="profile-postcode" label="Postcode" bind:value={form.personal.postcode} autocomplete="postal-code" readonly={saving} />
            <OutlinedField id="profile-city" label="City" bind:value={form.personal.city} autocomplete="address-level2" readonly={saving} />
            <OutlinedField id="profile-country" label="Country" bind:value={form.personal.country} autocomplete="country-name" readonly={saving} />
          </div>
        </div>

        <footer>
          {#if errors?.save}
            <!-- Re-created per refusal so the alert is announced again. -->
            {#key errors}
              <p class="error save-error" role="alert">{errors.save}</p>
            {/key}
          {/if}
          <button type="button" class="cancel" onclick={oncancel}>Cancel</button>
          <!-- Not disabled while saving, so focus stays put; the logic ignores a second save. -->
          <button type="submit" class="save" aria-disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          {#if saving}
            <p class="visually-hidden" role="status">Saving your profile</p>
          {/if}
        </footer>
      </form>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

<style>
  /* Layout from docs/old-app-capture/02a-03c; dialog from the old DialogContainer.vue. */
  :global(.create-profile-overlay) {
    position: fixed;
    inset: 0;
    background: rgba(33, 33, 33, 0.46);
  }

  :global(.create-profile) {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(720px, calc(100vw - 48px));
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    background: var(--ahau-dialog-surface);
    color: var(--ahau-dialog-text);
    border-radius: var(--ahau-radius);
    box-shadow: 0 11px 15px -7px rgba(0, 0, 0, 0.2), 0 24px 38px 3px rgba(0, 0, 0, 0.14), 0 9px 46px 8px rgba(0, 0, 0, 0.12);
    overflow: hidden;
  }

  header {
    position: relative;
    flex: none;
    display: flex;
    align-items: center;
    height: 60px;
    padding: 0 16px;
    background: var(--ahau-dialog-bar);
  }

  header::before {
    content: '';
    position: absolute;
    inset: 0 0 0 100px;
    background: var(--banner) center / cover;
    opacity: 0.4;
  }

  :global(.create-profile .title) {
    position: relative;
    flex: 1;
    margin: 0;
    font-size: 0.99rem;
    font-weight: 400;
    letter-spacing: 0.1666666667em;
    text-transform: uppercase;
    color: white;
  }

  .maori {
    color: var(--ahau-title-maori);
    font-weight: 500;
  }

  :global(.create-profile .close) {
    position: relative;
    padding: 6px;
    border: none;
    border-radius: 50%;
    background: none;
    color: white;
    cursor: pointer;
  }

  svg {
    display: block;
    width: 24px;
    height: 24px;
    fill: currentColor;
  }

  form {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .body {
    overflow-y: auto;
    max-height: 650px;
    padding: 12px 16px 24px;
  }

  .top {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 8px;
  }

  .who {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 4px;
  }

  .narrow {
    width: 50%;
  }

  fieldset {
    border: none;
    margin: 0;
    padding: 0;
  }

  .gender {
    display: flex;
    align-items: center;
    gap: 32px;
    width: 200%;
    margin-top: 12px;
  }

  .gender legend {
    padding: 0 12px 8px;
    font-size: 12px;
    color: var(--ahau-dialog-text-muted);
  }

  .gender-choice {
    position: relative;
    display: grid;
    justify-items: center;
    gap: 6px;
    width: 100px;
    font-size: 12px;
    color: var(--ahau-dialog-text-muted);
    cursor: pointer;
  }

  /* ProfileForm.vue .gender-image */
  .gender-choice img {
    width: 6em;
    height: 6em;
    border: 0.5px solid rgba(0, 0, 0, 0.6);
    border-radius: 50%;
  }

  .gender-choice:hover img,
  .gender-choice:has(input:checked) img {
    border: 2px solid rgba(0, 0, 0, 0.87);
  }

  .gender-choice input,
  .unknown input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }

  .gender-choice:has(input:focus-visible) img {
    outline: 2px solid var(--ahau-focus-ring);
    outline-offset: 2px;
    border-radius: 50%;
  }

  .unknown {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    align-self: flex-start;
    margin-top: 26px;
    color: var(--ahau-dialog-text-muted);
    cursor: pointer;
  }

  .unknown::before {
    content: '';
    width: 14px;
    height: 14px;
    border: 2px solid rgba(0, 0, 0, 0.54);
    border-radius: 2px;
  }

  .unknown:has(input:checked)::before {
    background: rgba(0, 0, 0, 0.54);
    box-shadow: inset 0 0 0 2px var(--ahau-dialog-surface);
  }

  .unknown:has(input:focus-visible)::before {
    outline: 2px solid var(--ahau-focus-ring);
    outline-offset: 2px;
  }

  .photo {
    display: grid;
    justify-items: center;
    align-content: start;
    gap: 8px;
  }

  .photo img {
    width: 140px;
    height: 140px;
    border: 1px solid rgba(0, 0, 0, 0.6);
    border-radius: 50%;
  }

  .upload {
    display: flex;
    align-items: center;
    gap: 6px;
    border: none;
    background: none;
    color: var(--ahau-dialog-text-muted);
    font: inherit;
    font-size: 14px;
  }

  .upload svg {
    fill: rgba(0, 0, 0, 0.54);
  }

  hr {
    border: none;
    border-top: 1px solid var(--ahau-dialog-divider);
    margin: 12px 0;
  }

  .pair,
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 8px;
    align-items: start;
  }

  .half {
    width: 50%;
    padding-right: 4px;
  }

  .list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 8px;
    align-items: center;
  }

  .pair .list {
    grid-template-columns: 1fr;
  }

  .add {
    justify-self: end;
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 12px 0;
    padding: 4px 8px;
    border: none;
    background: none;
    color: var(--ahau-dialog-text-muted);
    font: inherit;
    font-size: 11px;
    cursor: pointer;
  }

  .add svg {
    width: 20px;
    height: 20px;
    fill: rgba(0, 0, 0, 0.54);
  }

  .date {
    display: flex;
    flex-wrap: wrap;
    column-gap: 16px;
    margin-top: 8px;
    padding: 2px 12px 8px;
    border: 1px solid var(--ahau-dialog-outline);
    border-radius: var(--ahau-radius);
  }

  .date.invalid {
    border-color: var(--ahau-error);
  }

  .date legend {
    padding: 0 4px;
    font-size: 12px;
    color: var(--ahau-dialog-text-muted);
  }

  .date.invalid legend {
    color: var(--ahau-error);
  }

  .date label {
    display: grid;
    flex: 1;
    font-size: 12px;
    color: var(--ahau-dialog-text-muted);
  }

  select {
    border: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.42);
    background: transparent;
    color: var(--ahau-dialog-text);
    font: inherit;
    font-size: 16px;
    padding: 4px 0;
  }

  .date .error {
    flex-basis: 100%;
  }

  h2 {
    margin: 8px 0 4px;
    font-size: 14px;
    font-weight: 700;
    color: var(--ahau-dialog-text-muted);
  }

  .private-note {
    margin: 0 0 4px;
    font-size: 12px;
    color: var(--ahau-dialog-text-muted);
  }

  footer {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 24px;
    padding: 12px 24px;
    border-top: 1px solid var(--ahau-dialog-divider);
  }

  footer button {
    padding: 8px 16px;
    border: none;
    border-radius: var(--ahau-radius);
    background: none;
    font: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.0892857143em;
    text-transform: uppercase;
    cursor: pointer;
  }

  .cancel {
    color: var(--ahau-secondary);
  }

  .save {
    color: var(--ahau-dialog-save);
  }

  .save[aria-disabled='true'] {
    color: var(--ahau-dialog-text-muted);
    cursor: progress;
  }

  .error {
    margin: 4px 0 0;
    color: var(--ahau-error);
    font-size: 12px;
  }

  .save-error {
    margin: 0 auto 0 0;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
</style>
