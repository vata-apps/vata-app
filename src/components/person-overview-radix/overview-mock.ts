/**
 * Static sample data for the pure-Radix Person Overview experiment.
 *
 * This mirrors the Person Overview mock data, but deliberately drops every
 * icon reference: this variant is built from `@radix-ui/themes` components
 * only, with no Lucide `Icon` and no custom CSS. Features that Radix cannot
 * express on its own (the map surface, the milestone glyphs, the timeline
 * rail) are simply omitted rather than faked.
 *
 * Two fixtures are exported:
 *   - {@link personOverview}      — Marie Garneau, fully populated
 *   - {@link edouardTremblayOverview} — Édouard Tremblay, sparse/missing-data state
 */

import edouardTremblayPortrait from '$/assets/person-overview/profile-elzear-bourgoin.png';
import henriGarneauPortrait from '$/assets/person-overview/profile-henri-levesque.png';
import marieGarneauMarriage from '$/assets/person-overview/marriage-marie-levesque-elzear-bourgoin.png';
import marieGarneauPortrait from '$/assets/person-overview/profile-marie-levesque.png';
import marieGarneauRegistry from '$/assets/person-overview/registry-marie-levesque.png';

export interface OverviewPerson {
  initials: string;
  name: string;
  /** Profile photo URL; falls back to {@link initials} when absent. */
  imageUrl?: string;
  /** Sex glyph (♀ / ♂). */
  sex: string;
  generations: number;
  birthYear: number;
  deathYear: number;
  age: number;
  mediaCount: number;
  /** Display-ready birth date, possibly imprecise (e.g. "14 Aug 1890"). */
  birthDate: string;
  /** Birthplace shown in the header summary. */
  birthPlace: string;
  /** Display-ready death date, possibly imprecise (e.g. "before 1955"). */
  deathDate: string;
  /** Place of death shown in the header summary. */
  deathPlace: string;
  /** Count of additional recorded names beyond the primary one. */
  otherNamesCount: number;
}

export interface OverviewFigures {
  events: number;
  relations: number;
  sources: number;
  media: number;
}

/** A recorded name for the person, e.g. a birth name or a married name. */
export interface OverviewName {
  id: string;
  /** Name-type key resolved through i18n (`birth`, `married`, `nickname`, …). */
  type: string;
  /** The full name text as recorded. */
  text: string;
  /** Marks the canonical name displayed across the app. */
  isPrimary?: boolean;
}

/**
 * The two parental slots shown in the Parents panel. Either may be absent when
 * that parent is not yet recorded in the tree.
 */
export interface OverviewParents {
  father?: PersonRefData;
  mother?: PersonRefData;
}

/**
 * A reference to a person shown elsewhere in the app (parents, children,
 * spouses, …). The shared shape consumed by the `PersonRef` component.
 */
export interface PersonRefData {
  /** Stable id of the referenced individual (e.g. `I-0001`). */
  id: string;
  initials: string;
  name: string;
  /** Profile photo URL; falls back to {@link initials} when absent. */
  imageUrl?: string;
  bornYear?: number;
  deathYear?: number;
}

export type MilestoneKind = 'born' | 'marriage' | 'death';

export interface OverviewMilestone {
  id: string;
  /**
   * Display-ready date, which may be imprecise: a full date (`12 Mar 1890`), a
   * partial one (`Mar 1890`, `1890`), approximate (`c. 1890`), or qualified
   * (`before 1955`). Rendered verbatim — genealogical dates are rarely exact.
   */
  date: string;
  /** Numeric year used only for ordering the milestones. */
  sortYear: number;
  kind: MilestoneKind;
  place: string;
  detail: string;
  /** The spouse, for `marriage` milestones. */
  spouse?: PersonRefData;
  children?: PersonRefData[];
}

export interface OverviewPlaceLegend {
  place: string;
  detail: string;
  /** WGS-84 coordinates for the map pin. */
  lat: number;
  lng: number;
}

export interface OverviewChecklistItem {
  /** Key into `overview.completion.items.*`. */
  key: string;
  done: boolean;
}

export interface OverviewMediaTile {
  id: string;
  /** Thumbnail image URL. */
  imageUrl: string;
  /** Caption key resolved through `overview.media.captions.*`. */
  caption: string;
}

export type SuggestionKind = 'duplicate' | 'conflict' | 'hint';

export interface OverviewSuggestion {
  id: string;
  kind: SuggestionKind;
  text: string;
  /** Label for the primary action button. */
  action: string;
}

export interface OverviewResearchNote {
  id: string;
  /** Display-ready date the note was written, e.g. "12 Mar 2024". */
  date: string;
  text: string;
}

export interface PersonOverview {
  person: OverviewPerson;
  figures: OverviewFigures;
  names: OverviewName[];
  parents: OverviewParents;
  milestones: OverviewMilestone[];
  places: { region: string; legend: OverviewPlaceLegend[] };
  completion: { percent: number; items: OverviewChecklistItem[] };
  media: OverviewMediaTile[];
  researchNotes: OverviewResearchNote[];
  suggestions: OverviewSuggestion[];
}

export const personOverview: PersonOverview = {
  person: {
    initials: 'MG',
    name: 'Marie Garneau',
    imageUrl: marieGarneauPortrait,
    sex: '♀',
    generations: 5,
    birthYear: 1890,
    deathYear: 1955,
    age: 65,
    mediaCount: 12,
    birthDate: '14 Aug 1890',
    birthPlace: 'Longueuil',
    deathDate: 'before 1955',
    deathPlace: 'Montréal',
    otherNamesCount: 2,
  },
  figures: { events: 12, relations: 21, sources: 7, media: 4 },
  names: [
    { id: 'N-0001', type: 'birth', text: 'Marie Garneau', isPrimary: true },
    { id: 'N-0002', type: 'married', text: 'Marie Tremblay' },
    { id: 'N-0003', type: 'married', text: 'Marie Fortier' },
  ],
  parents: {
    father: {
      id: 'I-0002',
      initials: 'HG',
      name: 'Henri Garneau',
      imageUrl: henriGarneauPortrait,
      bornYear: 1855,
      deathYear: 1921,
    },
    mother: {
      id: 'I-0003',
      initials: 'CD',
      name: 'Céleste Daneau',
      bornYear: 1858,
      deathYear: 1930,
    },
  },
  milestones: [
    {
      id: 'born',
      date: '14 Aug 1890',
      sortYear: 1890,
      kind: 'born',
      place: 'Longueuil',
      detail: 'Born into the Garneau family.',
    },
    {
      id: 'marriage-tremblay',
      date: 'c. 1922',
      sortYear: 1922,
      kind: 'marriage',
      place: 'Saint-Lambert',
      detail: 'First marriage · 8 children',
      spouse: {
        id: 'I-0004',
        initials: 'ÉT',
        name: 'Édouard Tremblay',
        imageUrl: edouardTremblayPortrait,
        bornYear: 1888,
        deathYear: 1960,
      },
      children: [
        {
          id: 'I-0010',
          initials: 'JL',
          name: 'Jean-Louis',
          imageUrl: 'https://i.pravatar.cc/150?img=33',
          bornYear: 1923,
          deathYear: 1998,
        },
        { id: 'I-0011', initials: 'M', name: 'Marcelle', bornYear: 1924, deathYear: 2005 },
        {
          id: 'I-0012',
          initials: 'J',
          name: 'Joseph',
          imageUrl: 'https://i.pravatar.cc/150?img=51',
          bornYear: 1925,
          deathYear: 1991,
        },
        {
          id: 'I-0013',
          initials: 'A',
          name: 'Adèle',
          imageUrl: 'https://i.pravatar.cc/150?img=47',
          bornYear: 1926,
          deathYear: 2012,
        },
        { id: 'I-0014', initials: 'É', name: 'Émile', bornYear: 1928, deathYear: 2001 },
        { id: 'I-0015', initials: 'P', name: 'Pierre', bornYear: 1929, deathYear: 2009 },
        { id: 'I-0016', initials: 'T', name: 'Théodore', bornYear: 1930, deathYear: 1995 },
        { id: 'I-0017', initials: 'AM', name: 'Anne-Marie', bornYear: 1931, deathYear: 2018 },
      ],
    },
    {
      id: 'marriage-fortier',
      date: 'Sep 1931',
      sortYear: 1931,
      kind: 'marriage',
      place: 'Saint-Lambert',
      detail: 'Second marriage · 1 child',
      spouse: {
        id: 'I-0005',
        initials: 'RF',
        name: 'Robert Fortier',
        bornYear: 1885,
        deathYear: 1958,
      },
      children: [
        {
          id: 'I-0020',
          initials: 'A',
          name: 'Anna',
          imageUrl: 'https://i.pravatar.cc/150?img=44',
          bornYear: 1932,
          deathYear: 2015,
        },
      ],
    },
    {
      id: 'died',
      date: 'before 1955',
      sortYear: 1955,
      kind: 'death',
      place: 'Montréal',
      detail: 'Died at age 65.',
    },
  ],
  places: {
    region: 'Greater Montréal',
    legend: [
      { place: 'Longueuil', detail: '1890 · birthplace', lat: 45.5312, lng: -73.5185 },
      { place: 'Saint-Lambert', detail: '1922 · marriages', lat: 45.4986, lng: -73.5118 },
      { place: 'Montréal', detail: '1955 · place of death', lat: 45.5017, lng: -73.5673 },
    ],
  },
  completion: {
    percent: 50,
    items: [
      { key: 'birthDatePlace', done: true },
      { key: 'birthSource', done: false },
      { key: 'marriageDatePlace', done: true },
      { key: 'marriageSource', done: false },
      { key: 'deathDatePlace', done: true },
      { key: 'deathSource', done: false },
    ],
  },
  media: [
    { id: 'M-0001', imageUrl: marieGarneauPortrait, caption: 'profile' },
    { id: 'M-0002', imageUrl: marieGarneauMarriage, caption: 'wedding' },
    { id: 'M-0003', imageUrl: marieGarneauRegistry, caption: 'register' },
  ],
  researchNotes: [
    {
      id: 'RN-0001',
      date: '3 Jan 2024',
      text: "can't find marriage act w/ Édouard. Saint-Lambert parish not fully indexed",
    },
    {
      id: 'RN-0002',
      date: '2 May 2024',
      text: 'death date still a guess — only source is Marcelle\'s letter saying "last winter"',
    },
    {
      id: 'RN-0003',
      date: '14 Jun 2024',
      text: "checked 1901 census — she's listed under Henri's household, age 10. matches",
    },
    {
      id: 'RN-0004',
      date: '22 Jul 2024',
      text: 'Robert Fortier second husband — found him in 1941 census, widower, Saint-Lambert',
    },
    {
      id: 'RN-0005',
      date: '5 Sep 2024',
      text: "Édouard's death cert says 1960, Montréal. need to link the source",
    },
    {
      id: 'RN-0006',
      date: '18 Oct 2024',
      text: 'still missing birth source. notary records for Longueuil not digitized before 1895',
    },
  ],
  suggestions: [
    {
      id: 'S-0001',
      kind: 'conflict',
      text: 'Death year may be off — a death record for Marie Tremblay in 1952 matches age and location.',
      action: 'Review record',
    },
    {
      id: 'S-0002',
      kind: 'conflict',
      text: '1901 census places birth in 1889, not 1890. Two sources disagree.',
      action: 'Review sources',
    },
    {
      id: 'S-0003',
      kind: 'hint',
      text: 'Édouard Tremblay may have a previous marriage before 1920 in Boucherville.',
      action: 'Explore',
    },
  ],
};

/**
 * Sparse fixture for Édouard Tremblay — used to design the "missing data"
 * state of the Person Overview. Only his father and the marriage to Marie
 * Garneau are recorded; birth, death, photo, places, media, and research
 * notes are all absent.
 */
export const edouardTremblayOverview: PersonOverview = {
  person: {
    initials: 'ÉT',
    name: 'Édouard Tremblay',
    sex: '♂',
    generations: 5,
    birthYear: 1888,
    deathYear: 1960,
    age: 72,
    mediaCount: 0,
    birthDate: 'unknown',
    birthPlace: 'unknown',
    deathDate: 'unknown',
    deathPlace: 'unknown',
    otherNamesCount: 0,
  },
  figures: { events: 1, relations: 3, sources: 0, media: 0 },
  names: [{ id: 'N-0001', type: 'birth', text: 'Édouard Tremblay', isPrimary: true }],
  parents: {
    father: {
      id: 'I-0030',
      initials: 'GT',
      name: 'Georges Tremblay',
      bornYear: 1855,
      deathYear: 1920,
    },
  },
  milestones: [
    {
      id: 'marriage-garneau',
      date: 'c. 1922',
      sortYear: 1922,
      kind: 'marriage',
      place: 'Saint-Lambert',
      detail: 'First marriage · 8 children',
      spouse: {
        id: 'I-0001',
        initials: 'MG',
        name: 'Marie Garneau',
        imageUrl: marieGarneauPortrait,
        bornYear: 1890,
        deathYear: 1955,
      },
      children: [
        { id: 'I-0010', initials: 'JL', name: 'Jean-Louis', bornYear: 1923, deathYear: 1998 },
        { id: 'I-0011', initials: 'M', name: 'Marcelle', bornYear: 1924, deathYear: 2005 },
        { id: 'I-0012', initials: 'J', name: 'Joseph', bornYear: 1925, deathYear: 1991 },
        { id: 'I-0013', initials: 'A', name: 'Adèle', bornYear: 1926, deathYear: 2012 },
        { id: 'I-0014', initials: 'É', name: 'Émile', bornYear: 1928, deathYear: 2001 },
        { id: 'I-0015', initials: 'P', name: 'Pierre', bornYear: 1929, deathYear: 2009 },
        { id: 'I-0016', initials: 'T', name: 'Théodore', bornYear: 1930, deathYear: 1995 },
        { id: 'I-0017', initials: 'AM', name: 'Anne-Marie', bornYear: 1931, deathYear: 2018 },
      ],
    },
  ],
  places: { region: '', legend: [] },
  completion: {
    percent: 8,
    items: [
      { key: 'birthDatePlace', done: false },
      { key: 'birthSource', done: false },
      { key: 'marriageDatePlace', done: true },
      { key: 'marriageSource', done: false },
      { key: 'deathDatePlace', done: false },
      { key: 'deathSource', done: false },
    ],
  },
  media: [],
  researchNotes: [],
  suggestions: [],
};
