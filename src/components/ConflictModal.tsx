import { useScheduleStore } from '../store/scheduleStore'
import { useLocaleStore } from '../store/localeStore'
import { formatDayLabel, formatHour } from '../utils/date'
import { findWorkShift } from '../utils/sectors'

export function ConflictModal() {
  const conflicts = useScheduleStore((s) => s.conflicts)
  const allJobs = useScheduleStore((s) => s.allJobs)
  const workShifts = useScheduleStore((s) => s.workShifts)
  const resolveConflict = useScheduleStore((s) => s.resolveConflict)
  const locale = useLocaleStore((s) => s.locale)
  const t = useLocaleStore((s) => s.t)

  if (conflicts.length === 0) return null
  const conflict = conflicts[0]
  const job = allJobs[conflict.local.jobId]
  const localShift = findWorkShift(workShifts, conflict.local.resourceId)
  const remoteShift = findWorkShift(workShifts, conflict.remote.resourceId)

  return (
    <div className="conflict-overlay">
      <div className="conflict-modal">
        <div className="conflict-modal__header">
          <span className="conflict-modal__badge">{t('conflict.title')}</span>
          <h2>{job?.title ?? t('job.edit')}</h2>
          <p>{t('conflict.description')}</p>
        </div>

        <div className="conflict-modal__options">
          <button
            type="button"
            className="conflict-option"
            onClick={() => resolveConflict(conflict.id, 'keep-local')}
          >
            <span className="conflict-option__label">{t('conflict.keepLocal')}</span>
            <span className="conflict-option__detail">
              {localShift?.name ?? '—'} · {formatDayLabel(conflict.local.startMinute, locale)}{' '}
              {formatHour(conflict.local.startMinute, locale)}–{formatHour(conflict.local.endMinute, locale)}
            </span>
            <span className="conflict-option__source">
              {t('conflict.editedBy', { name: conflict.local.updatedBy })}
            </span>
          </button>

          <button
            type="button"
            className="conflict-option"
            onClick={() => resolveConflict(conflict.id, 'keep-remote')}
          >
            <span className="conflict-option__label">{t('conflict.keepRemote')}</span>
            <span className="conflict-option__detail">
              {remoteShift?.name ?? '—'} · {formatDayLabel(conflict.remote.startMinute, locale)}{' '}
              {formatHour(conflict.remote.startMinute, locale)}–{formatHour(conflict.remote.endMinute, locale)}
            </span>
            <span className="conflict-option__source">
              {t('conflict.editedBy', { name: conflict.remote.updatedBy })}
            </span>
          </button>
        </div>

        {conflicts.length > 1 && (
          <p className="conflict-modal__queue">{t('conflict.queue', { count: conflicts.length - 1 })}</p>
        )}
      </div>
    </div>
  )
}
