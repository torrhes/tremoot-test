import { useRef, useState } from 'react'
import type { Assignment, Job, WorkShift } from '../../types'
import { useTimelineView } from '../../hooks/useTimelineView'
import { useLocaleStore } from '../../store/localeStore'
import { assignmentCardWidth, getCardDensity } from '../../utils/cardLayout'
import { formatDayLabel, formatHour, snapToGrid, xToMinute } from '../../utils/date'
import { assignmentSyncState, syncBadge } from '../../utils/syncLabels'
import { useScheduleStore } from '../../store/scheduleStore'

interface Props {
  assignment: Assignment
  job: Job | undefined
  shift: WorkShift
}

export function AssignmentCard({ assignment, job, shift }: Props) {
  const moveAssignment = useScheduleStore((s) => s.moveAssignment)
  const unassign = useScheduleStore((s) => s.unassign)
  const openAssignmentEditor = useScheduleStore((s) => s.openAssignmentEditor)
  const isSyncing = useScheduleStore((s) => s.isSyncing)
  const locale = useLocaleStore((s) => s.locale)
  const t = useLocaleStore((s) => s.t)
  const { toViewX } = useTimelineView()
  const [resizePreviewEnd, setResizePreviewEnd] = useState<number | null>(null)
  const dragStateRef = useRef<{ startX: number; originalEnd: number } | null>(null)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const draggedRef = useRef(false)

  const end = resizePreviewEnd ?? assignment.endMinute
  const left = toViewX(assignment.startMinute)
  const width = assignmentCardWidth(assignment.startMinute, end)
  const density = getCardDensity(width)
  const syncState = assignmentSyncState(assignment, isSyncing)
  const badge = syncBadge(locale, syncState)
  const timeRange = `${formatHour(assignment.startMinute, locale)}–${formatHour(end, locale)}`

  function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    draggedRef.current = true
    const rect = e.currentTarget.getBoundingClientRect()
    const grabOffsetMinutes = xToMinute(e.clientX - rect.left)
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ kind: 'assignment', assignmentId: assignment.id, grabOffsetMinutes }),
    )
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragEnd() {
    setTimeout(() => {
      draggedRef.current = false
    }, 100)
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if ((e.target as Element).closest('.assignment-card__resize-handle, .assignment-card__remove')) return
    pointerStartRef.current = { x: e.clientX, y: e.clientY }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (draggedRef.current || !pointerStartRef.current) return
    if ((e.target as Element).closest('.assignment-card__resize-handle, .assignment-card__remove')) return

    const dx = Math.abs(e.clientX - pointerStartRef.current.x)
    const dy = Math.abs(e.clientY - pointerStartRef.current.y)
    pointerStartRef.current = null

    if (dx < 6 && dy < 6) {
      e.stopPropagation()
      openAssignmentEditor(assignment.id)
    }
  }

  function handleResizeStart(e: React.PointerEvent<HTMLDivElement>) {
    e.stopPropagation()
    e.preventDefault()
    ;(e.target as Element).setPointerCapture(e.pointerId)
    dragStateRef.current = { startX: e.clientX, originalEnd: assignment.endMinute }

    function onMove(ev: PointerEvent) {
      if (!dragStateRef.current) return
      const deltaMinutes = xToMinute(ev.clientX - dragStateRef.current.startX)
      const minEnd = assignment.startMinute + 15
      const next = Math.max(snapToGrid(dragStateRef.current.originalEnd + deltaMinutes), minEnd)
      setResizePreviewEnd(next)
    }
    function onUp(ev: PointerEvent) {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      if (!dragStateRef.current) return
      const deltaMinutes = xToMinute(ev.clientX - dragStateRef.current.startX)
      const minEnd = assignment.startMinute + 15
      const next = Math.max(snapToGrid(dragStateRef.current.originalEnd + deltaMinutes), minEnd)
      dragStateRef.current = null
      setResizePreviewEnd(null)
      if (next !== assignment.endMinute) {
        moveAssignment(assignment.id, assignment.resourceId, assignment.startMinute, next)
      }
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  if (!job) return null

  return (
    <div
      className={`assignment-card assignment-card--${density} assignment-card--${syncState}`}
      style={{
        left,
        width,
        borderLeftColor: shift.color,
      }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      title={`${job.title} · ${job.client}\n${formatDayLabel(assignment.startMinute, locale)} ${timeRange}\n${t('job.cardEdit')} · ${badge}`}
    >
      <div className="assignment-card__body">
        <span className={`priority-dot priority-dot--${job.priority}`} />
        <div className="assignment-card__text">
          {density === 'micro' ? (
            <div className="assignment-card__schematic">
              <span className="assignment-card__micro-title">{job.title}</span>
              <span className="assignment-card__micro-time">{timeRange}</span>
            </div>
          ) : (
            <>
              <div className="assignment-card__title">{job.title}</div>
              <div className="assignment-card__meta">
                {density === 'full'
                  ? `${formatDayLabel(assignment.startMinute, locale)} ${timeRange} · ${job.client}`
                  : timeRange}
              </div>
            </>
          )}
        </div>
        {density === 'full' && (
          <button
            type="button"
            className="assignment-card__remove"
            onClick={(e) => {
              e.stopPropagation()
              unassign(assignment.id)
            }}
            aria-label={t('card.remove')}
            title={t('card.remove')}
          >
            ×
          </button>
        )}
      </div>
      {syncState !== 'synced' && (
        <span
          className={`sync-badge sync-badge--${syncState} ${density !== 'full' ? 'sync-badge--dot-only' : ''}`}
          title={badge}
        >
          {density === 'full' ? badge : ''}
        </span>
      )}
      <div
        className="assignment-card__resize-handle"
        onPointerDown={handleResizeStart}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}
