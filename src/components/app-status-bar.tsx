import { type ReactNode } from 'react';
import { Box, Button, Flex, Kbd, Text } from '@radix-ui/themes';

import { Icon } from '$components/icon';

/**
 * Optional debug action rendered between the version and the
 * preferences trigger.
 */
export interface AppStatusBarDebugAction {
  /** Localized label rendered inside the button. */
  label: string;
  /**
   * Optional keyboard shortcut chip rendered after the label. Visual
   * only — registering the shortcut is the caller's responsibility.
   */
  shortcut?: ReactNode;
  /** Called when the button is clicked. */
  onClick: () => void;
}

/**
 * Props accepted by {@link AppStatusBar}.
 */
export interface AppStatusBarProps {
  /** Brand or product name shown on the left (e.g., "Vata"). */
  brandLabel: ReactNode;
  /** Version string shown after the brand label (rendered as `v {version}`). */
  version: ReactNode;
  /**
   * Optional debug action. Omit to hide the button entirely. Callers
   * typically gate this with `import.meta.env.DEV` so production builds
   * tree-shake the dev-only chrome.
   */
  debug?: AppStatusBarDebugAction;
  /**
   * Slot rendered in place of a default Preferences button. Typically
   * a `Popover.Trigger` wrapping a Button so the caller can fully
   * compose the popover behavior. Required so this wrapper does not
   * own the preferences UI.
   */
  preferencesTrigger: ReactNode;
}

/**
 * Horizontal status bar pinned at the bottom of the app shell. Shows
 * the brand + version on the left, an optional Debug button, and a
 * caller-provided preferences trigger on the right.
 *
 * Owns no copy — every label is supplied by the caller. The
 * preferences slot is fully delegated so the caller controls the
 * popover/dropdown/dialog that opens on click.
 *
 * @example
 * <AppStatusBar
 *   brandLabel="Vata"
 *   version={packageJson.version}
 *   debug={import.meta.env.DEV ? {
 *     label: t('common:statusBar.debug'),
 *     shortcut: '⌘D',
 *     onClick: openDebugPanel,
 *   } : undefined}
 *   preferencesTrigger={
 *     <PreferencesPopover>
 *       <Button variant="soft" size="2">
 *         {t('common:statusBar.preferences')}
 *       </Button>
 *     </PreferencesPopover>
 *   }
 * />
 */
export function AppStatusBar({
  brandLabel,
  version,
  debug,
  preferencesTrigger,
}: AppStatusBarProps): JSX.Element {
  return (
    <Flex asChild align="center" gap="3" flexShrink="0" px="4" height="52px">
      <footer
        style={{ borderTop: '1px solid var(--gray-a5)', fontFamily: 'var(--code-font-family)' }}
      >
        <Text size="1" color="gray">
          {brandLabel}
        </Text>
        <Text size="1" color="gray" aria-hidden>
          ·
        </Text>
        <Text size="1" color="gray" style={{ fontVariantNumeric: 'tabular-nums' }}>
          v {version}
        </Text>
        <Box flexGrow="1" aria-hidden />
        {debug && (
          <Button size="2" variant="soft" color="gray" onClick={debug.onClick}>
            <Icon name="bug" size={16} />
            {debug.label}
            {debug.shortcut && <Kbd size="1">{debug.shortcut}</Kbd>}
          </Button>
        )}
        {preferencesTrigger}
      </footer>
    </Flex>
  );
}
