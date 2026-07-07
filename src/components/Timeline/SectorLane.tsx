import type { ShiftSector } from '../../types'
import { SECTOR_ACCENT } from '../../utils/sectors'

interface Props {
  sector: ShiftSector
}

export function SectorLane({ sector }: Props) {
  return <div className="sector-lane" style={{ borderTopColor: SECTOR_ACCENT[sector] }} />
}
