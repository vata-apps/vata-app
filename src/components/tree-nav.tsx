import { type ReactNode } from 'react';
import { Flex, IconButton, Tooltip } from '@radix-ui/themes';
import { Link, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Icon } from '$components/icon';
import { NAV_SECTIONS, getTreeIdFromPath, resolveNavSection } from '$lib/nav-sections';

/**
 * Props accepted by {@link TreeNav}.
 */
export interface TreeNavProps {
  /**
   * Action pinned to the bottom of the rail, pushed away from the section
   * links by flexible space (e.g. the Settings button).
   */
  footer?: ReactNode;
}

/**
 * The in-tree navigation rail — a narrow icon-only vertical bar with one
 * item per top-level section (Home, People, Families, Events, Places), each
 * an icon with its label in a hover tooltip, plus an optional action pinned
 * to the bottom. It sits on the left of the shell and persists across every
 * page of an open tree.
 *
 * Each section is a Radix `IconButton` wrapping a router `Link` — a `soft`
 * pill in the accent color for the active section and gray for the rest, so
 * the tint, hover, focus ring, and square shape all come from the theme. The
 * icon carries no text label, so the link takes an `aria-label` for its
 * accessible name and a right-side `Tooltip` for sighted users. The section
 * in view is marked active (including on that section's detail routes — an
 * individual detail highlights People); section-active state is driven by
 * `resolveNavSection`.
 *
 * Reads the active tree and section from the current route; renders nothing
 * when used outside the in-tree context.
 */
export function TreeNav({ footer }: TreeNavProps): JSX.Element | null {
  const { t } = useTranslation('common');
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const treeId = getTreeIdFromPath(pathname);
  const activeSection = resolveNavSection(pathname);

  if (treeId === null) return null;

  return (
    <Flex
      asChild
      direction="column"
      align="center"
      gap="2"
      px="2"
      py="3"
      width="64px"
      flexShrink="0"
    >
      <nav aria-label={t('nav.ariaLabel')}>
        <Flex direction="column" align="center" gap="1" flexGrow="1">
          {NAV_SECTIONS.map((section) => {
            const isActive = section.id === activeSection;
            const label = t(section.labelKey);
            return (
              <Tooltip key={section.id} content={label} side="right">
                <IconButton asChild size="3" variant="soft" color={isActive ? undefined : 'gray'}>
                  <Link
                    to={section.to}
                    params={{ treeId }}
                    // Without `exact`, TanStack's fuzzy matcher marks the Home link
                    // active on every in-tree route (its path is a prefix of them
                    // all); section-active state is driven by resolveNavSection.
                    activeOptions={{ exact: true }}
                    aria-label={label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon name={section.icon} size={20} />
                  </Link>
                </IconButton>
              </Tooltip>
            );
          })}
        </Flex>
        {footer}
      </nav>
    </Flex>
  );
}
