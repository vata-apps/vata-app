import { type ReactNode } from 'react';
import { Flex, Heading, Popover, SegmentedControl, Text, Tooltip } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '$/i18n/config';
import { useAppStore } from '$/store/app-store';

function normalizeLanguage(raw: string): SupportedLanguage {
  const base = raw.split('-')[0]?.toLowerCase();
  return SUPPORTED_LANGUAGES.includes(base as SupportedLanguage)
    ? (base as SupportedLanguage)
    : 'en';
}

/**
 * Props accepted by {@link PreferencesPopover}.
 */
export interface PreferencesPopoverProps {
  /** The trigger element wrapped by `Popover.Trigger`. */
  children: ReactNode;
  /**
   * Which side of the trigger the panel opens on. Use `'top'` for a
   * trigger pinned to the bottom of the screen and `'right'` for one in a
   * left-edge rail. Defaults to `'top'`.
   */
  side?: 'top' | 'right';
  /**
   * Optional label shown in a right-side tooltip on the trigger — for an
   * icon-only trigger whose meaning isn't otherwise visible. Wraps the
   * trigger so both the hover tooltip and the click-to-open popover work.
   */
  tooltip?: string;
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
 *   <Button variant="outline" size="1">
 *     {t('common:statusBar.preferences')}
 *   </Button>
 * </PreferencesPopover>
 */
export function PreferencesPopover({
  children,
  side = 'top',
  tooltip,
}: PreferencesPopoverProps): JSX.Element {
  const { t, i18n } = useTranslation('common');
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  const language = normalizeLanguage(i18n.language);

  // Tooltip must wrap the trigger (not the reverse), or its trigger props win
  // over the popover's and the panel stops opening on click.
  const trigger = <Popover.Trigger>{children}</Popover.Trigger>;

  return (
    <Popover.Root>
      {tooltip === undefined ? (
        trigger
      ) : (
        <Tooltip content={tooltip} side="right">
          {trigger}
        </Tooltip>
      )}
      <Popover.Content side={side} align="end" width="280px">
        <Heading size="3" mb="3">
          {t('preferences.title')}
        </Heading>

        <Flex direction="column" gap="4">
          <Flex direction="column" align="start" gap="1">
            <Text size="1" color="gray">
              {t('preferences.themeLabel')}
            </Text>
            <SegmentedControl.Root
              size="1"
              value={theme}
              onValueChange={(next) => {
                if (next === 'light' || next === 'dark' || next === 'system') {
                  setTheme(next);
                }
              }}
              aria-label={t('preferences.themeAriaLabel')}
            >
              <SegmentedControl.Item value="light">
                {t('preferences.themeLight')}
              </SegmentedControl.Item>
              <SegmentedControl.Item value="dark">
                {t('preferences.themeDark')}
              </SegmentedControl.Item>
              <SegmentedControl.Item value="system">
                {t('preferences.themeSystem')}
              </SegmentedControl.Item>
            </SegmentedControl.Root>
          </Flex>

          <Flex direction="column" align="start" gap="1">
            <Text size="1" color="gray">
              {t('preferences.languageLabel')}
            </Text>
            <SegmentedControl.Root
              size="1"
              value={language}
              onValueChange={(next) => void i18n.changeLanguage(next)}
              aria-label={t('preferences.languageAriaLabel')}
            >
              <SegmentedControl.Item value="en">
                {t('preferences.languageEn')}
              </SegmentedControl.Item>
              <SegmentedControl.Item value="fr">
                {t('preferences.languageFr')}
              </SegmentedControl.Item>
            </SegmentedControl.Root>
          </Flex>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
}
