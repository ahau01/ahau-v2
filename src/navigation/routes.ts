/**
 * The shell's addresses. Plain TypeScript, no DOM or Svelte, so the route
 * scheme is tested on its own (design D2).
 *
 * `#/me` is the agent on this device: a view of whoever holds the key, not a
 * session and not a group (design D3). It carries no id. Tribe spaces will be
 * a sibling, `#/tribes/:tribeId/...`, with their own sections.
 */

export const MY_SECTIONS = ['profile', 'archive', 'whakapapa'] as const
export type MySection = typeof MY_SECTIONS[number]

export type Route =
  | { space: 'me', section: MySection }
  | { space: 'tribes' }

/** Where a person lands on going in, and where unknown addresses go. */
export const LANDING: Route = { space: 'me', section: 'profile' }

/** The page an address names, or null if it names none. */
export function parseRoute (hash: string): Route | null {
  const path = hash.startsWith('#') ? hash.slice(1) : hash
  const parts = path.split('/')
  if (parts[0] !== '') return null
  const [, space, section, ...rest] = parts
  if (rest.length > 0) return null
  if (space === 'tribes' && section === undefined) return { space: 'tribes' }
  if (space === 'me' && isMySection(section)) return { space: 'me', section }
  return null
}

export function routeHref (route: Route): string {
  return route.space === 'me' ? `#/me/${route.section}` : '#/tribes'
}

function isMySection (section: string | undefined): section is MySection {
  return (MY_SECTIONS as readonly string[]).includes(section ?? '')
}
