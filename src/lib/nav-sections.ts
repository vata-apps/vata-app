import type { IconName } from '$components/icon';

/**
 * Identifier of a top-level navigation section of the in-tree shell.
 */
export type NavSectionId = 'home' | 'people' | 'families' | 'events' | 'places';

/**
 * A section shown in the in-tree navigation bar.
 */
export interface NavSection {
  /** Stable section identifier. */
  readonly id: NavSectionId;
  /** Curated icon name rendered in the navigation bar. */
  readonly icon: IconName;
  /** i18n key (in the `common` namespace) for the section label. */
  readonly labelKey: string;
  /**
   * Route the section links to, with `$treeId` filled from the active
   * tree, or `null` when the section has no route yet. A `null` section
   * renders as a disabled, non-navigable item.
   */
  readonly to: string | null;
}

/**
 * The sections of the in-tree navigation bar, in display order.
 *
 * `Events` and `Places` have no `to`: their routes are not built yet, so
 * they render disabled. Give them a route here once it exists.
 */
export const NAV_SECTIONS = [
  { id: 'home', icon: 'house', labelKey: 'nav.home', to: '/tree/$treeId' },
  { id: 'people', icon: 'user', labelKey: 'nav.individuals', to: '/tree/$treeId/individuals' },
  { id: 'families', icon: 'users', labelKey: 'nav.families', to: '/tree/$treeId/families' },
  { id: 'events', icon: 'calendar', labelKey: 'nav.events', to: '/tree/$treeId/events' },
  { id: 'places', icon: 'map-pin', labelKey: 'nav.places', to: null },
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
  events: 'events',
  event: 'events',
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
 * outside the in-tree shell, or an in-tree path with no matching section,
 * resolves to `null`.
 */
export function resolveNavSection(pathname: string): NavSectionId | null {
  if (getTreeIdFromPath(pathname) === null) return null;
  const sectionSegment = segmentsOf(pathname)[2];
  if (sectionSegment === undefined) return 'home';
  return SECTION_BY_SEGMENT[sectionSegment] ?? null;
}
