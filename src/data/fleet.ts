import type { Locale } from '../lib/i18n';
import type { L10n } from './types';

type FleetColumns = { model: string; global: string; tps: string; updated: string };

interface FleetPanelData {
  kicker: L10n<string>;
  statusHeader: L10n<string>;
  scoreboardHeader: L10n<string>;
  watchHeader: L10n<string>;
  columns: L10n<FleetColumns>;
  offlineFallback: L10n<string>;
  connecting: L10n<string>;
  liveBadge: L10n<string>;
}

export const FLEET = {
  panel: {
    kicker: {
      en: '~/fleet',
      es: '~/fleet',
      ca: '~/fleet',
    },
    statusHeader: {
      en: '$ fleet --status',
      es: '$ fleet --status',
      ca: '$ fleet --status',
    },
    scoreboardHeader: {
      en: '$ fleet --scoreboard',
      es: '$ fleet --scoreboard',
      ca: '$ fleet --scoreboard',
    },
    watchHeader: {
      en: '$ watch',
      es: '$ watch',
      ca: '$ watch',
    },
    columns: {
      en: { model: 'model', global: 'global', tps: 't-per-s', updated: 'updated' },
      es: { model: 'modelo', global: 'global', tps: 't-por-s', updated: 'actualizado' },
      ca: { model: 'model', global: 'global', tps: 't-per-s', updated: 'actualitzat' },
    },
    offlineFallback: {
      en: '$ fleet --status → offline — homelab unreachable',
      es: '$ fleet --status → offline — homelab inalcanzable',
      ca: '$ fleet --status → offline — homelab inalcançable',
    },
    connecting: {
      en: 'Connecting to stream...',
      es: 'Conectando al flujo...',
      ca: 'Connectant al flux...',
    },
    liveBadge: {
      en: 'LIVE',
      es: 'EN VIVO',
      ca: 'EN VIU',
    }
  },
  cardLive: {
    en: 'Live Status',
    es: 'Estado en Vivo',
    ca: 'Estat en Viu',
  } as L10n<string>
} satisfies { panel: FleetPanelData; cardLive: L10n<string> };
