import type { ShiftSector } from '../types'
import type { TranslationKey } from '../i18n/translations'
import { ROW_HEIGHT } from './date'

export const SECTOR_ORDER: ShiftSector[] = ['transporte', 'campo', 'manutencao']

export const SECTOR_LABEL_KEYS: Record<ShiftSector, TranslationKey> = {
  transporte: 'sector.transporte.label',
  campo: 'sector.campo.label',
  manutencao: 'sector.manutencao.label',
}

export const SECTOR_HINT_KEYS: Record<ShiftSector, TranslationKey> = {
  transporte: 'sector.transporte.hint',
  campo: 'sector.campo.hint',
  manutencao: 'sector.manutencao.hint',
}

export const SECTOR_ACCENT: Record<ShiftSector, string> = {
  transporte: '#5b8def',
  campo: '#3fb68b',
  manutencao: '#c792ea',
}

export const SECTOR_HEADER_HEIGHT = 36

export type TimelineRow =
  | { type: 'sector'; id: string; sector: ShiftSector; count: number }
  | { type: 'shift'; id: string; shift: import('../types').WorkShift }

export function buildTimelineRows(shifts: import('../types').WorkShift[]): TimelineRow[] {
  const rows: TimelineRow[] = []

  for (const sector of SECTOR_ORDER) {
    const inSector = shifts.filter((s) => s.sector === sector)
    if (inSector.length === 0) continue
    rows.push({ type: 'sector', id: `sector-${sector}`, sector, count: inSector.length })
    for (const shift of inSector) {
      rows.push({ type: 'shift', id: shift.id, shift })
    }
  }

  return rows
}

export function getTimelineRowHeight(row: TimelineRow): number {
  return row.type === 'sector' ? SECTOR_HEADER_HEIGHT : ROW_HEIGHT
}

export function findWorkShift(shifts: import('../types').WorkShift[], id: string) {
  return shifts.find((s) => s.id === id)
}
