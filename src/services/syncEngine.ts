import { v4 as uuid } from 'uuid'
import { db } from '../db/db'
import { deleteAssignmentRemote, pushAssignment } from '../api/mockServer'
import type { Assignment, Conflict, SyncOp } from '../types'

/**
 * The sync engine owns the write path from local queue to server.
 *
 * Flow for every user edit:
 *   1. UI writes the new state to IndexedDB immediately (optimistic) and
 *      marks the record `pending`. The user sees the result instantly,
 *      online or not.
 *   2. A `SyncOp` capturing the edit and the version it was based on is
 *      enqueued.
 *   3. Whenever the app is online, the queue is drained in order. Each op
 *      is sent with its `baseVersion`. If the server's version has moved
 *      on (someone else changed the same record), the push is rejected
 *      and a `Conflict` is recorded instead of silently overwriting or
 *      dropping data.
 *   4. Network failures are retried with exponential backoff; conflicts
 *      are surfaced to the user for manual resolution.
 *
 * The engine communicates with the rest of the app through a tiny event
 * bus rather than importing the store directly, so it can be unit tested
 * in isolation.
 */

type EngineEvent =
  | { type: 'queue-changed'; size: number }
  | { type: 'assignment-updated'; assignment: Assignment }
  | { type: 'conflict-detected'; conflict: Conflict }
  | { type: 'sync-cycle-start' }
  | { type: 'sync-cycle-end' }

type Listener = (event: EngineEvent) => void
const listeners = new Set<Listener>()

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function emit(event: EngineEvent) {
  for (const l of listeners) l(event)
}

let draining = false
let backoffMs = 1000
const MAX_BACKOFF = 20_000

export async function enqueue(op: SyncOp) {
  await db.syncQueue.put(op)
  const size = await db.syncQueue.count()
  emit({ type: 'queue-changed', size })
}

export async function queueSize(): Promise<number> {
  return db.syncQueue.count()
}

/** Builds and enqueues an update op for an assignment that was just saved locally. */
export async function queueAssignmentUpsert(assignment: Assignment, baseVersion: number) {
  await enqueue({
    id: uuid(),
    entityId: assignment.id,
    type: 'update',
    payload: assignment,
    baseVersion,
    createdAt: Date.now(),
    attempts: 0,
  })
}

export async function queueAssignmentDelete(assignmentId: string, baseVersion: number) {
  await enqueue({
    id: uuid(),
    entityId: assignmentId,
    type: 'delete',
    payload: { id: assignmentId },
    baseVersion,
    createdAt: Date.now(),
    attempts: 0,
  })
}

/** Drains the queue in FIFO order. Safe to call repeatedly; re-entrant calls no-op. */
export async function drainQueue(): Promise<void> {
  if (draining) return
  if (!navigator.onLine) return
  draining = true
  emit({ type: 'sync-cycle-start' })

  try {
    while (navigator.onLine) {
      const next = await db.syncQueue.orderBy('createdAt').first()
      if (!next) break

      const result = await applyOp(next)

      if (result === 'ok' || result === 'superseded') {
        await db.syncQueue.delete(next.id)
        backoffMs = 1000
        emit({ type: 'queue-changed', size: await db.syncQueue.count() })
        continue
      }

      if (result === 'conflict') {
        await db.syncQueue.delete(next.id)
        emit({ type: 'queue-changed', size: await db.syncQueue.count() })
        continue
      }

      // network failure: bump attempts, back off, stop draining for now
      await db.syncQueue.update(next.id, { attempts: next.attempts + 1 })
      break
    }
  } finally {
    draining = false
    emit({ type: 'sync-cycle-end' })
  }
}

type ApplyResult = 'ok' | 'conflict' | 'network' | 'superseded'

async function applyOp(op: SyncOp): Promise<ApplyResult> {
  if (op.type === 'delete') {
    await deleteAssignmentRemote(op.entityId)
    await db.assignments.delete(op.entityId)
    return 'ok'
  }

  const localNow = await db.assignments.get(op.entityId)
  if (!localNow) return 'superseded' // deleted locally after the op was queued

  await db.assignments.update(op.entityId, { syncState: 'syncing' })
  emit({ type: 'assignment-updated', assignment: { ...localNow, syncState: 'syncing' } })

  // A newer local op for the same entity already exists further in the
  // queue: this stale one can be skipped, the newer one will carry the
  // latest state.
  const newerPending = await db.syncQueue
    .where('entityId')
    .equals(op.entityId)
    .and((o) => o.createdAt > op.createdAt)
    .first()
  if (newerPending) return 'superseded'

  const result = await pushAssignment(op.payload as Assignment, op.baseVersion)

  if (result.ok) {
    await db.assignments.put(result.assignment)
    emit({ type: 'assignment-updated', assignment: result.assignment })
    return 'ok'
  }

  if (result.reason === 'network') {
    const pending = { ...localNow, syncState: 'pending' as const }
    await db.assignments.put(pending)
    emit({ type: 'assignment-updated', assignment: pending })
    return 'network'
  }

  // Genuine conflict: someone else changed this record since we branched
  // off. Keep both versions around and let the user decide.
  const conflict: Conflict = {
    id: uuid(),
    entityId: op.entityId,
    local: { ...(op.payload as Assignment), syncState: 'conflict' },
    remote: result.serverAssignment,
    detectedAt: Date.now(),
  }
  await db.conflicts.put(conflict)
  await db.assignments.update(op.entityId, { syncState: 'conflict' })
  emit({ type: 'conflict-detected', conflict })
  return 'conflict'
}

let retryTimer: ReturnType<typeof setTimeout> | null = null

function scheduleRetry() {
  if (retryTimer) return
  retryTimer = setTimeout(async () => {
    retryTimer = null
    backoffMs = Math.min(backoffMs * 1.8, MAX_BACKOFF)
    await drainQueue()
    const remaining = await db.syncQueue.count()
    if (remaining > 0) scheduleRetry()
  }, backoffMs)
}

export function initSyncEngine() {
  window.addEventListener('online', () => {
    backoffMs = 1000
    drainQueue()
  })

  // Keep trying in the background in case of transient failures, and
  // periodically in case `online` events are unreliable (e.g. captive
  // portals that report connectivity falsely).
  const poll = setInterval(async () => {
    const remaining = await db.syncQueue.count()
    if (remaining > 0 && navigator.onLine) {
      drainQueue()
    }
  }, 4000)

  drainQueue()

  return () => clearInterval(poll)
}

export async function resolveConflict(
  conflict: Conflict,
  resolution: 'keep-local' | 'keep-remote' | 'merge',
  merged?: Assignment,
) {
  await db.conflicts.delete(conflict.id)

  if (resolution === 'keep-remote') {
    await db.assignments.put({ ...conflict.remote, syncState: 'synced' })
    emit({ type: 'assignment-updated', assignment: conflict.remote })
    return
  }

  const winning =
    resolution === 'merge' && merged
      ? merged
      : { ...conflict.local, version: conflict.remote.version }

  await db.assignments.put({ ...winning, syncState: 'pending' })
  await queueAssignmentUpsert(winning, conflict.remote.version)
  emit({ type: 'assignment-updated', assignment: winning })
  scheduleRetry()
}
