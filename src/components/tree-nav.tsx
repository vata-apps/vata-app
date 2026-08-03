import { Link, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Icon } from '$components/icon';
import { PreferencesPopover } from '$components/preferences-popover';
import { IconButton } from '$components/ui/icon-button';
import { Tooltip } from '$components/ui/tooltip';
import { NAV_SECTIONS, getTreeIdFromPath, resolveNavSection } from '$lib/nav-sections';
import * as styles from './tree-nav.css';

/**
 * The in-tree navigation rail — a narrow icon-only vertical bar with one
 * item per top-level section (Home, People, Families, Events, Places) and a
 * Settings control pinned to the bottom. It sits on the left of the shell
 * and persists across every page of an open tree.
 *
 * Every glyph is a `size="lg"` {@link IconButton} with its label in a
 * right-side {@link Tooltip} and an `aria-label` for its accessible name:
 * section items render as a router `Link` (via `IconButton`'s own `render`
 * prop, itself passed through the tooltip trigger's `render` prop) with
 * `active` set on the current section — the filled vs. transparent contrast
 * marks the active section without relying on hue alone — and the footer
 * wraps the {@link PreferencesPopover} trigger.
 * Section-active state is driven by `resolveNavSection`, so a section's
 * detail routes highlight it too (an individual detail highlights People).
 *
 * Reads the active tree and section from the current route; renders nothing
 * when used outside the in-tree context.
 */
export function TreeNav(): JSX.Element | null {
  const { t } = useTranslation('common');
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const treeId = getTreeIdFromPath(pathname);
  const activeSection = resolveNavSection(pathname);

  if (treeId === null) return null;

  const settingsLabel = t('preferences.title');

  return (
    <nav aria-label={t('nav.ariaLabel')} className={styles.nav}>
      {NAV_SECTIONS.map((section) => {
        const isActive = section.id === activeSection;
        const label = t(section.labelKey);
        return (
          <Tooltip.Root key={section.id}>
            <Tooltip.Trigger
              render={
                <IconButton
                  size="lg"
                  active={isActive}
                  render={
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
                      <Icon name={section.icon} size={19} />
                    </Link>
                  }
                />
              }
            />
            <Tooltip.Portal>
              <Tooltip.Positioner side="right" sideOffset={6}>
                <Tooltip.Popup>{label}</Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        );
      })}

      <PreferencesPopover side="right" tooltip={settingsLabel}>
        <IconButton size="lg" className={styles.settingsTrigger} aria-label={settingsLabel}>
          <Icon name="settings" size={19} />
        </IconButton>
      </PreferencesPopover>
    </nav>
  );
}
