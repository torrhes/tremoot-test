/**
 * Domain model for the dispatch board.
 *
 * A `job` is unassigned work waiting to be scheduled. An `assignment` pins a
 * job to a `workShift` (jornada de trabalho) on the timeline. Shifts are grouped
 * by `sector` so the board reads as operational areas, not mixed resource types.
 */

export type ShiftSector = 'transporte' | 'campo' | 'manutencao'

/** Jornada de trabalho — linha da escala onde serviços são alocados. */
export interface WorkShift {
  id: string
  name: string
  sector: ShiftSector
  tag: string
  color: string
  /** Janela operacional exibida na lateral, ex.: "06h–14h" */
  window: string
}

export type JobPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface Job {
  id: string
  title: string
  client: string
  durationMinutes: number
  priority: JobPriority
  location: string
}

export type SyncState = 'synced' | 'pending' | 'syncing' | 'conflict' | 'error'

export interface Assignment {
  id: string
  jobId: string
  /** ID da jornada de trabalho (linha da escala). */
  resourceId: string
  /** epoch minutes since the board's day-zero, for cheap arithmetic */
  startMinute: number
  endMinute: number
  version: number
  updatedAt: number
  updatedBy: string
  syncState: SyncState
}

/** A queued local mutation waiting to be reconciled with the server. */
export interface SyncOp {
  id: string
  entityId: string
  type: 'create' | 'update' | 'delete'
  payload: Assignment | { id: string }
  baseVersion: number
  createdAt: number
  attempts: number
}

/** Snapshot of both sides of a conflicting edit, for the resolution UI. */
export interface Conflict {
  id: string
  entityId: string
  local: Assignment
  remote: Assignment
  detectedAt: number
}

export type ConnectivityState = 'online' | 'offline'
