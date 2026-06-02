import { type ReactNode } from 'react';
import { Box, Flex, IconButton, Separator } from '@radix-ui/themes';
import { useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Icon } from '$components/icon';
import { PreferencesPopover } from '$components/preferences-popover';
import { resolveNavSection } from '$lib/nav-sections';
import { EventsSidebar } from './events-sidebar';
import { FamilySidebar } from './family-sidebar';
import { PeopleSidebar } from './people-sidebar';
import { PlacesSidebar } from './places-sidebar';
import { TreeNav } from './tree-nav';

/**
 * Props accepted by {@link TreeShell}.
 */
export interface TreeShellProps {
  /** The routed page, rendered in the centre column. */
  children: ReactNode;
}

/**
 * The in-tree application shell — the persistent frame around every page
 * under an open tree.
 *
 * A persistent 56px header carries the {@link TreeNav} navigation bar on
 * the left and a Settings button (opening the {@link PreferencesPopover})
 * on the right, above a fixed three-column layout: a 332px left panel,
 * the page body, and a 320px right panel.
 *
 * The left panel renders the active section's entity list, selected from
 * the active navigation section — for the People section, the
 * {@link PeopleSidebar}. The right panel is reserved structural space for
 * contextual detail, added in later work. Column widths are fixed — no
 * resizing, collapsing, or responsive behaviour. Each column scrolls
 * independently, so long content in one never moves the others.
 *
 * Rendered once by the in-tree layout route, wrapping the routed `Outlet`.
 *
 * @example
 * <TreeShell>
 *   <Outlet />
 * </TreeShell>
 */
export function TreeShell({ children }: TreeShellProps): JSX.Element {
  const { t } = useTranslation('common');
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeSection = resolveNavSection(pathname);
  return (
    <Flex direction="column" height="100vh" overflow="hidden">
      <Flex asChild align="center" justify="between" flexShrink="0" height="56px" px="5">
        <header>
          <TreeNav />
          <PreferencesPopover side="bottom">
            <IconButton size="2" variant="ghost" color="gray" aria-label={t('preferences.title')}>
              <Icon name="settings" size={16} />
            </IconButton>
          </PreferencesPopover>
        </header>
      </Flex>
      <Separator size="4" />
      <Flex flexGrow="1" minHeight="0">
        <Box width="332px" flexShrink="0" overflow="hidden">
          {activeSection === 'people' && <PeopleSidebar />}
          {activeSection === 'families' && <FamilySidebar />}
          {activeSection === 'events' && <EventsSidebar />}
          {activeSection === 'places' && <PlacesSidebar />}
        </Box>
        <Separator orientation="vertical" size="4" />
        <Box asChild flexGrow="1" overflow="auto">
          <main>{children}</main>
        </Box>
        <Separator orientation="vertical" size="4" />
        <Box width="320px" flexShrink="0" overflow="auto" />
      </Flex>
    </Flex>
  );
}
