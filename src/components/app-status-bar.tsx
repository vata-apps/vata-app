import { type ReactNode } from 'react';

import { Button } from '$components/ui/button';

/**
 * Props accepted by {@link AppStatusBar}.
 */
export interface AppStatusBarProps {
  /** Brand or product name shown on the left (e.g., "Vata"). */
  brandLabel: ReactNode;
  /** Version string shown after the brand label (rendered as `v {version}`). */
  version: ReactNode;
  /**
   * Localized label for the debug button. The button is always
   * tree-shaken from production builds — even when this prop is
   * supplied — via an `import.meta.env.DEV` guard inside the component.
   */
  debugLabel?: string;
  /**
   * Optional keyboard shortcut chip rendered inside the debug button.
   * Visual only — registering the shortcut is the caller's responsibility.
   */
  debugShortcut?: ReactNode;
  /** Called when the debug button is clicked. */
  onDebugClick?: () => void;
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
 * the brand + version on the left, a Debug button (with optional
 * keyboard chip) and a caller-provided preferences trigger on the
 * right.
 *
 * Owns no copy — every label is supplied by the caller. The
 * preferences slot is fully delegated so the caller controls the
 * popover/dropdown/dialog that opens on click.
 *
 * @example
 * <AppStatusBar
 *   brandLabel="Vata"
 *   version={packageJson.version}
 *   debugLabel={t('common:statusBar.debug')}
 *   debugShortcut="⌘D"
 *   onDebugClick={openDebugPanel}
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
  debugLabel,
  debugShortcut,
  onDebugClick,
  preferencesTrigger,
}: AppStatusBarProps): JSX.Element {
  return (
    <footer className="border-border bg-background text-muted-foreground flex h-[52px] items-center gap-3.5 border-t px-[18px] font-mono text-[11px]">
      <span>{brandLabel}</span>
      <span aria-hidden>·</span>
      <span className="tabular-nums">v {version}</span>
      <span className="flex-1" aria-hidden />
      {import.meta.env.DEV && debugLabel && onDebugClick && (
        <>
          <Button
            variant="outline"
            size="sm"
            leadingIcon="bug"
            onClick={onDebugClick}
            className="font-mono"
          >
            {debugLabel}
            {debugShortcut && (
              <span className="border-border bg-foreground/5 text-muted-foreground ml-1 rounded border px-1.5 py-px font-mono text-[10px] leading-none">
                {debugShortcut}
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
