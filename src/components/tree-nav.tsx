import { Flex, IconButton, Tooltip } from '@radix-ui/themes';
import { Link, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Icon } from '$components/icon';
import { PreferencesPopover } from '$components/preferences-popover';
import { NAV_SECTIONS, getTreeIdFromPath, resolveNavSection } from '$lib/nav-sections';

/**
 * The in-tree navigation rail — a narrow icon-only vertical bar with one
 * item per top-level section (Home, People, Families, Events, Places) and a
 * Settings control pinned to the bottom. It sits on the left of the shell
 * and persists across every page of an open tree.
 *
 * Every glyph is a Radix `IconButton` with its label in a right-side
 * `Tooltip` and an `aria-label` for its accessible name: section items wrap a
 * router `Link` (`solid` accent when active, `soft` gray otherwise — the
 * filled vs. pale contrast marks the active section without relying on hue
 * alone), and the footer wraps the {@link PreferencesPopover} trigger.
 * Section-active state is driven by `resolveNavSection`, so a section's detail
 * routes highlight it too (an individual detail highlights People).
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
    <Flex
      asChild
      direction="column"
      align="center"
      gap="1"
      px="2"
      py="3"
      width="64px"
      flexShrink="0"
    >
      <nav aria-label={t('nav.ariaLabel')}>
        {NAV_SECTIONS.map((section) => {
          const isActive = section.id === activeSection;
          const label = t(section.labelKey);
          return (
            <Tooltip key={section.id} content={label} side="right">
              <IconButton
                asChild
                size="3"
                variant={isActive ? 'solid' : 'soft'}
                color={isActive ? undefined : 'gray'}
              >
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

        <PreferencesPopover side="right" tooltip={settingsLabel}>
          <IconButton mt="auto" size="3" variant="soft" color="gray" aria-label={settingsLabel}>
            <Icon name="settings" size={20} />
          </IconButton>
        </PreferencesPopover>
      </nav>
    </Flex>
  );
}
