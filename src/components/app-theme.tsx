import { Theme } from '@radix-ui/themes';
import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react';

import { useAppStore } from '$/store/app-store';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Resolves the persisted theme preference to a concrete Radix Themes
 * appearance. `light` / `dark` pass through; `system` follows the OS
 * `prefers-color-scheme` and updates live when the OS setting changes.
 */
function useResolvedAppearance(): 'light' | 'dark' {
  const theme = useAppStore((state) => state.theme);
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => window.matchMedia(DARK_QUERY).matches
  );

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const onChange = (event: MediaQueryListEvent): void => setSystemPrefersDark(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  if (theme === 'system') return systemPrefersDark ? 'dark' : 'light';
  return theme;
}

/**
 * Application-wide Radix Themes provider. Wraps the entire app and binds the
 * appearance to the persisted theme preference. Mounted once, at the React
 * root (see `main.tsx`).
 *
 * The Radix Theme provider itself carries no brand overrides: color, gray,
 * radius, and fonts all fall to Radix Themes defaults (indigo accent, system
 * stacks). Only `appearance` is set — brand tokens live in the Vanilla
 * Extract contract instead (`src/design/theme.css.ts`).
 */
export function AppTheme({ children }: { children: ReactNode }): JSX.Element {
  const appearance = useResolvedAppearance();

  // Bridge the resolved appearance to the Vanilla Extract tokens (ADR-0007):
  // `data-theme` drives `src/design/theme.css.ts` so Base UI + VE surfaces stay
  // in sync with Radix during the migration. useLayoutEffect (not useEffect) so
  // the attribute lands before first paint — no wrong-theme flash on launch when
  // the chosen theme differs from the OS.
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = appearance;
  }, [appearance]);

  return <Theme appearance={appearance}>{children}</Theme>;
}
