import { readable, type Readable } from 'svelte/store'

import { LANDING, parseRoute, routeHref, type Route } from '../../navigation/routes.js'

/**
 * The page the address names, following `hashchange`. Links are plain
 * `<a href="#/...">`, so the browser keeps history, back and forward itself.
 *
 * An address that names no page is replaced (not pushed) with your profile,
 * so back doesn't return to it.
 */
export function currentRoute (): Readable<Route> {
  return readable(readRoute(), set => {
    const follow = () => { set(readRoute()) }
    // The address may have changed between creating the store and the
    // first subscriber.
    follow()
    window.addEventListener('hashchange', follow)
    return () => { window.removeEventListener('hashchange', follow) }
  })
}

/** Go to a page without adding to history: entering from the avatar step. */
export function replaceRoute (route: Route): void {
  if (location.hash !== routeHref(route)) location.replace(routeHref(route))
}

function readRoute (): Route {
  const route = parseRoute(location.hash)
  if (route) return route
  replaceRoute(LANDING)
  return LANDING
}
