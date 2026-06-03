import { Flex, TabNav } from '@radix-ui/themes';
import { Link, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Icon } from '$components/icon';
import { NAV_SECTIONS, getTreeIdFromPath, resolveNavSection } from '$lib/nav-sections';

/**
 * The in-tree navigation bar — one item per top-level section
 * (Home, People, Families, Events, Places). It sits in the shell header
 * and persists across every page of an open tree.
 *
 * Each item is a Radix `TabNav.Link` wrapping a router `Link`. The section
 * in view is marked `active` (including on that section's detail routes —
 * an individual detail highlights People), which draws the underline
 * indicator; section-active state is driven by `resolveNavSection`.
 *
 * Reads the active tree and section from the current route; renders
 * nothing when used outside the in-tree context.
 */
export function TreeNav(): JSX.Element | null {
  const { t } = useTranslation('common');
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const treeId = getTreeIdFromPath(pathname);
  const activeSection = resolveNavSection(pathname);

  if (treeId === null) return null;

  return (
    <TabNav.Root aria-label={t('nav.ariaLabel')}>
      {NAV_SECTIONS.map((section) => {
        const isActive = section.id === activeSection;
        return (
          <TabNav.Link key={section.id} asChild active={isActive}>
            <Link
              to={section.to}
              params={{ treeId }}
              // Without `exact`, TanStack's fuzzy matcher marks the Home link
              // active on every in-tree route (its path is a prefix of them
              // all); section-active state is driven by resolveNavSection.
              activeOptions={{ exact: true }}
            >
              <Flex align="center" gap="2">
                <Icon name={section.icon} size={16} />
                {t(section.labelKey)}
              </Flex>
            </Link>
          </TabNav.Link>
        );
      })}
    </TabNav.Root>
  );
}
