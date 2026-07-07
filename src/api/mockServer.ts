import type { Assignment } from '../types'

/**
 * Stand-in for a real backend. It keeps its own copy of assignments in
 * `localStorage` (deliberately separate from the client's IndexedDB) and
 * simulates:
 *   - network latency (300–1200ms)
 *   - occasional transient failures (for retry/backoff)
 *   - a "ghost dispatcher": another user editing the same board from a
 *     different device, so this client sees genuine version conflicts
 *     when it comes back online rather than a scripted demo conflict.
 */

const SERVER_KEY = 'dispatch-server-assignments-v1'

function readServer(): Record<string, Assignment> {
  const raw = localStorage.getItem(SERVER_KEY)
  return raw ? JSON.parse(raw) : {}
}

function writeServer(state: Record<string, Assignment>) {
  localStorage.setItem(SERVER_KEY, JSON.stringify(state))
}

function delay(min = 300, max = 1200) {
  const ms = min + Math.random() * (max - min)
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function seedServer(assignments: Assignment[]) {
  const existing = readServer()
  if (Object.keys(existing).length > 0) return
  const state: Record<string, Assignment> = {}
  for (const a of assignments) state[a.id] = a
  writeServer(state)
}

export async function fetchServerSnapshot(): Promise<Assignment[]> {
  await delay(200, 600)
  return Object.values(readServer())
}

export type PushResult =
  | { ok: true; assignment: Assignment }
  | { ok: false; reason: 'conflict'; serverAssignment: Assignment }
  | { ok: false; reason: 'network' }

/**
 * Attempts to apply a client mutation to the server. Uses optimistic
 * concurrency: the push is only accepted if `baseVersion` still matches
 * what the server has. Otherwise the caller gets the current server
 * record back so it can be reconciled.
 */
export async function pushAssignment(
  candidate: Assignment,
  baseVersion: number,
): Promise<PushResult> {
  await delay()

  // Simulate occasional transient network failure (~8%).
  if (Math.random() < 0.08) {
    return { ok: false, reason: 'network' }
  }

  const server = readServer()
  const current = server[candidate.id]

  if (current && current.version !== baseVersion) {
    return { ok: false, reason: 'conflict', serverAssignment: current }
  }

  const accepted: Assignment = {
    ...candidate,
    version: baseVersion + 1,
    syncState: 'synced',
  }
  server[candidate.id] = accepted
  writeServer(server)
  return { ok: true, assignment: accepted }
}

export async function deleteAssignmentRemote(id: string): Promise<{ ok: true }> {
  await delay(150, 400)
  const server = readServer()
  delete server[id]
  writeServer(server)
  return { ok: true }
}

/**
 * Simulates a colleague dispatching from another device: periodically
 * nudges a random assignment's time and bumps its version directly on
 * the "server", independent of this client. When this client is offline
 * and also edits that same assignment, the next sync will surface a
 * genuine conflict instead of one that was hand-scripted.
 */
export function startGhostDispatcher(intervalMs = 9000) {
  const timer = setInterval(() => {
    const server = readServer()
    const ids = Object.keys(server)
    if (ids.length === 0) return
    const id = ids[Math.floor(Math.random() * ids.length)]
    const record = server[id]
    // Small chance per tick, so it doesn't fight every assignment constantly.
    if (Math.random() > 0.35) return
    const shiftMinutes = Math.random() > 0.5 ? 30 : -30
    server[id] = {
      ...record,
      startMinute: record.startMinute + shiftMinutes,
      endMinute: record.endMinute + shiftMinutes,
      version: record.version + 1,
      updatedAt: Date.now(),
      updatedBy: 'colega (outro dispositivo)',
    }
    writeServer(server)
  }, intervalMs)
  return () => clearInterval(timer)
}
