import { Theme } from '@radix-ui/themes';
import { useEffect, useState, type ReactNode } from 'react';

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
 * Application-wide Radix Themes provider. Wraps the entire app, fixes
 * the Vata brand tokens (brown accent, sand gray, medium radius), and
 * binds the appearance to the persisted theme preference. Mounted once,
 * at the React root (see `main.tsx`).
 */
export function AppTheme({ children }: { children: ReactNode }): JSX.Element {
  const appearance = useResolvedAppearance();
  return (
    <Theme appearance={appearance} accentColor="brown" grayColor="sand" radius="medium">
      {children}
    </Theme>
  );
}
