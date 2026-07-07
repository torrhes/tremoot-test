import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useTimelineView } from '../../hooks/useTimelineView'
import { useScheduleStore } from '../../store/scheduleStore'
import { useLocaleStore } from '../../store/localeStore'
import { useViewportStore } from '../../store/viewportStore'
import { HOUR_WIDTH } from '../../utils/date'
import { buildTimelineRows } from '../../utils/sectors'
import { SectorLane } from './SectorLane'
import { SectorRail } from './SectorRail'
import { ShiftLane } from './ShiftLane'
import { ShiftRail } from './ShiftRail'
import { TimeHeader } from './TimeHeader'

export function TimelineView() {
  const workShifts = useScheduleStore((s) => s.workShifts)
  const scrollLeft = useViewportStore((s) => s.scrollLeft)
  const focusedDay = useViewportStore((s) => s.focusedDay)
  const setScroll = useViewportStore((s) => s.setScroll)
  const t = useLocaleStore((s) => s.t)
  const { viewBoardWidth } = useTimelineView()
  const boardRef = useRef<HTMLDivElement>(null)
  const railInnerRef = useRef<HTMLDivElement>(null)

  const rows = useMemo(() => buildTimelineRows(workShifts), [workShifts])

  const handleBoardScroll = useCallback(() => {
    const el = boardRef.current
    if (!el) return
    setScroll(el.scrollLeft, el.clientWidth)
    if (railInnerRef.current) {
      railInnerRef.current.style.transform = `translateY(-${el.scrollTop}px)`
    }
  }, [setScroll])

  useEffect(() => {
    handleBoardScroll()
  }, [handleBoardScroll, rows, focusedDay])

  useEffect(() => {
    const el = boardRef.current
    if (el) {
      el.scrollLeft = 0
      handleBoardScroll()
    }
  }, [focusedDay, handleBoardScroll])

  return (
    <div className="timeline">
      <TimeHeader scrollLeft={scrollLeft} />
      <div className="timeline__body">
        <aside className="timeline__rail" aria-label={t('timeline.shiftsAria')}>
          <div ref={railInnerRef} className="timeline__rail-inner">
            {rows.map((row) =>
              row.type === 'sector' ? (
                <SectorRail key={row.id} sector={row.sector} count={row.count} />
              ) : (
                <ShiftRail key={row.id} shift={row.shift} />
              ),
            )}
          </div>
        </aside>

        <div ref={boardRef} className="timeline__board" onScroll={handleBoardScroll}>
          <div
            className="timeline__board-inner"
            style={{ width: viewBoardWidth, '--hour-width': `${HOUR_WIDTH}px` } as React.CSSProperties}
          >
            {rows.map((row) =>
              row.type === 'sector' ? (
                <SectorLane key={row.id} sector={row.sector} />
              ) : (
                <ShiftLane key={row.id} shift={row.shift} />
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
