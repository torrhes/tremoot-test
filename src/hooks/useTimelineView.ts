import { useViewportStore } from '../store/viewportStore'
import {
  BOARD_DAYS,
  DAY_MINUTES,
  getViewBoardWidth,
  getViewEndMinute,
  getViewStartMinute,
  minuteToViewX,
} from '../utils/date'

export function useTimelineView() {
  const focusedDay = useViewportStore((s) => s.focusedDay)
  const viewStartMinute = getViewStartMinute(focusedDay)
  const viewEndMinute = getViewEndMinute(focusedDay)
  const viewBoardWidth = getViewBoardWidth(focusedDay)
  const isSingleDay = focusedDay !== null

  return {
    focusedDay,
    viewStartMinute,
    viewEndMinute,
    viewBoardWidth,
    isSingleDay,
    dayCount: isSingleDay ? 1 : BOARD_DAYS,
    toViewX: (absoluteMinute: number) => minuteToViewX(absoluteMinute, viewStartMinute),
    dayOffsets: isSingleDay ? [viewStartMinute] : Array.from({ length: BOARD_DAYS }, (_, i) => i * DAY_MINUTES),
  }
}
