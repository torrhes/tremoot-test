import { create } from 'zustand'
import { getViewStartMinute, xToMinute } from '../utils/date'

interface ViewportState {
  scrollLeft: number
  viewportWidth: number
  visibleStart: number
  visibleEnd: number
  jobTrayCollapsed: boolean
  /** null = 14-day board; 0–13 = single day index from board start */
  focusedDay: number | null
  setScroll: (scrollLeft: number, viewportWidth: number) => void
  toggleJobTray: () => void
  setFocusedDay: (day: number | null) => void
}

const BUFFER_MINUTES = 180

function computeVisibleRange(scrollLeft: number, viewportWidth: number, focusedDay: number | null) {
  const viewStart = getViewStartMinute(focusedDay)
  const relativeStart = xToMinute(scrollLeft)
  return {
    visibleStart: viewStart + relativeStart - BUFFER_MINUTES,
    visibleEnd: viewStart + relativeStart + xToMinute(viewportWidth) + BUFFER_MINUTES,
  }
}

export const useViewportStore = create<ViewportState>((set, get) => ({
  scrollLeft: 0,
  viewportWidth: 0,
  visibleStart: -BUFFER_MINUTES,
  visibleEnd: xToMinute(1600) + BUFFER_MINUTES,
  jobTrayCollapsed: false,
  focusedDay: null,
  setScroll: (scrollLeft, viewportWidth) => {
    const { focusedDay } = get()
    set({
      scrollLeft,
      viewportWidth,
      ...computeVisibleRange(scrollLeft, viewportWidth, focusedDay),
    })
  },
  toggleJobTray: () => set((s) => ({ jobTrayCollapsed: !s.jobTrayCollapsed })),
  setFocusedDay: (day) => {
    const { scrollLeft, viewportWidth } = get()
    set({
      focusedDay: day,
      scrollLeft: 0,
      ...computeVisibleRange(0, viewportWidth, day),
    })
  },
}))
