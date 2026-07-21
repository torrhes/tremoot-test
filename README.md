# Dispatch Board

A React + TypeScript resource scheduling application for managing vehicles, crews, and technicians, featuring drag-and-drop scheduling, a virtualized Gantt-style timeline, and an offline-first architecture with optimistic updates and sync conflict resolution.

## Running the Project

```bash
npm install
npm run dev
```

Open the URL displayed by Vite (usually `http://localhost:5173`).

```bash
npm run build      # Production build (tsc + vite build)
npm run typecheck  # Type checking only
```

---

## Requirements Mapping

### 1. Drag-and-Drop Scheduling

- `src/components/UnassignedJobs.tsx` — each job in the queue is draggable and stores `{ kind: 'job', jobId }` in `dataTransfer`.
- `src/components/Timeline/ResourceRow.tsx` — each resource row acts as a drop target. On drop, the exact minute under the cursor is calculated using the row's `getBoundingClientRect()`, without manually handling `scrollLeft`.
- `src/components/Timeline/AssignmentCard.tsx` — assigned jobs can be dragged between resources and time slots. Cards are also resizable from the right edge using Pointer Events to adjust job duration.
- All movements are snapped to a 15-minute grid using `snapToGrid`.

### 2. Virtualized Timeline / Gantt View

- `src/components/Timeline/TimelineView.tsx` uses `react-window` (`FixedSizeList`) to virtualize resource rows vertically. Even with hundreds of resources, only visible rows (plus react-window overscan) exist in the DOM.
- Horizontal virtualization is implemented manually in `ResourceRow.tsx`. The board supports a 14-day planning horizon, but each row only renders assignments that intersect the currently visible time window stored in `src/store/viewportStore.ts`, calculated from the container's actual `scrollLeft`.
- This follows the same principle used by large-scale Gantt libraries: never render content outside the viewport, regardless of the total timeline width.
- Resource names remain fixed using `position: sticky`, while the timeline scrolls horizontally. The time header stays synchronized using `transform: translateX(...)`.

### 3. Offline-First Architecture with Optimistic Updates and Conflict Resolution

- `src/db/db.ts` — all application state (resources, jobs, assignments, sync queue, and conflicts) is stored in IndexedDB through Dexie. The UI always reads and writes locally first, without waiting for network responses.
- `src/services/syncEngine.ts` — operations such as `assignJob`, `moveAssignment`, and `unassign` immediately update local data and enqueue a `SyncOp` containing the assignment's base version. The queue is processed in FIFO order whenever connectivity is available, with retries and exponential backoff for failures.
- `src/api/mockServer.ts` simulates a real backend, including network latency, transient failures (~8%), and a background "ghost dispatcher" that periodically edits assignments on the server side, simulating another user working from a different device.
- These concurrent modifications generate genuine optimistic concurrency conflicts through version comparison rather than artificial conflict simulations.
- When the server rejects an update due to a version mismatch, the record appears in `src/components/ConflictModal.tsx`, displaying local and remote versions side by side so the user can decide which version should prevail.
- The **Online/Offline** toggle in the top bar is provided for demonstration purposes. Disable connectivity, perform scheduling actions, and observe immediate local updates marked as pending. Re-enable connectivity to watch the sync queue process and occasionally surface conflicts for resolution.

---

## Project Structure

```text
src/
  api/mockServer.ts        Simulated backend (latency, failures, concurrent edits)
  services/syncEngine.ts   Sync queue, retry/backoff, conflict detection
  db/db.ts                 IndexedDB schema (Dexie)
  store/scheduleStore.ts   Application state (Zustand), UI ↔ DB ↔ Sync bridge
  store/viewportStore.ts   Visible time window (horizontal virtualization)
  components/Timeline/     Resource grid, timeline header, assignment cards
  components/              Job queue, status bar, conflict modal
```

---
