import { useEffect } from 'react';
import { StatusBar } from './components/StatusBar';
import { UnassignedJobs } from './components/UnassignedJobs';
import { ConflictModal } from './components/ConflictModal';
import { EditAssignmentModal } from './components/EditAssignmentModal';
import { AddJobModal } from './components/AddJobModal';
import { EditJobModal } from './components/EditJobModal';
import { TimelineView } from './components/Timeline/TimelineView';
import { useScheduleStore } from './store/scheduleStore';
import { useLocaleStore } from './store/localeStore';

export default function App() {
  const ready = useScheduleStore((s) => s.ready);
  const init = useScheduleStore((s) => s.init);
  const editingJobId = useScheduleStore((s) => s.editingJobId);
  const editingAssignmentId = useScheduleStore((s) => s.editingAssignmentId);
  const locale = useLocaleStore((s) => s.locale);
  const t = useLocaleStore((s) => s.t);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'pt-BR';
  }, [locale]);

  if (!ready) {
    return (
      <div className="boot-screen">
        <div className="boot-screen__pulse" />
        <p>{t('app.loading')}</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <StatusBar />
      <div className="app-body">
        <UnassignedJobs />
        <main className="app-main">
          <TimelineView />
        </main>
      </div>
      <ConflictModal />
      {editingAssignmentId && <EditAssignmentModal key={editingAssignmentId} />}
      <AddJobModal />
      {editingJobId && <EditJobModal />}
    </div>
  );
}
