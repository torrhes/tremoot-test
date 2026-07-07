import { useRef } from 'react'
import { selectUnassignedJobs, useScheduleStore } from '../store/scheduleStore'
import { useLocaleStore } from '../store/localeStore'
import { useViewportStore } from '../store/viewportStore'
import type { Job } from '../types'

function handleDragStart(e: React.DragEvent<HTMLDivElement>, job: Job, draggedRef: React.MutableRefObject<boolean>) {
  draggedRef.current = true
  e.dataTransfer.setData('application/json', JSON.stringify({ kind: 'job', jobId: job.id }))
  e.dataTransfer.effectAllowed = 'copy'
}

function JobTicket({ job }: { job: Job }) {
  const openJobEditor = useScheduleStore((s) => s.openJobEditor)
  const t = useLocaleStore((s) => s.t)
  const draggedRef = useRef(false)

  function handleDragEnd() {
    setTimeout(() => {
      draggedRef.current = false
    }, 0)
  }

  function handleClick() {
    if (draggedRef.current) return
    openJobEditor(job.id)
  }

  return (
    <div
      className="job-ticket"
      draggable
      onDragStart={(e) => handleDragStart(e, job, draggedRef)}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      title={t('tray.ticketTitle')}
    >
      <span className={`priority-dot priority-dot--${job.priority}`} />
      <div className="job-ticket__text">
        <div className="job-ticket__title">{job.title}</div>
        <div className="job-ticket__meta">
          {job.client} · {job.location} · {t('tray.minutes', { count: job.durationMinutes })}
        </div>
      </div>
    </div>
  )
}

export function UnassignedJobs() {
  const jobs = useScheduleStore(selectUnassignedJobs)
  const openAddJob = useScheduleStore((s) => s.openAddJob)
  const collapsed = useViewportStore((s) => s.jobTrayCollapsed)
  const toggleJobTray = useViewportStore((s) => s.toggleJobTray)
  const t = useLocaleStore((s) => s.t)

  return (
    <aside className={`job-tray ${collapsed ? 'job-tray--collapsed' : ''}`}>
      <div className="job-tray__header">
        <button
          type="button"
          className="job-tray__toggle"
          onClick={toggleJobTray}
          title={collapsed ? t('tray.expand') : t('tray.collapse')}
          aria-label={collapsed ? t('tray.expand') : t('tray.collapse')}
          aria-expanded={!collapsed}
        >
          {collapsed ? '›' : '‹'}
        </button>
        {!collapsed && <h2>{t('tray.title')}</h2>}
        <div className="job-tray__header-actions">
          {!collapsed && <span className="job-tray__count">{jobs.length}</span>}
          <button
            type="button"
            className="job-tray__add"
            onClick={openAddJob}
            title={t('tray.add')}
            aria-label={t('tray.add')}
          >
            +
          </button>
        </div>
      </div>
      {collapsed ? (
        <div className="job-tray__collapsed-meta">
          <span className="job-tray__count job-tray__count--vertical">{jobs.length}</span>
          <span className="job-tray__collapsed-label">{t('tray.queue')}</span>
        </div>
      ) : (
        <>
          <p className="job-tray__hint">{t('tray.hint')}</p>
          <div className="job-tray__list">
            {jobs.length === 0 && <div className="job-tray__empty">{t('tray.empty')}</div>}
            {jobs.map((job) => (
              <JobTicket key={job.id} job={job} />
            ))}
          </div>
        </>
      )}
    </aside>
  )
}
