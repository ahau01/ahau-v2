<script lang="ts">
  import { profileSections } from '../../own-profile/sections.js'
  import type { NewProfile, Profile, UpdateProfileResult } from '../../profile/client.js'
  import { createProfileEdit, type ProfileEditState } from '../../profile/edit.js'
  import Avatar from '../Avatar.svelte'
  import { focusOnMount } from '../first-launch/focus-on-mount.js'
  import ProfileFormDialog from '../first-launch/ProfileForm.svelte'

  // The profile this agent wrote about itself. Editing goes through App.svelte
  // callbacks; this page never imports the client. Header/photo controls stay
  // unavailable (#43).
  let { profile, onupdate, onsave }: {
    profile: Profile
    onupdate: (profile: NewProfile) => Promise<UpdateProfileResult>
    onsave: (profile: Profile) => void
  } = $props()

  const edit = createProfileEdit(profile => onupdate(profile))
  let current = $state<ProfileEditState>(edit.state)
  const sections = $derived(profileSections(profile))

  $effect(() => edit.subscribe(next => {
    current = next
    if (next.kind === 'saved') onsave(next.profile)
  }))

  function openEdit () {
    edit.open(profile)
  }
</script>

{#snippet items (section: { items: Array<{ label: string, value: string }>, isEmpty: boolean })}
  <div class="card">
    {#if section.isEmpty}
      <p class="empty">Nothing has been added here yet.</p>
    {:else}
      <dl>
        {#each section.items as item, index (index)}
          <div>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        {/each}
      </dl>
    {/if}
  </div>
{/snippet}

<article aria-labelledby="page-heading">
  <!-- components/profile/ProfileHeader.vue, with no header-image upload
       (#43): the gradient fallback, always shown, and the avatar overlapping
       its bottom edge. -->
  <div class="banner"></div>
  <div class="title-row">
    <Avatar name={profile.name} gender={profile.gender} size={170} />
    <h1 id="page-heading" tabindex="-1" use:focusOnMount>{profile.name}</h1>
  </div>

  <section aria-labelledby="profile-section-heading">
    <header>
      <h2 id="profile-section-heading">Profile</h2>
      <!-- True today: any agent on the network can read a Profile (#67). -->
      <p class="visibility">Anyone using Āhau can see this.</p>
      <p class="visibility">Changes add a new version. Earlier versions stay on the network.</p>
      <button type="button" class="edit" onclick={openEdit}>Edit profile</button>
    </header>
    {@render items(sections.profile)}
  </section>

  <section aria-labelledby="personal-section-heading">
    <header>
      <h2 id="personal-section-heading">Personal information</h2>
      <!-- Enforced by Personal information being a private entry (ADR-0007),
           not by this page. The profiles Sweettest verifies another agent
           cannot read its contents (own-profile spec, "Personal information
           stays private"). -->
      <p class="visibility">Only you can see this.</p>
    </header>
    {@render items(sections.personal)}
  </section>
</article>

{#if current.kind === 'open' || current.kind === 'saving' || current.kind === 'refused'}
  <ProfileFormDialog
    initialForm={current.form}
    saving={current.kind === 'saving'}
    errors={current.kind === 'refused' ? current.errors : undefined}
    saveLabel="Save"
    cancelLabel="Cancel"
    onsubmit={form => { void edit.submit(form) }}
    oncancel={() => edit.cancel()}
  >
    {#snippet title()}Change your profile{/snippet}
  </ProfileFormDialog>
{/if}

<style>
  .banner {
    margin: calc(var(--ahau-space-5) * -1) calc(var(--ahau-space-5) * -1) 0;
    height: 300px;
    background: var(--ahau-shell-header-band);
  }

  .title-row {
    display: flex;
    align-items: flex-end;
    gap: var(--ahau-space-4);
    margin-top: -56px;
  }

  h1 {
    margin: 0 0 var(--ahau-space-2);
    font-size: 2rem;
    font-weight: 500;
  }

  section {
    margin: var(--ahau-space-6) 0;
  }

  header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    column-gap: var(--ahau-space-3);
    margin-bottom: var(--ahau-space-2);
  }

  h2 {
    margin: 0;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--ahau-shell-section-heading);
  }

  .visibility {
    margin: 0;
    font-size: 0.8rem;
    color: var(--ahau-shell-field-label);
  }

  .edit {
    margin-left: auto;
    padding: 6px 12px;
    border: 1px solid var(--ahau-shell-card-border);
    border-radius: var(--ahau-radius);
    background: #fff;
    color: var(--ahau-shell-text);
    font: inherit;
    cursor: pointer;
  }

  /* components/profile/ProfileInfoCard.vue, ProfileCard.vue .rounded-border */
  .card {
    background: #fff;
    border: 0.5px solid var(--ahau-shell-card-border);
    border-radius: var(--ahau-radius);
    padding: var(--ahau-space-4);
  }

  .empty {
    margin: 0;
    color: var(--ahau-shell-field-label);
  }

  dl {
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--ahau-space-4);
  }

  dt {
    font-size: 0.7rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--ahau-shell-field-label);
  }

  dd {
    margin: var(--ahau-space-1) 0 0;
    color: var(--ahau-shell-text);
  }

  @media (max-width: 640px) {
    .banner {
      height: 160px;
    }

    .title-row {
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-top: -85px;
    }
  }
</style>
