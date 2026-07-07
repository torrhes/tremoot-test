import type { JobPriority } from '../types'
import { useLocaleStore } from '../store/localeStore'
import { boardDateOptions } from '../utils/date'
import { SECTOR_LABEL_KEYS, SECTOR_ORDER } from '../utils/sectors'
import type { WorkShift } from '../types'

interface Props {
  shiftId: string
  date: string
  time: string
  workShifts: WorkShift[]
  onShiftChange: (id: string) => void
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
}

const PRIORITY_KEYS: Record<JobPriority, 'priority.low' | 'priority.normal' | 'priority.high' | 'priority.urgent'> = {
  low: 'priority.low',
  normal: 'priority.normal',
  high: 'priority.high',
  urgent: 'priority.urgent',
}

export function priorityOptions(t: (key: typeof PRIORITY_KEYS[JobPriority]) => string) {
  return (['low', 'normal', 'high', 'urgent'] as const).map((value) => ({
    value,
    label: t(PRIORITY_KEYS[value]),
  }))
}

export function ScheduleFields({
  shiftId,
  date,
  time,
  workShifts,
  onShiftChange,
  onDateChange,
  onTimeChange,
}: Props) {
  const locale = useLocaleStore((s) => s.locale)
  const t = useLocaleStore((s) => s.t)
  const dates = boardDateOptions(locale)
  const grouped = SECTOR_ORDER.map((sector) => ({
    sector,
    shifts: workShifts.filter((s) => s.sector === sector),
  })).filter((g) => g.shifts.length > 0)

  return (
    <>
      <label className="field field--full">
        <span>{t('job.workShift')}</span>
        <select value={shiftId} onChange={(e) => onShiftChange(e.target.value)}>
          {grouped.map(({ sector, shifts }) => (
            <optgroup key={sector} label={t(SECTOR_LABEL_KEYS[sector])}>
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.window}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <label className="field">
        <span>{t('job.date')}</span>
        <select value={date} onChange={(e) => onDateChange(e.target.value)}>
          {dates.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>{t('job.startTime')}</span>
        <input type="time" step={900} value={time} onChange={(e) => onTimeChange(e.target.value)} />
      </label>
    </>
  )
}
