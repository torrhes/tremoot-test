import type { ShiftSector } from '../../types'
import { useLocaleStore } from '../../store/localeStore'
import { SECTOR_ACCENT, SECTOR_HINT_KEYS, SECTOR_LABEL_KEYS } from '../../utils/sectors'
import { pluralKey } from '../../i18n/translations'

interface Props {
  sector: ShiftSector
  count: number
}

export function SectorRail({ sector, count }: Props) {
  const locale = useLocaleStore((s) => s.locale)
  const t = useLocaleStore((s) => s.t)

  return (
    <div className="sector-rail" style={{ borderLeftColor: SECTOR_ACCENT[sector] }}>
      <span className="sector-rail__dot" style={{ background: SECTOR_ACCENT[sector] }} />
      <div className="sector-rail__text">
        <span className="sector-rail__title">{t(SECTOR_LABEL_KEYS[sector])}</span>
        <span className="sector-rail__meta">
          {t(pluralKey('sector.shiftCount', count, locale), { count })} · {t(SECTOR_HINT_KEYS[sector])}
        </span>
      </div>
    </div>
  )
}
