import type { IconName } from '$components/icon';

/**
 * Identifier of a top-level navigation section of the in-tree shell.
 */
export type NavSectionId = 'home' | 'people' | 'families' | 'sources' | 'repositories';

/**
 * A section shown in the in-tree icon navigation bar.
 */
export interface NavSection {
  /** Stable section identifier. */
  readonly id: NavSectionId;
  /** Curated icon name rendered in the navigation bar. */
  readonly icon: IconName;
  /** i18n key (in the `common` namespace) for the section label. */
  readonly labelKey: string;
  /** Route the icon links to, with `$treeId` filled from the active tree. */
  readonly to: string;
}

/**
 * The sections of the in-tree icon navigation bar, in display order.
 *
 * `Events` and `Places` are intentionally absent — those routes do not
 * exist yet and will be added when they do.
 */
export const NAV_SECTIONS = [
  { id: 'home', icon: 'house', labelKey: 'nav.home', to: '/tree/$treeId' },
  { id: 'people', icon: 'users', labelKey: 'nav.individuals', to: '/tree/$treeId/individuals' },
  { id: 'families', icon: 'network', labelKey: 'nav.families', to: '/tree/$treeId/families' },
  { id: 'sources', icon: 'file-text', labelKey: 'nav.sources', to: '/tree/$treeId/sources' },
  {
    id: 'repositories',
    icon: 'library',
    labelKey: 'nav.repositories',
    to: '/tree/$treeId/repositories',
  },
] as const satisfies readonly NavSection[];

/**
 * The path segment immediately after `/tree/{treeId}/` mapped to its
 * section. Both the list route (`individuals`) and the detail route
 * (`individual`) of a section appear here.
 */
const SECTION_BY_SEGMENT: Record<string, NavSectionId> = {
  individuals: 'people',
  individual: 'people',
  families: 'families',
  family: 'families',
  sources: 'sources',
  source: 'sources',
  repositories: 'repositories',
  repository: 'repositories',
};

/** Splits a pathname into its `/`-delimited, non-empty segments. */
function segmentsOf(pathname: string): string[] {
  return pathname.split('/').filter(Boolean);
}

/**
 * Returns the tree id embedded in an in-tree pathname (`/tree/{treeId}/...`),
 * or `null` when the path is not inside a tree.
 */
export function getTreeIdFromPath(pathname: string): string | null {
  const segments = segmentsOf(pathname);
  if (segments[0] !== 'tree' || !segments[1]) return null;
  return segments[1];
}

/**
 * Maps a pathname to the navigation section it belongs to.
 *
 * Both the list route and the detail routes of a section resolve to that
 * section — `/tree/1/individual/I-2` resolves to `people`, the same as
 * `/tree/1/individuals`. The bare tree path resolves to `home`. A path
 * outside the in-tree shell, or an in-tree path with no matching section
 * (e.g. the data browser), resolves to `null`.
 */
export function resolveNavSection(pathname: string): NavSectionId | null {
  if (getTreeIdFromPath(pathname) === null) return null;
  const sectionSegment = segmentsOf(pathname)[2];
  if (sectionSegment === undefined) return 'home';
  return SECTION_BY_SEGMENT[sectionSegment] ?? null;
}
