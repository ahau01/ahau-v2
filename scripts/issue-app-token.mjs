#!/usr/bin/env node
//
// issue-app-token.mjs
// Issues an app authentication token for the dev conductor's `ahau` app, so a
// local process can connect to its app interface (port 8888).
//
// The token lets this process reach the installed hApp. It is not a person's
// credential or a session: identity is the conductor's agent key. Outside
// development a launcher issues and injects the token instead.
//
// For development only, the token is reusable and does not expire, so
// reloading the app doesn't need a new one. Restarting `npm run conductor`
// makes a new sandbox, which needs a new token.
//
// Usage:
//   node scripts/issue-app-token.mjs <admin-port>
//
// `npm run conductor` prints the admin port in its last line:
//   Conductor launched #!0 {"admin_port":38647,"app_ports":[8888]}

import { AdminWebsocket } from '@holochain/client'

const adminPort = Number(process.argv[2])
if (!Number.isInteger(adminPort) || adminPort <= 0) {
  console.error('Usage: node scripts/issue-app-token.mjs <admin-port>')
  process.exit(1)
}

const admin = await AdminWebsocket.connect({
  url: new URL(`ws://localhost:${adminPort}`),
  wsClientOptions: { origin: 'ahau-dev' }
})
try {
  const { token } = await admin.issueAppAuthenticationToken({
    installed_app_id: 'ahau',
    single_use: false,
    expiry_seconds: 0
  })
  console.log(JSON.stringify(token))
} finally {
  await admin.client.close()
}
