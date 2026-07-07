import type { Locale } from './types';

const pt = {
  'app.title': 'Painel de Despacho',
  'app.loading': 'Carregando escala local…',

  'locale.pt': 'PT',
  'locale.en': 'EN',

  'view.allDays': '14 dias',
  'view.singleDay': 'Dia',
  'view.dayLabel': 'Visualizar',

  'sync.hint':
    'Edições salvam na hora no dispositivo · envio ao servidor em segundo plano',
  'sync.legendTitle': 'Como funciona a sincronização',
  'sync.synced': 'Sincronizado',
  'sync.savedLocally': 'Salvo localmente',
  'sync.conflict': 'Conflito',
  'sync.allSynced': 'Sincronizado',
  'sync.sending': 'Enviando ao servidor…',
  'sync.savedCount': '{{count}} salva localmente',
  'sync.savedCountPlural': '{{count}} salvas localmente',
  'sync.conflictCount': '{{count}} conflito',
  'sync.conflictCountPlural': '{{count}} conflitos',
  'sync.offlineMode': 'Modo offline',
  'sync.offlinePendingTitle':
    'Alterações guardadas localmente. Serão enviadas quando voltar online.',
  'sync.pendingTitle': 'Enviando alterações pendentes ao servidor…',
  'sync.toggleTitle':
    'Alternar conectividade simulada para testar o modo offline',
  'sync.online': 'Online',
  'sync.offline': 'Offline',
  'sync.badge.synced': 'Sincronizado',
  'sync.badge.pending': 'Salvo localmente',
  'sync.badge.syncing': 'Enviando…',
  'sync.badge.conflict': 'Conflito',
  'sync.badge.error': 'Falhou',
  'sync.help.synced': 'Esta atribuição está igual no servidor.',
  'sync.help.pending':
    'Salva no seu dispositivo. Será enviada ao servidor quando estiver online.',
  'sync.help.syncing': 'Enviando alteração ao servidor agora…',
  'sync.help.conflict':
    'Outra pessoa alterou o mesmo horário. Resolva o conflito para continuar.',
  'sync.help.error':
    'Não foi possível enviar. Tentaremos de novo automaticamente.',
  'sync.editNote':
    'Alterações aparecem na escala na hora. O envio ao servidor acontece em segundo plano quando você estiver online.',

  'tray.title': 'Fila de serviços',
  'tray.queue': 'Fila',
  'tray.hint':
    'Clique para editar · arraste até uma jornada na escala para atribuir.',
  'tray.empty': 'Nenhum serviço pendente. Bom trabalho.',
  'tray.expand': 'Expandir fila de serviços',
  'tray.collapse': 'Recolher fila de serviços',
  'tray.add': 'Adicionar novo serviço',
  'tray.ticketTitle': 'Clique para editar · arraste para atribuir',
  'tray.minutes': '{{count}} min',

  'timeline.shift': 'Jornada',
  'timeline.shiftsAria': 'Jornadas de trabalho',

  'sector.transporte.label': 'Transporte',
  'sector.transporte.hint': 'Deslocamentos, coletas e entregas',
  'sector.campo.label': 'Operações de Campo',
  'sector.campo.hint': 'Equipes em atendimento no cliente',
  'sector.manutencao.label': 'Manutenção',
  'sector.manutencao.hint': 'Técnicos e serviços especializados',
  'sector.shiftCount': '{{count}} jornada',
  'sector.shiftCountPlural': '{{count}} jornadas',

  'job.new': 'Novo serviço',
  'job.edit': 'Editar serviço',
  'job.editOnBoard': 'Editar na escala',
  'job.title': 'Título',
  'job.client': 'Cliente',
  'job.location': 'Local',
  'job.priority': 'Prioridade',
  'job.duration': 'Duração (min)',
  'job.workShift': 'Jornada de trabalho',
  'job.date': 'Data',
  'job.startTime': 'Horário de início',
  'job.noClient': 'Sem cliente definido',
  'job.noLocation': '—',
  'job.titlePlaceholder': 'Ex.: Coleta de contêiner',
  'job.mode.queue': 'Fila de serviços',
  'job.mode.schedule': 'Atribuir à escala',
  'job.assignNow': 'Atribuir à escala agora',
  'job.addToQueue': 'Adicionar à fila',
  'job.addToBoard': 'Adicionar à escala',
  'job.removeFromBoard': 'Remover da escala',
  'job.delete': 'Excluir serviço',
  'job.cancel': 'Cancelar',
  'job.save': 'Salvar',
  'job.close': 'Fechar',
  'job.cardEdit': 'Clique para editar',

  'priority.low': 'Baixa',
  'priority.normal': 'Normal',
  'priority.high': 'Alta',
  'priority.urgent': 'Urgente',

  'card.remove': 'Remover atribuição',

  'conflict.title': 'Conflito de sincronização',
  'conflict.description':
    'Este serviço foi alterado em outro dispositivo enquanto você editava offline. Escolha qual versão deve prevalecer.',
  'conflict.keepLocal': 'Manter sua versão',
  'conflict.keepRemote': 'Usar versão do servidor',
  'conflict.editedBy': 'editado por {{name}}',
  'conflict.queue': '+{{count}} outro(s) conflito(s) na fila'
} as const;

const en: Record<keyof typeof pt, string> = {
  'app.title': 'Dispatch Board',
  'app.loading': 'Loading local schedule…',

  'locale.pt': 'PT',
  'locale.en': 'EN',

  'view.allDays': '14 days',
  'view.singleDay': 'Day',
  'view.dayLabel': 'View',

  'sync.hint':
    'Edits save instantly on device · server sync runs in the background',
  'sync.legendTitle': 'How synchronization works',
  'sync.synced': 'Synced',
  'sync.savedLocally': 'Saved locally',
  'sync.conflict': 'Conflict',
  'sync.allSynced': 'All synced',
  'sync.sending': 'Sending to server…',
  'sync.savedCount': '{{count}} saved locally',
  'sync.savedCountPlural': '{{count}} saved locally',
  'sync.conflictCount': '{{count}} conflict',
  'sync.conflictCountPlural': '{{count}} conflicts',
  'sync.offlineMode': 'Offline mode',
  'sync.offlinePendingTitle':
    'Changes saved locally. They will be sent when you are back online.',
  'sync.pendingTitle': 'Sending pending changes to the server…',
  'sync.toggleTitle': 'Toggle simulated connectivity to test offline mode',
  'sync.online': 'Online',
  'sync.offline': 'Offline',
  'sync.badge.synced': 'Synced',
  'sync.badge.pending': 'Saved locally',
  'sync.badge.syncing': 'Sending…',
  'sync.badge.conflict': 'Conflict',
  'sync.badge.error': 'Failed',
  'sync.help.synced': 'This assignment matches the server.',
  'sync.help.pending':
    'Saved on your device. It will be sent to the server when you are online.',
  'sync.help.syncing': 'Sending change to the server now…',
  'sync.help.conflict':
    'Someone else changed the same slot. Resolve the conflict to continue.',
  'sync.help.error': 'Could not send. We will retry automatically.',
  'sync.editNote':
    'Changes appear on the board immediately. Server sync runs in the background when online.',

  'tray.title': 'Service queue',
  'tray.queue': 'Queue',
  'tray.hint': 'Click to edit · drag onto a shift row to assign.',
  'tray.empty': 'No pending services. Good job.',
  'tray.expand': 'Expand service queue',
  'tray.collapse': 'Collapse service queue',
  'tray.add': 'Add new service',
  'tray.ticketTitle': 'Click to edit · drag to assign',
  'tray.minutes': '{{count}} min',

  'timeline.shift': 'Shift',
  'timeline.shiftsAria': 'Work shifts',

  'sector.transporte.label': 'Transport',
  'sector.transporte.hint': 'Hauling, pickups and deliveries',
  'sector.campo.label': 'Field Operations',
  'sector.campo.hint': 'Crews serving customers on site',
  'sector.manutencao.label': 'Maintenance',
  'sector.manutencao.hint': 'Technicians and specialist services',
  'sector.shiftCount': '{{count}} shift',
  'sector.shiftCountPlural': '{{count}} shifts',

  'job.new': 'New service',
  'job.edit': 'Edit service',
  'job.editOnBoard': 'Edit on board',
  'job.title': 'Title',
  'job.client': 'Client',
  'job.location': 'Location',
  'job.priority': 'Priority',
  'job.duration': 'Duration (min)',
  'job.workShift': 'Work shift',
  'job.date': 'Date',
  'job.startTime': 'Start time',
  'job.noClient': 'No client set',
  'job.noLocation': '—',
  'job.titlePlaceholder': 'E.g. Container pickup',
  'job.mode.queue': 'Service queue',
  'job.mode.schedule': 'Assign to board',
  'job.assignNow': 'Assign to board now',
  'job.addToQueue': 'Add to queue',
  'job.addToBoard': 'Add to board',
  'job.removeFromBoard': 'Remove from board',
  'job.delete': 'Delete service',
  'job.cancel': 'Cancel',
  'job.save': 'Save',
  'job.close': 'Close',
  'job.cardEdit': 'Click to edit',

  'priority.low': 'Low',
  'priority.normal': 'Normal',
  'priority.high': 'High',
  'priority.urgent': 'Urgent',

  'card.remove': 'Remove assignment',

  'conflict.title': 'Sync conflict',
  'conflict.description':
    'This service was changed on another device while you were editing offline. Choose which version should win.',
  'conflict.keepLocal': 'Keep your version',
  'conflict.keepRemote': 'Use server version',
  'conflict.editedBy': 'edited by {{name}}',
  'conflict.queue': '+{{count}} more conflict(s) in queue'
};

export type TranslationKey = keyof typeof pt;

const catalogs: Record<Locale, Record<TranslationKey, string>> = { pt, en };

export function translate(
  locale: Locale,
  key: TranslationKey,
  vars?: Record<string, string | number>
): string {
  let text = catalogs[locale][key] ?? catalogs.pt[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replace(
        new RegExp(`\\{\\{${name}\\}\\}`, 'g'),
        String(value)
      );
    }
  }
  return text;
}

export function pluralKey(
  base: string,
  count: number,
  locale: Locale
): TranslationKey {
  if (locale === 'en') return base as TranslationKey;
  return (count > 1 ? `${base}Plural` : base) as TranslationKey;
}
