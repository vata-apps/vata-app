import type { EventType } from '$types/database';

/** The i18next `t` shape this file needs — enough to resolve a key in another namespace via `{ ns }`. */
export type TranslateFn = (key: string, options?: { ns?: string }) => string;

/**
 * System tags whose translations live in the `events` namespace.
 * BAPM and CHR intentionally share the same key (both render as Baptism/Baptême).
 */
const KNOWN_TAG_KEYS: Record<string, string> = {
  BIRT: 'types.BIRT',
  BAPM: 'types.BAPM',
  CHR: 'types.BAPM',
  CONF: 'types.CONF',
  MARR: 'types.MARR',
  DIV: 'types.DIV',
  CENS: 'types.CENS',
  EMIG: 'types.EMIG',
  IMMI: 'types.IMMI',
  DEAT: 'types.DEAT',
  BURI: 'types.BURI',
  CREM: 'types.CREM',
  ADOP: 'types.ADOP',
  BARM: 'types.BARM',
  BASM: 'types.BASM',
  FCOM: 'types.FCOM',
  ORDN: 'types.ORDN',
  NATU: 'types.NATU',
  PROB: 'types.PROB',
  WILL: 'types.WILL',
  GRAD: 'types.GRAD',
  RETI: 'types.RETI',
  RESI: 'types.RESI',
  OCCU: 'types.OCCU',
  EDUC: 'types.EDUC',
  RELI: 'types.RELI',
};

/**
 * Resolves an EventType to its user-visible label string.
 *
 * - Custom type (no tag) → returns `customName` verbatim.
 * - System tag with a known translation key → returns `t('events:types.<TAG>')`.
 * - System tag without a known key → returns the tag itself as a fallback.
 */
export function eventTypeLabel(type: EventType, t: TranslateFn): string {
  if (!type.isSystem || type.tag === null) {
    return type.customName ?? type.tag ?? '';
  }
  const key = KNOWN_TAG_KEYS[type.tag];
  if (key) return t(key, { ns: 'events' });
  return type.tag;
}
