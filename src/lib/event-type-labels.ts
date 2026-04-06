import type { EventType } from '$/types/database';

const GEDCOM_EVENT_TYPE_LABELS: Record<string, string> = {
  // Individual events
  BIRT: 'Birth',
  CHR: 'Christening',
  DEAT: 'Death',
  BURI: 'Burial',
  CREM: 'Cremation',
  ADOP: 'Adoption',
  BAPM: 'Baptism',
  BARM: 'Bar Mitzvah',
  BASM: 'Bas Mitzvah',
  CONF: 'Confirmation',
  FCOM: 'First Communion',
  ORDN: 'Ordination',
  NATU: 'Naturalization',
  EMIG: 'Emigration',
  IMMI: 'Immigration',
  CENS: 'Census',
  PROB: 'Probate',
  WILL: 'Will',
  GRAD: 'Graduation',
  RETI: 'Retirement',
  OCCU: 'Occupation',
  RESI: 'Residence',
  EDUC: 'Education',
  RELI: 'Religion',

  // Family events
  MARR: 'Marriage',
  MARB: 'Marriage Banns',
  MARC: 'Marriage Contract',
  MARL: 'Marriage License',
  MARS: 'Marriage Settlement',
  ENGA: 'Engagement',
  DIV: 'Divorce',
  DIVF: 'Divorce Filed',
  ANUL: 'Annulment',
};

export function getEventTypeLabel(eventType: EventType): string {
  if (eventType.customName !== null) {
    return eventType.customName;
  }

  if (eventType.tag !== null && eventType.tag in GEDCOM_EVENT_TYPE_LABELS) {
    return GEDCOM_EVENT_TYPE_LABELS[eventType.tag];
  }

  return eventType.tag ?? 'Unknown';
}
