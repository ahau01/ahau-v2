<script lang="ts">
  import type { Snippet } from 'svelte'

  import { focusOnMount } from '../first-launch/focus-on-mount.js'

  // A section whose data isn't designed yet. It says the section is still to
  // come: not that the person has nothing there, not that something failed,
  // and with no controls that do nothing (navigation spec). It has no client
  // module, so it fixes no data shape (design D4). Provisional wording until
  // the slice owner signs it off (task 6.5).
  let { heading, children }: { heading: string, children: Snippet } = $props()
</script>

<article aria-labelledby="page-heading">
  <h1 id="page-heading" tabindex="-1" use:focusOnMount>{heading}</h1>
  <p>{@render children()}</p>
</article>

<style>
  /* components/archive/Archive.vue, views/WhakapapaIndex.vue .headliner;
     views/Discovery.vue's TRIBES heading is the same shape, uppercase and
     tracked out. */
  h1 {
    margin-top: 0;
    font-size: 1.4rem;
    font-weight: 400;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ahau-shell-section-heading);
  }

  p {
    color: var(--ahau-shell-field-label);
  }
</style>
