import { useState } from 'react'
import { ScheduleFields, priorityOptions } from './ScheduleFields'
import { useScheduleStore } from '../store/scheduleStore'
import { useLocaleStore } from '../store/localeStore'
import { useViewportStore } from '../store/viewportStore'
import { dateAndTimeToMinute, defaultScheduleSlot } from '../utils/date'
import type { JobPriority } from '../types'

const EMPTY_FORM = {
  title: '',
  client: '',
  location: '',
  priority: 'normal' as JobPriority,
  durationMinutes: 60,
}

type AddMode = 'queue' | 'schedule'

export function AddJobModal() {
  const isAddingJob = useScheduleStore((s) => s.isAddingJob)
  const workShifts = useScheduleStore((s) => s.workShifts)
  const focusedDay = useViewportStore((s) => s.focusedDay)
  const closeAddJob = useScheduleStore((s) => s.closeAddJob)
  const addJob = useScheduleStore((s) => s.addJob)
  const assignJob = useScheduleStore((s) => s.assignJob)
  const t = useLocaleStore((s) => s.t)

  const defaultSlot = defaultScheduleSlot(focusedDay)
  const [mode, setMode] = useState<AddMode>('queue')
  const [form, setForm] = useState(EMPTY_FORM)
  const [schedule, setSchedule] = useState({
    shiftId: workShifts[0]?.id ?? '',
    date: defaultSlot.date,
    time: defaultSlot.time,
  })

  if (!isAddingJob) return null

  const priorities = priorityOptions(t)

  function handleChange<K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleClose() {
    setForm(EMPTY_FORM)
    setMode('queue')
    const slot = defaultScheduleSlot(focusedDay)
    setSchedule({ shiftId: workShifts[0]?.id ?? '', date: slot.date, time: slot.time })
    closeAddJob()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return

    const job = await addJob({
      title: form.title.trim(),
      client: form.client.trim() || t('job.noClient'),
      location: form.location.trim() || t('job.noLocation'),
      priority: form.priority,
      durationMinutes: form.durationMinutes,
    })

    if (mode === 'schedule' && schedule.shiftId) {
      const start = dateAndTimeToMinute(schedule.date, schedule.time)
      await assignJob(job.id, schedule.shiftId, start, start + form.durationMinutes)
    }

    handleClose()
  }

  return (
    <div className="conflict-overlay" onClick={handleClose}>
      <form className="edit-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="edit-modal__header">
          <span className="edit-modal__badge edit-modal__badge--accent">{t('job.new')}</span>
          <button type="button" className="edit-modal__close" onClick={handleClose} aria-label={t('job.close')}>
            ×
          </button>
        </div>

        <div className="mode-toggle" role="radiogroup">
          <button
            type="button"
            className={`mode-toggle__btn ${mode === 'queue' ? 'mode-toggle__btn--active' : ''}`}
            onClick={() => setMode('queue')}
          >
            {t('job.mode.queue')}
          </button>
          <button
            type="button"
            className={`mode-toggle__btn ${mode === 'schedule' ? 'mode-toggle__btn--active' : ''}`}
            onClick={() => setMode('schedule')}
          >
            {t('job.mode.schedule')}
          </button>
        </div>

        <div className="edit-modal__grid">
          <label className="field field--full">
            <span>{t('job.title')}</span>
            <input
              autoFocus
              required
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder={t('job.titlePlaceholder')}
            />
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

          {mode === 'schedule' && (
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
          <div />
          <div className="edit-modal__actions">
            <button type="button" className="ghost-btn" onClick={handleClose}>
              {t('job.cancel')}
            </button>
            <button type="submit" className="primary-btn">
              {mode === 'schedule' ? t('job.addToBoard') : t('job.addToQueue')}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
