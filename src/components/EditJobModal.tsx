import { useState } from 'react'
import { ScheduleFields, priorityOptions } from './ScheduleFields'
import { useScheduleStore } from '../store/scheduleStore'
import { useLocaleStore } from '../store/localeStore'
import { useViewportStore } from '../store/viewportStore'
import { dateAndTimeToMinute, defaultScheduleSlot } from '../utils/date'
import type { JobPriority } from '../types'

export function EditJobModal() {
  const editingJobId = useScheduleStore((s) => s.editingJobId)
  const job = useScheduleStore((s) => (s.editingJobId ? s.allJobs[s.editingJobId] : undefined))
  const workShifts = useScheduleStore((s) => s.workShifts)
  const focusedDay = useViewportStore((s) => s.focusedDay)
  const closeJobEditor = useScheduleStore((s) => s.closeJobEditor)
  const updateJob = useScheduleStore((s) => s.updateJob)
  const assignJob = useScheduleStore((s) => s.assignJob)
  const deleteJob = useScheduleStore((s) => s.deleteJob)
  const t = useLocaleStore((s) => s.t)

  const defaultSlot = defaultScheduleSlot(focusedDay)
  const [assignNow, setAssignNow] = useState(false)
  const [schedule, setSchedule] = useState({
    shiftId: workShifts[0]?.id ?? '',
    date: defaultSlot.date,
    time: defaultSlot.time,
  })

  const [form, setForm] = useState(() =>
    job
      ? {
          title: job.title,
          client: job.client,
          location: job.location,
          priority: job.priority,
          durationMinutes: job.durationMinutes,
        }
      : null,
  )

  if (!editingJobId || !job || !form) return null

  const priorities = priorityOptions(t)

  function handleChange<K extends keyof NonNullable<typeof form>>(key: K, value: NonNullable<typeof form>[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f))
  }

  async function handleSave() {
    if (!form || !form.title.trim()) return
    await updateJob(job!.id, {
      title: form.title.trim(),
      client: form.client.trim() || t('job.noClient'),
      location: form.location.trim() || t('job.noLocation'),
      priority: form.priority,
      durationMinutes: form.durationMinutes,
    })

    if (assignNow && schedule.shiftId) {
      const start = dateAndTimeToMinute(schedule.date, schedule.time)
      await assignJob(job!.id, schedule.shiftId, start, start + form.durationMinutes)
    }

    closeJobEditor()
  }

  async function handleDelete() {
    await deleteJob(job!.id)
    closeJobEditor()
  }

  return (
    <div className="conflict-overlay" onClick={closeJobEditor}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal__header">
          <span className="edit-modal__badge">{t('job.edit')}</span>
          <button type="button" className="edit-modal__close" onClick={closeJobEditor} aria-label={t('job.close')}>
            ×
          </button>
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

          <label className="field field--full assign-toggle">
            <input type="checkbox" checked={assignNow} onChange={(e) => setAssignNow(e.target.checked)} />
            <span>{t('job.assignNow')}</span>
          </label>

          {assignNow && (
            <ScheduleFields
              shiftId={schedule.shiftId}
              date={schedule.date}
              time={schedule.time}
              workShifts={workShifts}
              onShiftChange={(id) => setSchedule((s) => ({ ...s, shiftId: id }))}
              onDateChange={(date) => setSchedule((s) => ({ ...s, date }))}
              onTimeChange={(time) => setSchedule((s) => ({ ...s, time }))}
            />
          )}
        </div>

        <div className="edit-modal__footer">
          <div className="edit-modal__danger">
            <button type="button" className="ghost-btn ghost-btn--danger" onClick={handleDelete}>
              {t('job.delete')}
            </button>
          </div>
          <div className="edit-modal__actions">
            <button type="button" className="ghost-btn" onClick={closeJobEditor}>
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
