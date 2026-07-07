import type { WorkShift } from '../../types'
import { useLocaleStore } from '../../store/localeStore'
import { SECTOR_LABEL_KEYS } from '../../utils/sectors'

interface Props {
  shift: WorkShift
}

export function ShiftRail({ shift }: Props) {
  const t = useLocaleStore((s) => s.t)

  return (
    <div className="shift-rail">
      <span className="shift-rail__tag" style={{ background: shift.color }}>
        {shift.tag}
      </span>
      <div className="shift-rail__info">
        <div className="shift-rail__name">{shift.name}</div>
        <div className="shift-rail__meta">
          {t(SECTOR_LABEL_KEYS[shift.sector])} · {shift.window}
        </div>
      </div>
    </div>
  )
}
