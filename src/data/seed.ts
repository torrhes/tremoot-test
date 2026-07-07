import { v4 as uuid } from 'uuid'
import type { Assignment, Job, WorkShift } from '../types'
import { nowMinute } from '../utils/date'

const PALETTE = ['#ff8a34', '#5b8def', '#3fb68b', '#c792ea', '#e5484d', '#f2c94c']

export function buildWorkShifts(): WorkShift[] {
  const transporte: WorkShift[] = [
    { tag: 'TR-M1', name: 'Jornada Manhã — V-01', window: '06h–14h' },
    { tag: 'TR-T1', name: 'Jornada Tarde — V-02', window: '14h–22h' },
    { tag: 'TR-M2', name: 'Jornada Manhã — V-03', window: '06h–14h' },
    { tag: 'TR-T2', name: 'Jornada Tarde — V-04', window: '14h–22h' },
  ].map((row, i) => ({
    id: uuid(),
    sector: 'transporte' as const,
    color: PALETTE[i % PALETTE.length],
    ...row,
  }))

  const campo: WorkShift[] = [
    { tag: 'CP-A1', name: 'Equipe A — Turno 1', window: '07h–15h' },
    { tag: 'CP-B1', name: 'Equipe B — Turno 1', window: '07h–15h' },
    { tag: 'CP-C1', name: 'Equipe C — Turno 2', window: '15h–23h' },
  ].map((row, i) => ({
    id: uuid(),
    sector: 'campo' as const,
    color: PALETTE[(i + 2) % PALETTE.length],
    ...row,
  }))

  const manutencao: WorkShift[] = [
    { tag: 'MN-D1', name: 'Técnicos — Diurno', window: '08h–17h' },
    { tag: 'MN-V1', name: 'Técnicos — Vespertino', window: '13h–22h' },
    { tag: 'MN-P1', name: 'Plantão — Especialistas', window: '18h–06h' },
  ].map((row, i) => ({
    id: uuid(),
    sector: 'manutencao' as const,
    color: PALETTE[(i + 4) % PALETTE.length],
    ...row,
  }))

  return [...transporte, ...campo, ...manutencao]
}

const CLIENTS = ['Porto Norte', 'Mercado Central', 'Distribuidora Sul', 'Fazenda Bela Vista', 'Terminal 4']
const TITLES = [
  'Coleta de contêiner',
  'Entrega expressa',
  'Manutenção preventiva',
  'Instalação de equipamento',
  'Vistoria técnica',
  'Transporte refrigerado',
]

export function buildUnassignedJobs(count = 10): Job[] {
  const jobs: Job[] = []
  for (let i = 0; i < count; i++) {
    jobs.push({
      id: uuid(),
      title: TITLES[i % TITLES.length],
      client: CLIENTS[i % CLIENTS.length],
      durationMinutes: [30, 60, 90, 120, 180][i % 5],
      priority: (['low', 'normal', 'high', 'urgent'] as const)[i % 4],
      location: `Zona ${String.fromCharCode(65 + (i % 5))}`,
    })
  }
  return jobs
}

export function buildInitialAssignments(shifts: WorkShift[], jobs: Job[]): {
  assignments: Assignment[]
  remainingJobs: Job[]
} {
  const now = nowMinute()
  const assignments: Assignment[] = []
  const used = new Set<number>()
  const seededCount = Math.min(6, jobs.length)

  for (let i = 0; i < seededCount; i++) {
    const job = jobs[i]
    const shift = shifts[i % shifts.length]
    const dayOffset = i % 3
    const startMinute = now - (now % 60) + dayOffset * 1440 + (i % 4) * 120
    assignments.push({
      id: uuid(),
      jobId: job.id,
      resourceId: shift.id,
      startMinute,
      endMinute: startMinute + job.durationMinutes,
      version: 1,
      updatedAt: Date.now(),
      updatedBy: 'seed',
      syncState: 'synced',
    })
    used.add(i)
  }

  const remainingJobs = jobs.filter((_, i) => !used.has(i))
  return { assignments, remainingJobs }
}

/** Dados antigos usavam `kind` em vez de `sector` — força reseed das jornadas. */
export function isLegacyShiftRow(row: unknown): boolean {
  return typeof row === 'object' && row !== null && 'kind' in row && !('sector' in row)
}
