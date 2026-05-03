import { useEffect } from 'react';

import { useAppStore } from '$/store/app-store';

/**
 * Subscribes to user-facing app preferences (theme today; future
 * settings can be added here) and applies them to the document.
 *
 * Theme: when set to `light` or `dark`, the matching class is applied
 * to `<html>` (and the other one removed). When set to `system`, both
 * classes are removed and the CSS `@media (prefers-color-scheme:
 * dark)` rule in `app.css` takes over.
 *
 * Call once near the root of the React tree (see `__root.tsx`).
 */
export function useApplyAppPreferences(): void {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'light') root.classList.add('light');
    else if (theme === 'dark') root.classList.add('dark');
  }, [theme]);
}
