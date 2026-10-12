/**
 * DEV ONLY. How the app reaches the local dev conductor outside a launcher.
 *
 * A launcher would issue the app token and sign zome calls itself. In dev the
 * page is a plain browser tab, so the dev server, which can reach the
 * conductor's admin port, issues them and hands them to the page. The page
 * never gets admin access.
 *
 * Neither the token nor the signing key is a person's login. Identity is
 * still the conductor's agent key; these only let this page call the
 * profile functions for that agent.
 */

import {
  AdminWebsocket,
  CellType,
  generateSigningKeyPair,
  setSigningCredentials,
  type CellId
} from '@holochain/client'

import {
  APP_ID,
  PROFILE_FUNCTIONS,
  ROLE,
  ZOME,
  createProfileClient,
  type ProfileClient,
  type ProfileClientOptions
} from './client.js'

/** Must match `-f` in the `conductor` script in package.json. */
export const DEV_ADMIN_PORT = 4444
/** Must match `--run` in the `conductor` script in package.json. */
export const DEV_APP_PORT = 8888
/** The dev server route that hands the page its connection details. */
export const DEV_CONNECTION_ROUTE = '/__ahau/dev-connection'

/**
 * The dev server only answers once it has reached the conductor, so the app
 * port should answer at once. Don't spend the launcher's 30s finding out it won't.
 */
const DEV_READY_TIMEOUT_MS = 3_000

/** What the dev server hands the page. Plain arrays so it survives JSON. */
export interface DevConnection {
  appToken: number[]
  cellId: [number[], number[]]
  signing: {
    capSecret: number[]
    privateKey: number[]
    publicKey: number[]
    signingKey: number[]
  }
}

export interface IssueDevConnectionOptions {
  /** The conductor's admin interface. */
  adminUrl: URL
  /** Origin the admin interface allows. */
  adminOrigin: string
  /** The installed hApp to connect to. */
  appId?: string
}

/** The dev server could not reach the conductor's admin port at all. */
export class ConductorUnreachableError extends Error {
  override name = 'ConductorUnreachableError'
}

/** Node side: issue a fresh token and signing key for the page. */
export async function issueDevConnection (options: IssueDevConnectionOptions): Promise<DevConnection> {
  const appId = options.appId ?? APP_ID
  let admin: AdminWebsocket
  try {
    admin = await AdminWebsocket.connect({
      url: options.adminUrl,
      wsClientOptions: { origin: options.adminOrigin }
    })
  } catch (err) {
    throw new ConductorUnreachableError(errorMessage(err), { cause: err })
  }
  try {
    const cellId = await profileCell(admin, appId)
    const { token } = await admin.issueAppAuthenticationToken({ installed_app_id: appId })
    const [keyPair, signingKey] = await generateSigningKeyPair()
    // Only the profile functions can be called with this key; the conductor enforces it.
    const functions = PROFILE_FUNCTIONS.map((fn): [string, string] => [ZOME, fn])
    const capSecret = await admin.grantSigningKey(cellId, { type: 'listed', value: functions }, signingKey)
    return {
      appToken: [...token],
      cellId: [[...cellId[0]], [...cellId[1]]],
      signing: {
        capSecret: [...capSecret],
        privateKey: [...keyPair.privateKey],
        publicKey: [...keyPair.publicKey],
        signingKey: [...signingKey]
      }
    }
  } finally {
    await admin.client.close()
  }
}

async function profileCell (admin: AdminWebsocket, appId: string): Promise<CellId> {
  const apps = await admin.listApps({})
  const cell = apps.find(app => app.installed_app_id === appId)?.cell_info[ROLE]
    ?.find(info => info.type === CellType.Provisioned)
  if (cell?.type !== CellType.Provisioned) throw new Error(`The ${appId} app has no ${ROLE} cell`)
  return cell.value.cell_id
}

/**
 * Dev server side: answer a request on DEV_CONNECTION_ROUTE. The status tells
 * the page what went wrong: 503 means the conductor isn't running, 500 means
 * it is but something else failed.
 */
export async function devConnectionResponse (options: IssueDevConnectionOptions): Promise<{ status: number, body: string }> {
  try {
    return { status: 200, body: JSON.stringify(await issueDevConnection(options)) }
  } catch (err) {
    return { status: err instanceof ConductorUnreachableError ? 503 : 500, body: errorMessage(err) }
  }
}

/** Page side: ask the dev server for connection details. Throws a reason fit to show. */
async function fetchFromDevServer (): Promise<DevConnection> {
  let response: Response
  try {
    response = await fetch(DEV_CONNECTION_ROUTE)
  } catch (err) {
    throw new Error(`Couldn't reach the dev server. Is npm run dev running? (${errorMessage(err)})`)
  }
  if (response.ok) return await response.json()
  const detail = await response.text()
  switch (response.status) {
    case 503: throw new Error(`Holochain isn't running. Start it with npm run conductor, then reload. (${detail})`)
    case 404: throw new Error('This page has no dev server to reach Holochain through. Run it with npm run dev.')
    default: throw new Error(`Holochain is running, but connecting to it failed: ${detail}`)
  }
}

export interface DevProfileClientOptions extends Omit<ProfileClientOptions, 'appToken'> {
  /** Get connection details. Defaults to asking the dev server. Throws a reason fit to show. */
  fetchConnection?: () => Promise<DevConnection>
}

/** Page side: a profile client that gets its connection from the dev server. */
export function createDevProfileClient (options: DevProfileClientOptions = {}): ProfileClient {
  const {
    fetchConnection = fetchFromDevServer,
    url = new URL(`ws://localhost:${DEV_APP_PORT}`),
    timeoutMs = DEV_READY_TIMEOUT_MS,
    ...clientOptions
  } = options
  let client: ProfileClient | undefined

  function connected (): ProfileClient {
    if (!client) throw new Error('Not connected to Holochain: call waitUntilReady first')
    return client
  }

  return {
    async waitUntilReady () {
      if (!client) {
        let connection: DevConnection
        try {
          connection = await fetchConnection()
        } catch (err) {
          // Fail fast rather than spin: the person running the demo fixes it
          // and reloads. `client` stays unset, so a later call tries again.
          return { status: 'failed', reason: errorMessage(err) }
        }
        const { signing } = connection
        const cellId: CellId = [new Uint8Array(connection.cellId[0]), new Uint8Array(connection.cellId[1])]
        setSigningCredentials(cellId, {
          capSecret: new Uint8Array(signing.capSecret),
          keyPair: { keyType: 'ed25519', privateKey: new Uint8Array(signing.privateKey), publicKey: new Uint8Array(signing.publicKey) },
          signingKey: new Uint8Array(signing.signingKey)
        })
        client = createProfileClient({ ...clientOptions, url, timeoutMs, appToken: connection.appToken })
      }
      return await client.waitUntilReady()
    },

    async getMyProfile () { return await connected().getMyProfile() },
    async createMyProfile (profile) { return await connected().createMyProfile(profile) },
    async updateMyProfile (profile) { return await connected().updateMyProfile(profile) },
    async close () { await client?.close() }
  }
}

function errorMessage (err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}
