import { Link, useRouterState } from '@tanstack/react-router';
import { Button, Flex } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { Icon } from '$components/icon';
import { NAV_SECTIONS, getTreeIdFromPath, resolveNavSection } from '$lib/nav-sections';

/**
 * The in-tree navigation bar — one button per top-level section
 * (Home, People, Families, Events, Places). It sits in the shell header
 * and persists across every page of an open tree.
 *
 * Each button carries the section icon and label. The section currently
 * in view is highlighted with the soft accent variant, including on that
 * section's detail routes (an individual detail highlights People).
 * Sections whose route does not exist yet (Events, Places) render
 * disabled and non-navigable.
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

            // Events / Places have no route yet — render a disabled button.
            if (section.to === null) {
              return (
                <li key={section.id}>
                  <Button size="2" variant="ghost" color="gray" disabled>
                    <Icon name={section.icon} size={16} />
                    {label}
                  </Button>
                </li>
              );
            }

            const isActive = section.id === activeSection;
            return (
              <li key={section.id}>
                <Button
                  asChild
                  size="2"
                  variant={isActive ? 'soft' : 'ghost'}
                  color={isActive ? undefined : 'gray'}
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
                    <Icon name={section.icon} size={16} />
                    {label}
                  </Link>
                </Button>
              </li>
            );
          })}
        </ul>
      </Flex>
    </nav>
  );
}
