<script lang="ts">
  import type { DataAccess, Person } from '../../contract/index.js'

  let { backend }: { backend: DataAccess } = $props()

  let term = $state('')
  let results = $state<readonly Person[]>([])
  /**
   * A capability the backend declines is a UI state, not an error.
   *
   * This is the shell's small rehearsal of Leg 2's central claim: switching the
   * backend between profiles changes what this offers, and nothing in this
   * component knows which backend it is talking to.
   */
  let unavailable = $state<string | null>(null)

  async function search (event: SubmitEvent): Promise<void> {
    event.preventDefault()
    const outcome = await backend.person.findPeopleByName(term, null)
    if (outcome.supported) {
      results = outcome.value
      unavailable = null
    } else {
      results = []
      unavailable = outcome.detail
    }
  }

  const searchable = $derived(backend.capabilities.nameSearch)
</script>

<section>
  <h3>Find someone by name</h3>

  {#if !searchable}
    <p class="declined">
      This backend does not provide name search. Not a fault — it never claimed to.
    </p>
  {:else}
    <form onsubmit={search}>
      <label for="person-search">Name</label>
      <input id="person-search" bind:value={term} autocomplete="off" />
      <button type="submit">Search</button>
    </form>

    {#if unavailable}
      <p class="declined">{unavailable}</p>
    {:else if results.length > 0}
      <ul>
        {#each results as person (person.id)}<li>{person.preferredName}</li>{/each}
      </ul>
    {/if}
  {/if}
</section>

<style>
  h3 { font-size: 1rem; font-weight: 500; margin: 0 0 var(--ahau-space-2); }
  form { display: flex; gap: var(--ahau-space-2); align-items: end; flex-wrap: wrap; }
  label { display: block; font-size: 0.875rem; color: var(--ahau-text-muted); }
  input {
    background: var(--ahau-surface-raised);
    color: var(--ahau-text);
    border: 1px solid var(--ahau-divider);
    border-radius: var(--ahau-radius);
    padding: var(--ahau-space-2);
    font: inherit;
  }
  button {
    background: var(--ahau-secondary);
    color: #fff;
    border: 0;
    border-radius: var(--ahau-radius);
    padding: var(--ahau-space-2) var(--ahau-space-3);
    font: inherit;
    cursor: pointer;
  }
  .declined {
    color: var(--ahau-text-muted);
    border-left: 3px solid var(--ahau-divider);
    padding-left: var(--ahau-space-3);
  }
  ul { list-style: none; padding: 0; margin: var(--ahau-space-3) 0 0; }
</style>
