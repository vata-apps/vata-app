import type { ParticipantRole } from '$/types/database';

export interface TemplateSlot {
  key: string;
  label: string;
  participantRole?: ParticipantRole;
  gender?: 'M' | 'F';
  required: boolean;
  multiple: boolean;
}

export interface FamilyRule {
  type: 'couple' | 'parent-child';
  members: { slot: string; role: 'husband' | 'wife' | 'child' }[];
}

export interface TemplateDefinition {
  id: string;
  label: string;
  eventTypeTag: string;
  slots: TemplateSlot[];
  families: FamilyRule[];
  hasDate: boolean;
  hasPlace: boolean;
}

const marriage: TemplateDefinition = {
  id: 'marriage',
  label: 'Marriage',
  eventTypeTag: 'MARR',
  slots: [
    {
      key: 'husband',
      label: 'Husband',
      participantRole: 'principal',
      gender: 'M',
      required: true,
      multiple: false,
    },
    {
      key: 'wife',
      label: 'Wife',
      participantRole: 'principal',
      gender: 'F',
      required: true,
      multiple: false,
    },
    {
      key: 'husband_father',
      label: "Husband's Father",
      gender: 'M',
      required: false,
      multiple: false,
    },
    {
      key: 'husband_mother',
      label: "Husband's Mother",
      gender: 'F',
      required: false,
      multiple: false,
    },
    {
      key: 'wife_father',
      label: "Wife's Father",
      gender: 'M',
      required: false,
      multiple: false,
    },
    {
      key: 'wife_mother',
      label: "Wife's Mother",
      gender: 'F',
      required: false,
      multiple: false,
    },
    {
      key: 'witness',
      label: 'Witness',
      participantRole: 'witness',
      required: false,
      multiple: true,
    },
  ],
  families: [
    {
      type: 'couple',
      members: [
        { slot: 'husband', role: 'husband' },
        { slot: 'wife', role: 'wife' },
      ],
    },
    {
      type: 'parent-child',
      members: [
        { slot: 'husband_father', role: 'husband' },
        { slot: 'husband_mother', role: 'wife' },
        { slot: 'husband', role: 'child' },
      ],
    },
    {
      type: 'parent-child',
      members: [
        { slot: 'wife_father', role: 'husband' },
        { slot: 'wife_mother', role: 'wife' },
        { slot: 'wife', role: 'child' },
      ],
    },
  ],
  hasDate: true,
  hasPlace: true,
};

const baptism: TemplateDefinition = {
  id: 'baptism',
  label: 'Baptism',
  eventTypeTag: 'BAPM',
  slots: [
    {
      key: 'child',
      label: 'Child',
      participantRole: 'principal',
      required: true,
      multiple: false,
    },
    { key: 'father', label: 'Father', gender: 'M', required: false, multiple: false },
    { key: 'mother', label: 'Mother', gender: 'F', required: false, multiple: false },
    {
      key: 'godfather',
      label: 'Godfather',
      participantRole: 'godparent',
      gender: 'M',
      required: false,
      multiple: false,
    },
    {
      key: 'godmother',
      label: 'Godmother',
      participantRole: 'godparent',
      gender: 'F',
      required: false,
      multiple: false,
    },
  ],
  families: [
    {
      type: 'parent-child',
      members: [
        { slot: 'father', role: 'husband' },
        { slot: 'mother', role: 'wife' },
        { slot: 'child', role: 'child' },
      ],
    },
  ],
  hasDate: true,
  hasPlace: true,
};

const birth: TemplateDefinition = {
  id: 'birth',
  label: 'Birth',
  eventTypeTag: 'BIRT',
  slots: [
    {
      key: 'child',
      label: 'Child',
      participantRole: 'principal',
      required: true,
      multiple: false,
    },
    { key: 'father', label: 'Father', gender: 'M', required: false, multiple: false },
    { key: 'mother', label: 'Mother', gender: 'F', required: false, multiple: false },
  ],
  families: [
    {
      type: 'parent-child',
      members: [
        { slot: 'father', role: 'husband' },
        { slot: 'mother', role: 'wife' },
        { slot: 'child', role: 'child' },
      ],
    },
  ],
  hasDate: true,
  hasPlace: true,
};

const death: TemplateDefinition = {
  id: 'death',
  label: 'Death',
  eventTypeTag: 'DEAT',
  slots: [
    {
      key: 'deceased',
      label: 'Deceased',
      participantRole: 'principal',
      required: true,
      multiple: false,
    },
    {
      key: 'informant',
      label: 'Informant',
      participantRole: 'informant',
      required: false,
      multiple: false,
    },
  ],
  families: [],
  hasDate: true,
  hasPlace: true,
};

const burial: TemplateDefinition = {
  id: 'burial',
  label: 'Burial',
  eventTypeTag: 'BURI',
  slots: [
    {
      key: 'deceased',
      label: 'Deceased',
      participantRole: 'principal',
      required: true,
      multiple: false,
    },
  ],
  families: [],
  hasDate: true,
  hasPlace: true,
};

const census: TemplateDefinition = {
  id: 'census',
  label: 'Census',
  eventTypeTag: 'CENS',
  slots: [
    {
      key: 'head',
      label: 'Head of Household',
      participantRole: 'principal',
      required: true,
      multiple: false,
    },
    {
      key: 'member',
      label: 'Member',
      participantRole: 'other',
      required: false,
      multiple: true,
    },
  ],
  families: [],
  hasDate: true,
  hasPlace: true,
};

const generic: TemplateDefinition = {
  id: 'generic',
  label: 'Generic',
  eventTypeTag: '',
  slots: [],
  families: [],
  hasDate: true,
  hasPlace: true,
};

export const TEMPLATES: TemplateDefinition[] = [
  marriage,
  baptism,
  birth,
  death,
  burial,
  census,
  generic,
];

export function getTemplateById(id: string): TemplateDefinition | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
