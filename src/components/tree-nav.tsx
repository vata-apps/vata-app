import './tree-nav.css';

import { Link, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Icon } from '$components/icon';
import { NAV_SECTIONS, getTreeIdFromPath, resolveNavSection } from '$lib/nav-sections';

/**
 * The in-tree navigation bar — one item per top-level section
 * (Home, People, Families, Events, Places). It sits in the shell header
 * and persists across every page of an open tree.
 *
 * Each item is a fixed-height icon-and-label control. The section in view
 * gets a soft-accent pill, including on that section's detail routes (an
 * individual detail highlights People).
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
      <ul className="tree-nav-list">
        {NAV_SECTIONS.map((section) => {
          const label = t(section.labelKey);
          const isActive = section.id === activeSection;
          return (
            <li key={section.id}>
              <Link
                to={section.to}
                params={{ treeId }}
                className="tree-nav-item"
                // Without `exact`, TanStack's fuzzy matcher marks the Home link
                // active on every in-tree route (its path is a prefix of them
                // all); section-active state is driven by resolveNavSection.
                activeOptions={{ exact: true }}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon name={section.icon} size={16} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
