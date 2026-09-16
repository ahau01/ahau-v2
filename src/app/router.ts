/**
 * A hash router, hand-rolled.
 *
 * Svelte ships no router, and a shell needs perhaps forty lines of one. Taking
 * a dependency for that is the bet this rebuild exists to stop making -- and
 * routing is squarely in the hand-build half of the agreed hybrid.
 */

export interface Route {
  readonly path: string
  readonly title: string
}

export const routes: readonly Route[] = [
  { path: '/', title: 'Home' },
  { path: '/whakapapa', title: 'Whakapapa' },
  { path: '/people', title: 'People' },
  { path: '/archive', title: 'Archive' },
  { path: '/groups', title: 'Groups' },
  { path: '/submissions', title: 'Submissions' },
  { path: '/settings', title: 'Settings' }
]

const normalise = (hash: string): string => {
  const path = hash.replace(/^#/, '')
  return routes.some(r => r.path === path) ? path : '/'
}

export function currentPath (): string {
  return normalise(globalThis.location?.hash ?? '')
}

export function onRouteChange (listener: (path: string) => void): () => void {
  const handler = (): void => listener(currentPath())
  globalThis.addEventListener('hashchange', handler)
  return () => globalThis.removeEventListener('hashchange', handler)
}
