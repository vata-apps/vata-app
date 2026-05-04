import { type ReactNode } from 'react';

import { Button } from '$components/ui/button';

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
 *       <Button variant="outline" size="sm" leadingIcon="settings">
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
    <footer className="border-border bg-background text-muted-foreground flex h-[52px] items-center gap-3.5 border-t px-[18px] font-mono text-[11px]">
      <span>{brandLabel}</span>
      <span aria-hidden>·</span>
      <span className="tabular-nums">v {version}</span>
      <span className="flex-1" aria-hidden />
      {debug && (
        <>
          <Button
            variant="outline"
            size="sm"
            leadingIcon="bug"
            onClick={debug.onClick}
            className="font-mono"
          >
            {debug.label}
            {debug.shortcut && (
              <span className="border-border bg-foreground/5 text-muted-foreground ml-1 rounded border px-1.5 py-px font-mono text-[10px] leading-none">
                {debug.shortcut}
              </span>
            )}
          </Button>
          <span aria-hidden>·</span>
        </>
      )}
      {preferencesTrigger}
    </footer>
  );
}
