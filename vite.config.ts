import { defineConfig, type Plugin } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

import { DEV_ADMIN_PORT, DEV_CONNECTION_ROUTE, devConnectionResponse } from './src/profile/dev-connection.ts'

const ADMIN_PORT = Number(process.env.AHAU_ADMIN_PORT ?? DEV_ADMIN_PORT)

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
      server.middlewares.use(DEV_CONNECTION_ROUTE, (_req, res) => {
        void devConnectionResponse({
          adminUrl: new URL(`ws://localhost:${ADMIN_PORT}`),
          adminOrigin: 'ahau-dev'
        }).then(({ status, body }) => {
          res.statusCode = status
          res.setHeader('Content-Type', status === 200 ? 'application/json' : 'text/plain')
          res.end(body)
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
