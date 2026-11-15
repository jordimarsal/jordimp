import { type L10n, type Locale } from '../lib/i18n';

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
  } as L10n<any>, // Using any for nested structure flexibility in this specific data file
  cardLive: {
    en: 'Live Status',
    es: 'Estado en Vivo',
    ca: 'Estat en Viu',
  } as L10n<string>
};
