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

import { createProfileClient, type ProfileClient, type ProfileClientOptions } from './client.js'

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
  appId: string
}

/** Only these zome functions can be called with the issued signing key. */
const PROFILE_FUNCTIONS: Array<[string, string]> = [
  ['profiles', 'get_my_profile'],
  ['profiles', 'create_my_profile']
]

/** Node side: issue a fresh token and signing key for the page. */
export async function issueDevConnection (options: IssueDevConnectionOptions): Promise<DevConnection> {
  const admin = await AdminWebsocket.connect({
    url: options.adminUrl,
    wsClientOptions: { origin: options.adminOrigin }
  })
  try {
    const cellId = await profileCell(admin, options.appId)
    const { token } = await admin.issueAppAuthenticationToken({ installed_app_id: options.appId })
    const [keyPair, signingKey] = await generateSigningKeyPair()
    const capSecret = await admin.grantSigningKey(cellId, { type: 'listed', value: PROFILE_FUNCTIONS }, signingKey)
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
  const cell = apps.find(app => app.installed_app_id === appId)?.cell_info['ahau']
    ?.find(info => info.type === CellType.Provisioned)
  if (cell?.type !== CellType.Provisioned) throw new Error(`The ${appId} app has no ahau cell`)
  return cell.value.cell_id
}

export interface DevProfileClientOptions extends Omit<ProfileClientOptions, 'appToken'> {
  /** Ask the dev server for connection details. */
  fetchConnection: () => Promise<DevConnection>
}

/** Page side: a profile client that gets its connection from the dev server. */
export function createDevProfileClient (options: DevProfileClientOptions): ProfileClient {
  const { fetchConnection, ...clientOptions } = options
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
          // Usually `npm run conductor` isn't running. Fail fast rather than
          // spin: the person running the demo starts it and reloads. `client`
          // stays unset, so a later call tries again.
          const cause = err instanceof Error ? err.message : String(err)
          return { status: 'failed', reason: `Holochain isn't running. Start it with npm run conductor, then reload. (${cause})` }
        }
        const { signing } = connection
        const cellId: CellId = [new Uint8Array(connection.cellId[0]), new Uint8Array(connection.cellId[1])]
        setSigningCredentials(cellId, {
          capSecret: new Uint8Array(signing.capSecret),
          keyPair: { keyType: 'ed25519', privateKey: new Uint8Array(signing.privateKey), publicKey: new Uint8Array(signing.publicKey) },
          signingKey: new Uint8Array(signing.signingKey)
        })
        client = createProfileClient({ ...clientOptions, appToken: connection.appToken })
      }
      return await client.waitUntilReady()
    },

    async getMyProfile () { return await connected().getMyProfile() },
    async createMyProfile (profile) { return await connected().createMyProfile(profile) },
    async close () { await client?.close() }
  }
}
