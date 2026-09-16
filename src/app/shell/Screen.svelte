<script lang="ts">
  import type { DataAccess, Person } from '../../contract/index.js'
  import PersonSearch from './PersonSearch.svelte'
  import RetractDialog from './RetractDialog.svelte'

  let { backend, path, title }: {
    backend: DataAccess
    path: string
    title: string
  } = $props()

  // Placeholder screens: every route renders the same summary. Real screens are
  // Leg 2 work, gated by a cut list that does not exist yet.
  let people = $state<readonly Person[]>([])
  let loaded = $state(false)

  async function retract (id: Person['id'], reason: string): Promise<void> {
    await backend.person.retractPerson(id, reason || null)
    people = people.filter(p => p.id !== id)
  }

  $effect(() => {
    let cancelled = false
    loaded = false
    void (async () => {
      const viewer = await backend.person.getViewer()
      const group = viewer.memberships[0]?.group
      const found = group ? await backend.person.listPeople(group) : []
      if (!cancelled) { people = found; loaded = true }
    })()
    return () => { cancelled = true }
  })
</script>

<h2>{title}</h2>
<p class="placeholder">
  Placeholder screen for <code>{path}</code>. The shell is Milestone 3; real
  screens are Leg 2 work.
</p>

<section>
  <h3>People visible to you</h3>
  {#if !loaded}
    <p class="muted">Loading…</p>
  {:else if people.length === 0}
    <p class="muted">No people are visible to you in this group.</p>
  {:else}
    <ul class="people">
      {#each people as person (person.id)}
        <li>
          <span>{person.preferredName ?? 'Unknown'}</span>
          <span class="row-end">
            {#if person.deceased}<span class="status deceased">deceased</span>
            {:else}<span class="status alive">living</span>{/if}
            <RetractDialog
              name={person.preferredName ?? 'this record'}
              onretract={reason => retract(person.id, reason)}
            />
          </span>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<PersonSearch {backend} />

<style>
  h2 { margin: 0 0 var(--ahau-space-2); font-weight: 500; }
  h3 { font-size: 1rem; font-weight: 500; margin: 0 0 var(--ahau-space-2); }
  .placeholder { color: var(--ahau-text-muted); margin-bottom: var(--ahau-space-5); }
  .muted { color: var(--ahau-text-muted); }
  code { background: var(--ahau-surface-raised); padding: 0 var(--ahau-space-1); border-radius: var(--ahau-radius); }

  section { margin-bottom: var(--ahau-space-5); }

  .people { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--ahau-space-1); }
  .people li {
    display: flex;
    justify-content: space-between;
    padding: var(--ahau-space-2) var(--ahau-space-3);
    background: var(--ahau-surface-raised);
    border-radius: var(--ahau-radius);
  }
  .row-end { display: flex; align-items: center; gap: var(--ahau-space-3); }
  .status { font-size: 0.875rem; }
  .alive { color: var(--ahau-alive); }
  .deceased { color: var(--ahau-deceased); }
</style>
