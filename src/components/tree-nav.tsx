import { Link, useRouterState } from '@tanstack/react-router';
import { Flex, IconButton } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { Icon } from '$components/icon';
import { NAV_SECTIONS, getTreeIdFromPath, resolveNavSection } from '$lib/nav-sections';

/**
 * The in-tree icon navigation bar — one icon per top-level section
 * (Home, People, Families, Sources, Repositories). It sits in the shell
 * header and persists across every page of an open tree.
 *
 * The icon of the section currently in view is highlighted, including on
 * that section's detail routes (an individual detail highlights People).
 * Each icon is an accessible link labelled with its section name.
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
    <nav aria-label={t('nav.ariaLabel')}>
      <Flex asChild align="center" gap="1">
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {NAV_SECTIONS.map((section) => {
            const label = t(section.labelKey);
            const isActive = section.id === activeSection;
            return (
              <li key={section.id}>
                <IconButton
                  asChild
                  size="3"
                  variant={isActive ? 'solid' : 'ghost'}
                  color={isActive ? undefined : 'gray'}
                  aria-label={label}
                >
                  <Link
                    to={section.to}
                    params={{ treeId }}
                    // Without `exact`, TanStack's fuzzy matcher marks the Home link
                    // active on every in-tree route (its path is a prefix of them
                    // all); section-active state is driven by resolveNavSection.
                    activeOptions={{ exact: true }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon name={section.icon} size={18} />
                  </Link>
                </IconButton>
              </li>
            );
          })}
        </ul>
      </Flex>
    </nav>
  );
}
