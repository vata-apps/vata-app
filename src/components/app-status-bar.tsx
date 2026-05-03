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
  /** Localized label for the debug button. */
  debugLabel: string;
  /**
   * Optional keyboard shortcut chip rendered inside the debug button.
   * Visual only — registering the shortcut is the caller's responsibility.
   */
  debugShortcut?: ReactNode;
  /** Localized label for the preferences button. */
  preferencesLabel: string;
  /** Called when the debug button is clicked. */
  onDebugClick: () => void;
  /** Called when the preferences button is clicked. */
  onPreferencesClick: () => void;
}

/**
 * Horizontal status bar pinned at the bottom of the app shell. Shows
 * the brand + version on the left and Debug / Preferences buttons on
 * the right. Owns no copy — every label is supplied by the caller.
 *
 * Composes {@link Button} (outline, sm) so the buttons stay consistent
 * with the rest of the design system. The debug button accepts an
 * optional keyboard-shortcut chip rendered after the label.
 *
 * @example
 * <AppStatusBar
 *   brandLabel="Vata"
 *   version={packageJson.version}
 *   debugLabel={t('common:statusBar.debug')}
 *   debugShortcut="⌘D"
 *   preferencesLabel={t('common:statusBar.preferences')}
 *   onDebugClick={openDebugPanel}
 *   onPreferencesClick={openPreferences}
 * />
 */
export function AppStatusBar({
  brandLabel,
  version,
  debugLabel,
  debugShortcut,
  preferencesLabel,
  onDebugClick,
  onPreferencesClick,
}: AppStatusBarProps): JSX.Element {
  return (
    <footer className="border-border bg-background text-muted-foreground flex h-[52px] items-center gap-3.5 border-t px-[18px] font-mono text-[11px]">
      <span>{brandLabel}</span>
      <span aria-hidden>·</span>
      <span className="tabular-nums">v {version}</span>
      <span className="flex-1" aria-hidden />
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
      <Button
        variant="outline"
        size="sm"
        leadingIcon="settings"
        onClick={onPreferencesClick}
        className="font-mono"
      >
        {preferencesLabel}
      </Button>
    </footer>
  );
}
