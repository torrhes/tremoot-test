import { useScheduleStore } from '../store/scheduleStore'
import { useLocaleStore } from '../store/localeStore'
import { useViewportStore } from '../store/viewportStore'
import { boardDateOptions } from '../utils/date'
import { pluralKey } from '../i18n/translations'

export function StatusBar() {
  const connectivity = useScheduleStore((s) => s.connectivity)
  const pendingCount = useScheduleStore((s) => s.pendingCount)
  const isSyncing = useScheduleStore((s) => s.isSyncing)
  const conflictCount = useScheduleStore((s) => s.conflicts.length)
  const setConnectivity = useScheduleStore((s) => s.setConnectivity)
  const focusedDay = useViewportStore((s) => s.focusedDay)
  const setFocusedDay = useViewportStore((s) => s.setFocusedDay)
  const locale = useLocaleStore((s) => s.locale)
  const setLocale = useLocaleStore((s) => s.setLocale)
  const t = useLocaleStore((s) => s.t)

  const dayOptions = boardDateOptions(locale)

  function toggleSimulatedOffline() {
    const next = connectivity === 'online' ? 'offline' : 'online'
    Object.defineProperty(navigator, 'onLine', { value: next === 'online', configurable: true })
    setConnectivity(next)
    if (next === 'online') {
      window.dispatchEvent(new Event('online'))
    }
  }

  const allSynced = connectivity === 'online' && pendingCount === 0 && conflictCount === 0 && !isSyncing

  return (
    <header className="status-bar">
      <div className="status-bar__brand">
        <span className="status-bar__mark" />
        <span>{t('app.title')}</span>
      </div>

      <div className="status-bar__center" title={t('sync.legendTitle')}>
        <span className="status-bar__sync-hint">{t('sync.hint')}</span>
        <div className="sync-legend">
          <span className="sync-legend__item">
            <span className="sync-legend__dot sync-legend__dot--synced" />
            {t('sync.synced')}
          </span>
          <span className="sync-legend__item">
            <span className="sync-legend__dot sync-legend__dot--pending" />
            {t('sync.savedLocally')}
          </span>
          <span className="sync-legend__item">
            <span className="sync-legend__dot sync-legend__dot--conflict" />
            {t('sync.conflict')}
          </span>
        </div>
      </div>

      <div className="status-bar__right">
        <label className="day-picker">
          <span className="day-picker__label">{t('view.dayLabel')}</span>
          <select
            className="day-picker__select"
            value={focusedDay ?? 'all'}
            onChange={(e) => {
              const value = e.target.value
              setFocusedDay(value === 'all' ? null : Number(value))
            }}
          >
            <option value="all">{t('view.allDays')}</option>
            {dayOptions.map((d) => (
              <option key={d.dayIndex} value={d.dayIndex}>
                {d.label}
              </option>
            ))}
          </select>
        </label>

        <div className="locale-toggle" role="group" aria-label="Language">
          <button
            type="button"
            className={`locale-toggle__btn ${locale === 'pt' ? 'locale-toggle__btn--active' : ''}`}
            onClick={() => setLocale('pt')}
          >
            {t('locale.pt')}
          </button>
          <button
            type="button"
            className={`locale-toggle__btn ${locale === 'en' ? 'locale-toggle__btn--active' : ''}`}
            onClick={() => setLocale('en')}
          >
            {t('locale.en')}
          </button>
        </div>

        {conflictCount > 0 && (
          <span className="status-pill status-pill--conflict">
            {t(pluralKey('sync.conflictCount', conflictCount, locale), { count: conflictCount })}
          </span>
        )}

        {isSyncing && (
          <span className="status-pill status-pill--pending">
            <span className="status-pill__spinner" />
            {t('sync.sending')}
          </span>
        )}

        {!isSyncing && pendingCount > 0 && (
          <span
            className="status-pill status-pill--pending"
            title={connectivity === 'offline' ? t('sync.offlinePendingTitle') : t('sync.pendingTitle')}
          >
            <span className="status-pill__spinner" />
            {t(pluralKey('sync.savedCount', pendingCount, locale), { count: pendingCount })}
          </span>
        )}

        {allSynced && <span className="status-pill status-pill--synced">{t('sync.allSynced')}</span>}

        {connectivity === 'offline' && pendingCount === 0 && conflictCount === 0 && (
          <span className="status-pill status-pill--offline">{t('sync.offlineMode')}</span>
        )}

        <button
          type="button"
          className={`connectivity-toggle connectivity-toggle--${connectivity}`}
          onClick={toggleSimulatedOffline}
          title={t('sync.toggleTitle')}
        >
          <span className="connectivity-toggle__dot" />
          {connectivity === 'online' ? t('sync.online') : t('sync.offline')}
        </button>
      </div>
    </header>
  )
}
