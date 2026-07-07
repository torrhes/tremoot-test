import { useState } from 'react'
import { ScheduleFields, priorityOptions } from './ScheduleFields'
import { useScheduleStore } from '../store/scheduleStore'
import { useLocaleStore } from '../store/localeStore'
import {
  dateAndTimeToMinute,
  minuteToDateInput,
  minuteToTimeInput,
} from '../utils/date'
import { assignmentSyncState, syncBadge, syncHelp } from '../utils/syncLabels'
import type { JobPriority } from '../types'

export function EditAssignmentModal() {
  const editingAssignmentId = useScheduleStore((s) => s.editingAssignmentId)
  const assignment = useScheduleStore((s) =>
    s.editingAssignmentId ? s.assignments[s.editingAssignmentId] : undefined,
  )
  const job = useScheduleStore((s) => (assignment ? s.allJobs[assignment.jobId] : undefined))
  const workShifts = useScheduleStore((s) => s.workShifts)
  const isSyncing = useScheduleStore((s) => s.isSyncing)
  const closeAssignmentEditor = useScheduleStore((s) => s.closeAssignmentEditor)
  const updateJob = useScheduleStore((s) => s.updateJob)
  const moveAssignment = useScheduleStore((s) => s.moveAssignment)
  const unassign = useScheduleStore((s) => s.unassign)
  const deleteJob = useScheduleStore((s) => s.deleteJob)
  const locale = useLocaleStore((s) => s.locale)
  const t = useLocaleStore((s) => s.t)

  const [form, setForm] = useState(() =>
    job && assignment
      ? {
          title: job.title,
          client: job.client,
          location: job.location,
          priority: job.priority,
          durationMinutes: assignment.endMinute - assignment.startMinute,
          shiftId: assignment.resourceId,
          date: minuteToDateInput(assignment.startMinute),
          time: minuteToTimeInput(assignment.startMinute),
        }
      : null,
  )

  if (!editingAssignmentId || !assignment || !job || !form) return null

  const syncState = assignmentSyncState(assignment, isSyncing)
  const priorities = priorityOptions(t)

  function handleChange<K extends keyof NonNullable<typeof form>>(key: K, value: NonNullable<typeof form>[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f))
  }

  async function handleSave() {
    if (!form) return
    await updateJob(job!.id, {
      title: form.title,
      client: form.client,
      location: form.location,
      priority: form.priority,
      durationMinutes: form.durationMinutes,
    })
    const startMinute = dateAndTimeToMinute(form.date, form.time)
    await moveAssignment(assignment!.id, form.shiftId, startMinute, startMinute + form.durationMinutes)
    closeAssignmentEditor()
  }

  async function handleUnassign() {
    await unassign(assignment!.id)
    closeAssignmentEditor()
  }

  async function handleDelete() {
    await deleteJob(job!.id)
    closeAssignmentEditor()
  }

  return (
    <div className="conflict-overlay" onClick={closeAssignmentEditor}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal__header">
          <span className="edit-modal__badge">{t('job.editOnBoard')}</span>
          <button
            type="button"
            className="edit-modal__close"
            onClick={closeAssignmentEditor}
            aria-label={t('job.close')}
          >
            ×
          </button>
        </div>

        <div className={`sync-banner sync-banner--${syncState}`}>
          <span className="sync-banner__label">{syncBadge(locale, syncState)}</span>
          <span className="sync-banner__help">{syncHelp(locale, syncState)}</span>
        </div>

        <div className="edit-modal__grid">
          <label className="field field--full">
            <span>{t('job.title')}</span>
            <input value={form.title} onChange={(e) => handleChange('title', e.target.value)} />
          </label>

          <label className="field">
            <span>{t('job.client')}</span>
            <input value={form.client} onChange={(e) => handleChange('client', e.target.value)} />
          </label>

          <label className="field">
            <span>{t('job.location')}</span>
            <input value={form.location} onChange={(e) => handleChange('location', e.target.value)} />
          </label>

          <label className="field">
            <span>{t('job.priority')}</span>
            <select
              value={form.priority}
              onChange={(e) => handleChange('priority', e.target.value as JobPriority)}
            >
              {priorities.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t('job.duration')}</span>
            <input
              type="number"
              min={15}
              step={15}
              value={form.durationMinutes}
              onChange={(e) => handleChange('durationMinutes', Number(e.target.value) || 15)}
            />
          </label>

          <ScheduleFields
            shiftId={form.shiftId}
            date={form.date}
            time={form.time}
            workShifts={workShifts}
            onShiftChange={(id) => handleChange('shiftId', id)}
            onDateChange={(date) => handleChange('date', date)}
            onTimeChange={(time) => handleChange('time', time)}
          />
        </div>

        <p className="edit-modal__sync-note">{t('sync.editNote')}</p>

        <div className="edit-modal__footer">
          <div className="edit-modal__danger">
            <button type="button" className="ghost-btn" onClick={handleUnassign}>
              {t('job.removeFromBoard')}
            </button>
            <button type="button" className="ghost-btn ghost-btn--danger" onClick={handleDelete}>
              {t('job.delete')}
            </button>
          </div>
          <div className="edit-modal__actions">
            <button type="button" className="ghost-btn" onClick={closeAssignmentEditor}>
              {t('job.cancel')}
            </button>
            <button type="button" className="primary-btn" onClick={handleSave}>
              {t('job.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
