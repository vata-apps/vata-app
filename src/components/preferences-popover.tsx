import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Popover, PopoverContent, PopoverTrigger } from '$components/ui/popover';
import { SegmentedControl } from '$components/ui/segmented-control';
import { useAppStore, type Theme } from '$/store/app-store';

type Language = 'en' | 'fr';

function normalizeLanguage(raw: string): Language {
  const base = raw.split('-')[0]?.toLowerCase();
  return base === 'fr' ? 'fr' : 'en';
}

/**
 * Props accepted by {@link PreferencesPopover}.
 */
export interface PreferencesPopoverProps {
  /** The trigger element wrapped by `Popover.Trigger`. */
  children: ReactNode;
}

/**
 * Floating preferences panel anchored to a trigger. Lets the user
 * change the **theme** (light / dark / system) and the **UI language**
 * (en / fr) and persists both selections — theme via the Zustand store,
 * language via i18next's localStorage detector.
 *
 * Owns all preference-related copy via `useTranslation('common')`. The
 * caller only provides the trigger element.
 *
 * @example
 * <PreferencesPopover>
 *   <Button variant="outline" size="sm" leadingIcon="settings">
 *     {t('common:statusBar.preferences')}
 *   </Button>
 * </PreferencesPopover>
 */
export function PreferencesPopover({ children }: PreferencesPopoverProps): JSX.Element {
  const { t, i18n } = useTranslation('common');
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  const language = normalizeLanguage(i18n.language);

  const themeOptions = [
    { value: 'light', label: t('preferences.themeLight') },
    { value: 'dark', label: t('preferences.themeDark') },
    { value: 'system', label: t('preferences.themeSystem') },
  ];

  const languageOptions = [
    { value: 'en', label: t('preferences.languageEn') },
    { value: 'fr', label: t('preferences.languageFr') },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-[280px] p-4">
        <h2 className="text-foreground mb-3 font-serif text-base leading-none font-medium tracking-tight italic">
          {t('preferences.title')}
        </h2>

        <div className="flex flex-col items-start gap-1.5">
          <span className="text-muted-foreground font-mono text-[10.5px] tracking-wider uppercase">
            {t('preferences.themeLabel')}
          </span>
          <SegmentedControl
            size="sm"
            options={themeOptions}
            value={theme}
            onValueChange={(next) => {
              if (next) setTheme(next as Theme);
            }}
            aria-label={t('preferences.themeAriaLabel')}
          />
        </div>

        <div className="mt-4 flex flex-col items-start gap-1.5">
          <span className="text-muted-foreground font-mono text-[10.5px] tracking-wider uppercase">
            {t('preferences.languageLabel')}
          </span>
          <SegmentedControl
            size="sm"
            options={languageOptions}
            value={language}
            onValueChange={(next) => {
              if (next) void i18n.changeLanguage(next);
            }}
            aria-label={t('preferences.languageAriaLabel')}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
