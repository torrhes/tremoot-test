import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { db } from '../db/db';
import {
  buildInitialAssignments,
  buildWorkShifts,
  buildUnassignedJobs,
  isLegacyShiftRow
} from '../data/seed';
import { seedServer, startGhostDispatcher } from '../api/mockServer';
import {
  drainQueue,
  initSyncEngine,
  queueAssignmentDelete,
  queueAssignmentUpsert,
  resolveConflict as resolveConflictOnEngine,
  subscribe as subscribeToEngine
} from '../services/syncEngine';
import type {
  Assignment,
  Conflict,
  ConnectivityState,
  Job,
  WorkShift
} from '../types';

interface ScheduleState {
  ready: boolean;
  workShifts: WorkShift[];
  allJobs: Record<string, Job>;
  assignments: Record<string, Assignment>;
  conflicts: Conflict[];
  connectivity: ConnectivityState;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  editingAssignmentId: string | null;
  editingJobId: string | null;
  isAddingJob: boolean;

  init: () => Promise<void>;
  assignJob: (
    jobId: string,
    shiftId: string,
    startMinute: number,
    endMinute: number
  ) => Promise<void>;
  moveAssignment: (
    assignmentId: string,
    shiftId: string,
    startMinute: number,
    endMinute: number
  ) => Promise<void>;
  unassign: (assignmentId: string) => Promise<void>;
  resolveConflict: (
    conflictId: string,
    resolution: 'keep-local' | 'keep-remote'
  ) => Promise<void>;
  setConnectivity: (state: ConnectivityState) => void;
  addJob: (input: Omit<Job, 'id'>) => Promise<Job>;
  updateJob: (
    jobId: string,
    changes: Partial<Omit<Job, 'id'>>
  ) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  openAssignmentEditor: (assignmentId: string) => void;
  closeAssignmentEditor: () => void;
  openJobEditor: (jobId: string) => void;
  closeJobEditor: () => void;
  openAddJob: () => void;
  closeAddJob: () => void;
}

let initPromise: Promise<void> | null = null;

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  ready: false,
  workShifts: [],
  allJobs: {},
  assignments: {},
  conflicts: [],
  connectivity: navigator.onLine ? 'online' : 'offline',
  pendingCount: 0,
  isSyncing: false,
  lastSyncedAt: null,
  editingAssignmentId: null,
  editingJobId: null,
  isAddingJob: false,

  init: async () => {
    if (get().ready) return;
    if (initPromise) return initPromise;

    initPromise = (async () => {
      let storedShifts = await db.resources.toArray();
      const legacy = storedShifts.some(isLegacyShiftRow);

      if (legacy) {
        await db.resources.clear();
        await db.assignments.clear();
        storedShifts = [];
      }

      let workShifts = storedShifts;
      let jobs: Job[];
      let assignments: Assignment[];

      if (workShifts.length === 0) {
        workShifts = buildWorkShifts();
        const allSeedJobs = buildUnassignedJobs();
        const built = buildInitialAssignments(workShifts, allSeedJobs);
        assignments = built.assignments;
        jobs = allSeedJobs;

        await db.resources.bulkPut(workShifts);
        await db.jobs.bulkPut(jobs);
        await db.assignments.bulkPut(assignments);
        seedServer(assignments);
      } else {
        jobs = await db.jobs.toArray();
        assignments = await db.assignments.toArray();
        seedServer(assignments);
      }

      const conflicts = await db.conflicts.toArray();
      const pendingCount = await db.syncQueue.count();

      set({
        ready: true,
        workShifts,
        allJobs: Object.fromEntries(jobs.map((j) => [j.id, j])),
        assignments: Object.fromEntries(assignments.map((a) => [a.id, a])),
        conflicts,
        pendingCount
      });

      subscribeToEngine((event) => {
        if (event.type === 'assignment-updated') {
          set((s) => ({
            assignments: {
              ...s.assignments,
              [event.assignment.id]: event.assignment
            }
          }));
        }
        if (event.type === 'conflict-detected') {
          set((s) => ({ conflicts: [...s.conflicts, event.conflict] }));
        }
        if (event.type === 'queue-changed') {
          set({ pendingCount: event.size });
        }
        if (event.type === 'sync-cycle-start') {
          set({ isSyncing: true });
        }
        if (event.type === 'sync-cycle-end') {
          set({ isSyncing: false, lastSyncedAt: Date.now() });
        }
      });

      window.addEventListener('online', () => get().setConnectivity('online'));
      window.addEventListener('offline', () =>
        get().setConnectivity('offline')
      );

      initSyncEngine();
      startGhostDispatcher();
    })().catch((error) => {
      initPromise = null;
      throw error;
    });

    return initPromise;
  },

  setConnectivity: (state) => set({ connectivity: state }),

  assignJob: async (jobId, shiftId, startMinute, endMinute) => {
    const job = get().allJobs[jobId];
    if (!job) return;

    const assignment: Assignment = {
      id: uuid(),
      jobId,
      resourceId: shiftId,
      startMinute,
      endMinute,
      version: 0,
      updatedAt: Date.now(),
      updatedBy: 'você',
      syncState: 'pending'
    };

    // Optimistic write: local state (and the UI reading from it) updates
    // immediately, before any network round trip either succeeds or even
    // starts. The card appears on the timeline right away, online or not.
    await db.assignments.put(assignment);
    set((s) => ({
      assignments: { ...s.assignments, [assignment.id]: assignment }
    }));

    await queueAssignmentUpsert(assignment, 0);
    if (get().connectivity === 'online') drainQueue();
  },

  moveAssignment: async (assignmentId, shiftId, startMinute, endMinute) => {
    const current = get().assignments[assignmentId];
    if (!current) return;

    const updated: Assignment = {
      ...current,
      resourceId: shiftId,
      startMinute,
      endMinute,
      updatedAt: Date.now(),
      updatedBy: 'você',
      syncState: 'pending'
    };

    await db.assignments.put(updated);
    set((s) => ({
      assignments: { ...s.assignments, [assignmentId]: updated }
    }));

    await queueAssignmentUpsert(updated, current.version);
    if (get().connectivity === 'online') drainQueue();
  },

  unassign: async (assignmentId) => {
    const current = get().assignments[assignmentId];
    if (!current) return;

    await db.assignments.delete(assignmentId);
    set((s) => {
      const next = { ...s.assignments };
      delete next[assignmentId];
      return { assignments: next };
    });

    await queueAssignmentDelete(assignmentId, current.version);
    if (get().connectivity === 'online') drainQueue();
  },

  resolveConflict: async (conflictId, resolution) => {
    const conflict = get().conflicts.find((c) => c.id === conflictId);
    if (!conflict) return;
    await resolveConflictOnEngine(conflict, resolution);
    set((s) => ({ conflicts: s.conflicts.filter((c) => c.id !== conflictId) }));
  },

  addJob: async (input) => {
    const job: Job = { id: uuid(), ...input };
    await db.jobs.put(job);
    set((s) => ({ allJobs: { ...s.allJobs, [job.id]: job } }));
    return job;
  },

  updateJob: async (jobId, changes) => {
    const current = get().allJobs[jobId];
    if (!current) return;
    const updated: Job = { ...current, ...changes };
    await db.jobs.put(updated);
    set((s) => ({ allJobs: { ...s.allJobs, [jobId]: updated } }));
  },

  deleteJob: async (jobId) => {
    // Jobs are local reference data (not synced), but if the job is
    // currently on the timeline we must also retract that assignment,
    // through the normal sync path, so the server hears about it too.
    const assignment = Object.values(get().assignments).find(
      (a) => a.jobId === jobId
    );
    if (assignment) {
      await get().unassign(assignment.id);
    }
    await db.jobs.delete(jobId);
    set((s) => {
      const next = { ...s.allJobs };
      delete next[jobId];
      return { allJobs: next };
    });
  },

  openAssignmentEditor: (assignmentId) =>
    set({ editingAssignmentId: assignmentId }),
  closeAssignmentEditor: () => set({ editingAssignmentId: null }),
  openJobEditor: (jobId) => set({ editingJobId: jobId }),
  closeJobEditor: () => set({ editingJobId: null }),
  openAddJob: () => set({ isAddingJob: true }),
  closeAddJob: () => set({ isAddingJob: false })
}));

/** Jobs that don't currently back any assignment: the ones in the side tray. */
export function selectUnassignedJobs(state: ScheduleState): Job[] {
  const assignedJobIds = new Set(
    Object.values(state.assignments).map((a) => a.jobId)
  );
  return Object.values(state.allJobs).filter((j) => !assignedJobIds.has(j.id));
}
