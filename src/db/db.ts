import Dexie, { type Table } from 'dexie'
import type { Assignment, Conflict, Job, SyncOp, WorkShift } from '../types'

/**
 * Local database. This is the single source of truth the UI reads from.
 * Every write goes here first (optimistic), then a `SyncOp` is enqueued
 * for the sync engine to replay against the server whenever connectivity
 * allows. Because reads never wait on the network, the UI stays fully
 * interactive offline.
 */
class DispatchDB extends Dexie {
  resources!: Table<WorkShift, string>
  jobs!: Table<Job, string>
  assignments!: Table<Assignment, string>
  syncQueue!: Table<SyncOp, string>
  conflicts!: Table<Conflict, string>

  constructor() {
    super('dispatch-board')
    this.version(1).stores({
      resources: 'id',
      jobs: 'id',
      assignments: 'id, resourceId, jobId, syncState',
      syncQueue: 'id, entityId, createdAt',
      conflicts: 'id, entityId',
    })
  }
}

export const db = new DispatchDB()
