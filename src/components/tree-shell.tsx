import { type ReactNode } from 'react';
import { Box, Flex, Grid, IconButton } from '@radix-ui/themes';
import { useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Icon } from '$components/icon';
import { PreferencesPopover } from '$components/preferences-popover';
import { resolveNavSection } from '$lib/nav-sections';
import { EventsSidebar } from './events-sidebar';
import { FamilySidebar } from './family-sidebar';
import { PeopleSidebar } from './people-sidebar';
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
      <Flex
        asChild
        align="center"
        justify="between"
        flexShrink="0"
        height="56px"
        style={{
          paddingInline: 20,
          background: 'var(--color-panel-solid)',
          borderBottom: '1px solid var(--gray-a4)',
        }}
      >
        <header>
          <TreeNav />
          <PreferencesPopover side="bottom">
            <IconButton size="2" variant="ghost" color="gray" aria-label={t('preferences.title')}>
              <Icon name="settings" size={16} />
            </IconButton>
          </PreferencesPopover>
        </header>
      </Flex>
      <Grid columns="332px minmax(0, 1fr) 320px" flexGrow="1" minHeight="0">
        <Box
          overflow="hidden"
          style={{
            background: 'var(--color-panel-solid)',
            borderRight: '1px solid var(--gray-a4)',
          }}
        >
          {activeSection === 'people' && <PeopleSidebar />}
          {activeSection === 'families' && <FamilySidebar />}
          {activeSection === 'events' && <EventsSidebar />}
        </Box>
        <Box asChild overflow="auto">
          <main style={{ background: 'var(--color-background)' }}>{children}</main>
        </Box>
        <Box
          overflow="auto"
          style={{
            background: 'var(--color-panel-solid)',
            borderLeft: '1px solid var(--gray-a4)',
          }}
        />
      </Grid>
    </Flex>
  );
}
