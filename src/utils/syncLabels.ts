import type { Assignment, SyncState } from '../types'
import type { TranslationKey } from '../i18n/translations'
import type { Locale } from '../i18n/types'
import { translate } from '../i18n/translations'

const BADGE_KEYS: Record<SyncState, TranslationKey> = {
  synced: 'sync.badge.synced',
  pending: 'sync.badge.pending',
  syncing: 'sync.badge.syncing',
  conflict: 'sync.badge.conflict',
  error: 'sync.badge.error',
}

const HELP_KEYS: Record<SyncState, TranslationKey> = {
  synced: 'sync.help.synced',
  pending: 'sync.help.pending',
  syncing: 'sync.help.syncing',
  conflict: 'sync.help.conflict',
  error: 'sync.help.error',
}

export function syncBadge(locale: Locale, state: SyncState): string {
  return translate(locale, BADGE_KEYS[state])
}

export function syncHelp(locale: Locale, state: SyncState): string {
  return translate(locale, HELP_KEYS[state])
}

export function assignmentSyncState(assignment: Assignment, isSyncing: boolean): SyncState {
  if (assignment.syncState === 'pending' && isSyncing) return 'syncing'
  return assignment.syncState
}
