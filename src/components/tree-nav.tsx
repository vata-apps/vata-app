import { Link, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { tv } from 'tailwind-variants';

import { Icon } from '$components/ui/icon';
import { NAV_SECTIONS, getTreeIdFromPath, resolveNavSection } from '$lib/nav-sections';

const navItem = tv({
  base: [
    'flex h-9 w-9 items-center justify-center rounded-md',
    'transition-colors duration-150 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ],
  variants: {
    active: {
      true: 'bg-primary text-primary-foreground',
      false: 'text-muted-foreground hover:bg-accent hover:text-foreground',
    },
  },
});

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
      <ul className="flex items-center gap-1">
        {NAV_SECTIONS.map((section) => {
          const label = t(section.labelKey);
          const isActive = section.id === activeSection;
          return (
            <li key={section.id}>
              <Link
                to={section.to}
                params={{ treeId }}
                // Without `exact`, TanStack's fuzzy matcher marks the Home link
                // active on every in-tree route (its path is a prefix of them
                // all); section-active state is driven by resolveNavSection.
                activeOptions={{ exact: true }}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className={navItem({ active: isActive })}
              >
                <Icon name={section.icon} size={18} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
