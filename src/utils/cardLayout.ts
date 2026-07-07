import { minuteToX } from './date'

export type CardDensity = 'full' | 'compact' | 'micro'

/** Largura visual do card na timeline (px). */
export function assignmentCardWidth(startMinute: number, endMinute: number): number {
  return Math.max(minuteToX(endMinute - startMinute) - 2, 18)
}

export function getCardDensity(widthPx: number): CardDensity {
  if (widthPx >= 120) return 'full'
  if (widthPx >= 56) return 'compact'
  return 'micro'
}
