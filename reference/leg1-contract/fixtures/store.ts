/**
 * In-memory store behind the fixture backend.
 *
 * Deliberately not a plain map. The contract promises things a map does not
 * do -- retraction hides a record without erasing it, visibility filters by
 * the caller's membership -- and a store that ignored those would let the
 * fixture pass while proving nothing about the contract.
 */

import { asRecordId, type RecordId } from '../contract/semantics.js'
import type {
  GroupId,
  IdentityId,
  Membership,
  RecordMeta,
  Visibility
} from '../contract/types/index.js'

let sequence = 0
export const nextId = (prefix: string): RecordId =>
  asRecordId(`${prefix}-${++sequence}`)

/** Reset the id sequence so tests are order-independent. */
export const resetIds = (): void => {
  sequence = 0
}

/** A record is active unless it has been retracted. */
export const isActive = (record: RecordMeta): boolean =>
  record.status.state === 'active'

/**
 * Whether a viewer may see something.
 *
 * Public records are visible to anyone. Group-scoped records require current
 * membership -- a lapsed membership does not grant sight, which is why `until`
 * is checked rather than merely present. Restricted records name their
 * audience.
 */
export const isVisibleTo = (
  visibility: Visibility,
  viewer: IdentityId,
  memberships: readonly Membership[]
): boolean => {
  switch (visibility.scope) {
    case 'public':
      return true
    case 'group':
      return memberships.some(
        m => m.identity === viewer && m.group === visibility.group && m.until === null
      )
    case 'restricted':
      return visibility.audience.includes(viewer)
  }
}

/** Active and visible: what a read may return. */
export const isReadable = (
  record: RecordMeta,
  viewer: IdentityId,
  memberships: readonly Membership[]
): boolean => isActive(record) && isVisibleTo(record.visibility, viewer, memberships)

/**
 * A mutable collection of records addressed by id.
 *
 * `all()` returns everything, including retracted records, because retraction
 * is not deletion and the store must be able to show that. `readable()` is
 * what operations use.
 */
export class Collection<T extends RecordMeta & { readonly id: RecordId }> {
  private readonly items = new Map<string, T>()

  constructor (seed: readonly T[] = []) {
    for (const item of seed) this.items.set(item.id, item)
  }

  all (): readonly T[] {
    return [...this.items.values()]
  }

  get (id: RecordId): T | undefined {
    return this.items.get(id)
  }

  put (item: T): void {
    this.items.set(item.id, item)
  }

  readable (viewer: IdentityId, memberships: readonly Membership[]): readonly T[] {
    return this.all().filter(item => isReadable(item, viewer, memberships))
  }

  readableOne (
    id: RecordId,
    viewer: IdentityId,
    memberships: readonly Membership[]
  ): T | null {
    const item = this.items.get(id)
    if (!item) return null
    return isReadable(item, viewer, memberships) ? item : null
  }

  /**
   * Retract a record: mark it, keep it. Returns false when the id is unknown.
   */
  retract (id: RecordId, at: string | null, reason: string | null): boolean {
    const item = this.items.get(id)
    if (!item) return false
    this.items.set(id, { ...item, status: { state: 'retracted', at, reason } })
    return true
  }
}

/** Membership lookups, kept apart because membership is not a stored record. */
export class MembershipRegister {
  private readonly rows: Membership[]

  constructor (seed: readonly Membership[]) {
    this.rows = [...seed]
  }

  all (): readonly Membership[] {
    return this.rows
  }

  of (group: GroupId): readonly Membership[] {
    return this.rows.filter(m => m.group === group && m.until === null)
  }

  for (identity: IdentityId): readonly Membership[] {
    return this.rows.filter(m => m.identity === identity && m.until === null)
  }

  add (membership: Membership): void {
    this.rows.push(membership)
  }

  end (identity: IdentityId, group: GroupId, at: string): boolean {
    const index = this.rows.findIndex(
      m => m.identity === identity && m.group === group && m.until === null
    )
    if (index === -1) return false
    const existing = this.rows[index]
    if (!existing) return false
    this.rows[index] = { ...existing, until: at }
    return true
  }
}
