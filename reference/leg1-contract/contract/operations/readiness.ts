/** Whether the backend is ready to serve. */
export interface ReadinessOperations {
  /**
   * Report whether the backend can serve reads yet.
   * Source: `getIndexes`. That returned ssb-db2 internals -- isIndexing,
   * isRebuilding, percentageIndexed -- which have no counterpart in a
   * Holochain conductor or a nostr relay. The capability is required of every
   * adapter, since the application polls it before rendering; the shape is
   * not, so progress is optional and a backend may report only ready or not.
   */
  getReadiness(): Promise<Readiness>
}

export interface Readiness {
  readonly ready: boolean
  /** 0-1 where the backend can estimate; null where it cannot. */
  readonly progress: number | null
}
