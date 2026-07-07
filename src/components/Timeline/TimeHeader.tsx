import { useEffect, useRef, useState } from 'react'
import { useTimelineView } from '../../hooks/useTimelineView'
import { useLocaleStore } from '../../store/localeStore'
import { DAY_MINUTES, formatDayLabel, minuteToViewX, nowMinute } from '../../utils/date'

interface Props {
  scrollLeft: number
}

export function TimeHeader({ scrollLeft }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [now, setNow] = useState(nowMinute())
  const locale = useLocaleStore((s) => s.locale)
  const t = useLocaleStore((s) => s.t)
  const { viewStartMinute, viewEndMinute, viewBoardWidth, dayOffsets, isSingleDay } = useTimelineView()

  const hoursPerTick = isSingleDay ? 1 : 3

  useEffect(() => {
    const id = setInterval(() => setNow(nowMinute()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${-scrollLeft}px)`
    }
  }, [scrollLeft])

  const showNowLine = now >= viewStartMinute && now < viewEndMinute

  return (
    <div className="time-header">
      <div className="time-header__corner">{t('timeline.shift')}</div>
      <div className="time-header__viewport">
        <div ref={trackRef} className="time-header__track" style={{ width: viewBoardWidth }}>
          <div className="time-header__days">
            {dayOffsets.map((dayStart) => (
              <div
                key={dayStart}
                className="time-header__day"
                style={{
                  left: minuteToViewX(dayStart, viewStartMinute),
                  width: minuteToViewX(dayStart + DAY_MINUTES, viewStartMinute) - minuteToViewX(dayStart, viewStartMinute),
                }}
              >
                {formatDayLabel(dayStart, locale)}
              </div>
            ))}
          </div>
          <div className="time-header__hours">
            {dayOffsets.map((dayStart) =>
              Array.from({ length: 24 / hoursPerTick }, (_, i) => i * hoursPerTick).map((h) => (
                <div
                  key={`${dayStart}-${h}`}
                  className="time-header__hour"
                  style={{ left: minuteToViewX(dayStart + h * 60, viewStartMinute) }}
                >
                  {String(h).padStart(2, '0')}h
                </div>
              )),
            )}
          </div>
          {showNowLine && (
            <div className="now-line now-line--header" style={{ left: minuteToViewX(now, viewStartMinute) }} />
          )}
        </div>
      </div>
    </div>
  )
}

export { RAIL_WIDTH } from './layout'
