import { useMemo, useState } from 'react'
import type { WorkShift } from '../../types'
import { useTimelineView } from '../../hooks/useTimelineView'
import { selectUnassignedJobs, useScheduleStore } from '../../store/scheduleStore'
import { useViewportStore } from '../../store/viewportStore'
import { getViewEndMinute, snapToGrid, xToMinute } from '../../utils/date'
import { AssignmentCard } from './AssignmentCard'

interface Props {
  shift: WorkShift
}

export function ShiftLane({ shift }: Props) {
  const assignments = useScheduleStore((s) => s.assignments)
  const allJobs = useScheduleStore((s) => s.allJobs)
  const unassignedJobs = useScheduleStore(selectUnassignedJobs)
  const assignJob = useScheduleStore((s) => s.assignJob)
  const moveAssignment = useScheduleStore((s) => s.moveAssignment)
  const visibleStart = useViewportStore((s) => s.visibleStart)
  const visibleEnd = useViewportStore((s) => s.visibleEnd)
  const focusedDay = useViewportStore((s) => s.focusedDay)
  const { viewStartMinute } = useTimelineView()
  const [isDragOver, setIsDragOver] = useState(false)

  const viewEndMinute = getViewEndMinute(focusedDay)

  const visibleAssignments = useMemo(() => {
    return Object.values(assignments).filter(
      (a) =>
        a.resourceId === shift.id &&
        a.endMinute >= visibleStart &&
        a.startMinute <= visibleEnd &&
        a.endMinute > viewStartMinute &&
        a.startMinute < viewEndMinute,
    )
  }, [assignments, shift.id, visibleStart, visibleEnd, viewStartMinute, viewEndMinute])

  function absoluteMinuteFromDrop(dropX: number): number {
    const relative = snapToGrid(Math.max(0, xToMinute(dropX)))
    return viewStartMinute + relative
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragOver(false)
    const raw = e.dataTransfer.getData('application/json')
    if (!raw) return
    const rect = e.currentTarget.getBoundingClientRect()
    const dropX = e.clientX - rect.left
    let payload: any
    try {
      payload = JSON.parse(raw)
    } catch {
      return
    }

    if (payload.kind === 'job') {
      const job = unassignedJobs.find((j) => j.id === payload.jobId)
      if (!job) return
      const start = absoluteMinuteFromDrop(dropX)
      assignJob(job.id, shift.id, start, start + job.durationMinutes)
    } else if (payload.kind === 'assignment') {
      const grabOffset = payload.grabOffsetMinutes ?? 0
      const start = snapToGrid(Math.max(viewStartMinute, viewStartMinute + xToMinute(dropX) - grabOffset))
      const current = useScheduleStore.getState().assignments[payload.assignmentId]
      if (!current) return
      const duration = current.endMinute - current.startMinute
      moveAssignment(payload.assignmentId, shift.id, start, start + duration)
    }
  }

  return (
    <div
      className={`shift-lane ${isDragOver ? 'shift-lane--over' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      {visibleAssignments.map((a) => (
        <AssignmentCard key={a.id} assignment={a} job={allJobs[a.jobId]} shift={shift} />
      ))}
    </div>
  )
}
