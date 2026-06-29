import { type ReactNode } from 'react';
import { Box, Flex, IconButton } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { Icon } from '$components/icon';
import { PreferencesPopover } from '$components/preferences-popover';
import { TreeNav } from './tree-nav';

/**
 * Props accepted by {@link TreeShell}.
 */
export interface TreeShellProps {
  /** The routed page, rendered full-width in the shell body. */
  children: ReactNode;
}

/**
 * The in-tree application shell — the persistent frame around every page
 * under an open tree.
 *
 * A narrow {@link TreeNav} rail runs down the left edge, with a Settings
 * button (opening the {@link PreferencesPopover}) pinned to its bottom,
 * beside a single full-width body that holds the routed page.
 *
 * The shell provides no fixed side panels: pages render full-width by
 * default and build any panels they need inside their own body. See
 * [ADR-011](../../docs/adr/0011-full-width-shell.md).
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
  return (
    <Flex direction="row" height="100vh" overflow="hidden">
      <TreeNav
        footer={
          <PreferencesPopover side="right">
            <IconButton size="3" variant="soft" color="gray" aria-label={t('preferences.title')}>
              <Icon name="settings" size={20} />
            </IconButton>
          </PreferencesPopover>
        }
      />
      <Box asChild flexGrow="1" minHeight="0" overflow="auto">
        <main>{children}</main>
      </Box>
    </Flex>
  );
}
