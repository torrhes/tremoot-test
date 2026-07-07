import type { Locale } from '../i18n/types'

export const DAY_MINUTES = 24 * 60
export const BOARD_DAYS = 14
export const PX_PER_MINUTE = 2.5
export const ROW_HEIGHT = 56
export const HOUR_WIDTH = 60 * PX_PER_MINUTE

export const BOARD_START = (() => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
})()

export function localeTag(locale: Locale): string {
  return locale === 'en' ? 'en-US' : 'pt-BR'
}

export function minuteToDate(minute: number): Date {
  return new Date(BOARD_START.getTime() + minute * 60_000)
}

export function dateToMinute(date: Date): number {
  return Math.round((date.getTime() - BOARD_START.getTime()) / 60_000)
}

export function getViewStartMinute(focusedDay: number | null): number {
  if (focusedDay === null) return 0
  return focusedDay * DAY_MINUTES
}

export function getViewEndMinute(focusedDay: number | null): number {
  const start = getViewStartMinute(focusedDay)
  const span = focusedDay === null ? BOARD_DAYS * DAY_MINUTES : DAY_MINUTES
  return start + span
}

export function getViewBoardWidth(focusedDay: number | null): number {
  return minuteToX(getViewEndMinute(focusedDay) - getViewStartMinute(focusedDay))
}

export function minuteToViewX(absoluteMinute: number, viewStartMinute: number): number {
  return minuteToX(absoluteMinute - viewStartMinute)
}

export function minuteToX(minute: number): number {
  return minute * PX_PER_MINUTE
}

export function xToMinute(x: number): number {
  return x / PX_PER_MINUTE
}

export function formatHour(minute: number, locale: Locale = 'pt'): string {
  const d = minuteToDate(minute)
  return d.toLocaleTimeString(localeTag(locale), { hour: '2-digit', minute: '2-digit' })
}

export function formatDayLabel(minute: number, locale: Locale = 'pt'): string {
  const d = minuteToDate(minute)
  return d.toLocaleDateString(localeTag(locale), { weekday: 'short', day: '2-digit', month: 'short' })
}

export function snapToGrid(minute: number, gridMinutes = 15): number {
  return Math.round(minute / gridMinutes) * gridMinutes
}

export function nowMinute(): number {
  return dateToMinute(new Date())
}

export function minuteToDatetimeLocalValue(minute: number): string {
  const d = minuteToDate(minute)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function dateToInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function minuteToDateInput(minute: number): string {
  return dateToInputValue(minuteToDate(minute))
}

export function minuteToTimeInput(minute: number): string {
  const d = minuteToDate(minute)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function dateAndTimeToMinute(date: string, time: string): number {
  return dateToMinute(new Date(`${date}T${time}`))
}

export function dayIndexFromDateInput(date: string): number {
  return Math.floor(dateToMinute(new Date(`${date}T00:00`)) / DAY_MINUTES)
}

export function boardDateOptions(locale: Locale = 'pt'): { value: string; label: string; dayIndex: number }[] {
  return Array.from({ length: BOARD_DAYS }, (_, i) => {
    const minute = i * DAY_MINUTES
    const d = minuteToDate(minute)
    return {
      value: dateToInputValue(d),
      label: formatDayLabel(minute, locale),
      dayIndex: i,
    }
  })
}

export function defaultScheduleSlot(focusedDay: number | null = null): { date: string; time: string } {
  const maxMinute = BOARD_DAYS * DAY_MINUTES - 60
  const dayStart = getViewStartMinute(focusedDay)
  const dayEnd = getViewEndMinute(focusedDay) - 60
  const now = nowMinute()
  const inView = focusedDay === null ? now : Math.max(dayStart, Math.min(now, dayEnd))
  const snapped = snapToGrid(Math.max(dayStart, inView))
  const capped = Math.min(snapped, maxMinute)
  return { date: minuteToDateInput(capped), time: minuteToTimeInput(capped) }
}

export function datetimeLocalValueToMinute(value: string): number {
  const d = new Date(value)
  return dateToMinute(d)
}

export const TOTAL_BOARD_MINUTES = BOARD_DAYS * DAY_MINUTES
export const TOTAL_BOARD_WIDTH = minuteToX(TOTAL_BOARD_MINUTES)
