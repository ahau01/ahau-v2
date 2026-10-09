import { defineConfig, type Plugin } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

import { issueDevConnection } from './src/profile/dev-connection.ts'

/** Must match `-f` in the `conductor` script in package.json. */
const ADMIN_PORT = Number(process.env.AHAU_ADMIN_PORT ?? 4444)

/**
 * DEV ONLY. Gives the page what a launcher would: an app token and a signing
 * key for the profile functions, issued from the dev conductor's admin port.
 * The admin port stays here, in the dev server; the page never sees it.
 */
function devConductor (): Plugin {
  return {
    name: 'ahau-dev-conductor',
    apply: 'serve',
    configureServer (server) {
      server.middlewares.use('/__ahau/dev-connection', (_req, res) => {
        issueDevConnection({
          adminUrl: new URL(`ws://localhost:${ADMIN_PORT}`),
          adminOrigin: 'ahau-dev',
          appId: 'ahau'
        }).then(connection => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(connection))
        }, (err: unknown) => {
          res.statusCode = 503
          res.end(err instanceof Error ? err.message : String(err))
        })
      })
    }
  }
}

export default defineConfig({
  plugins: [svelte(), devConductor()],
  server: { port: 5173 },
  build: { outDir: 'dist-app' }
})
