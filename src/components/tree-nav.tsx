import { type ReactNode } from 'react';
import { Flex } from '@radix-ui/themes';
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
 * The in-tree navigation rail — a narrow vertical bar with one item per
 * top-level section (Home, People, Families, Events, Places), each an icon
 * stacked over its label, plus an optional action pinned to the bottom. It
 * sits on the left of the shell and persists across every page of an open
 * tree.
 *
 * Each section is a router `Link` styled as a rail item (no tab metaphor).
 * The section in view is marked active (including on that section's detail
 * routes — an individual detail highlights People), which tints the item;
 * section-active state is driven by `resolveNavSection`.
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
      gap="2"
      px="2"
      py="3"
      width="88px"
      flexShrink="0"
      className="tree-rail"
    >
      <nav aria-label={t('nav.ariaLabel')}>
        <Flex direction="column" gap="1" flexGrow="1">
          {NAV_SECTIONS.map((section) => {
            const isActive = section.id === activeSection;
            return (
              <Link
                key={section.id}
                to={section.to}
                params={{ treeId }}
                // Without `exact`, TanStack's fuzzy matcher marks the Home link
                // active on every in-tree route (its path is a prefix of them
                // all); section-active state is driven by resolveNavSection.
                activeOptions={{ exact: true }}
                aria-current={isActive ? 'page' : undefined}
                className={isActive ? 'tree-rail__item tree-rail__item--active' : 'tree-rail__item'}
              >
                <Icon name={section.icon} size={20} />
                <span className="tree-rail__label">{t(section.labelKey)}</span>
              </Link>
            );
          })}
        </Flex>
        {footer !== undefined && <Flex justify="center">{footer}</Flex>}
      </nav>
    </Flex>
  );
}
