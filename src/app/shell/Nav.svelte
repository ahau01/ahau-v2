<script lang="ts">
  import { routes } from '../router.js'

  let { path }: { path: string } = $props()
</script>

<nav aria-label="Sections">
  <ul>
    {#each routes as route (route.path)}
      <li>
        <a
          href="#{route.path}"
          aria-current={route.path === path ? 'page' : undefined}
        >{route.title}</a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  nav {
    grid-area: nav;
    padding: var(--ahau-space-3) 0;
    background: var(--ahau-surface-raised);
    border-right: 1px solid var(--ahau-divider);
  }

  ul { list-style: none; margin: 0; padding: 0; }

  a {
    display: block;
    padding: var(--ahau-space-2) var(--ahau-space-4);
    color: var(--ahau-text-muted);
    text-decoration: none;
  }

  a:hover { color: var(--ahau-text); background: var(--ahau-surface-sunken); }

  a[aria-current='page'] {
    color: var(--ahau-text);
    border-left: 3px solid var(--ahau-secondary);
    background: var(--ahau-surface-sunken);
  }
</style>
