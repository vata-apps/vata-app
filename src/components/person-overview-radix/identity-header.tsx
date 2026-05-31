import { Avatar, Flex, Heading, TabNav, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { Icon, type IconName } from '../icon';
import type { OverviewPerson } from './overview-mock';

/** Maps the sex glyph to its icon; falls back to a neutral person icon. */
function sexIcon(sex: string): IconName {
  if (sex === '♀') return 'venus';
  if (sex === '♂') return 'mars';
  return 'user';
}

/**
 * The identity band — a monogram avatar, the person's name, and an icon-led
 * summary line: `[sex] · [birth] <date>, <place> · [death] <date>, <place>`.
 * Dates may be imprecise. Pure `@radix-ui/themes` plus the curated `Icon`; the
 * monogram uses `Avatar`'s fallback. The section tabs are a separate
 * {@link OverviewTabs}.
 */
export function IdentityHeader({ person }: { person: OverviewPerson }): JSX.Element {
  const { t } = useTranslation('individuals');

  const segments: Array<{ key: string; icon: IconName; label?: string }> = [
    { key: 'sex', icon: sexIcon(person.sex) },
    {
      key: 'born',
      icon: 'baby',
      label: t('overview.vital.event', { date: person.birthDate, place: person.birthPlace }),
    },
    {
      key: 'died',
      icon: 'cross',
      label: t('overview.vital.event', { date: person.deathDate, place: person.deathPlace }),
    },
  ];

  return (
    <Flex align="center" gap="3">
      <Avatar
        src={person.imageUrl}
        size="4"
        radius="full"
        variant="soft"
        fallback={person.initials}
      />

      <Flex direction="column" gap="1">
        <Flex align="center" gap="3" wrap="wrap">
          <Heading size="6">{person.name}</Heading>
        </Flex>
        <Flex align="center" gap="2" wrap="wrap">
          {segments.map((segment, i) => (
            <Flex key={segment.key} align="center" gap="2">
              {i > 0 && (
                <Text size="1" color="gray">
                  ·
                </Text>
              )}
              <Flex align="center" gap="1">
                {segment.label ? (
                  // Icon sits next to text that carries the meaning → decorative.
                  <Icon name={segment.icon} size={14} style={{ color: 'var(--gray-9)' }} />
                ) : (
                  // Standalone icon (sex) → make it announce.
                  <Icon
                    name={segment.icon}
                    size={14}
                    style={{ color: 'var(--gray-9)' }}
                    aria-hidden={false}
                    aria-label={t(`overview.vital.${segment.key}`)}
                  />
                )}
                {segment.label && (
                  <Text size="2" color="gray">
                    {segment.label}
                  </Text>
                )}
              </Flex>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
}

/**
 * The section tab bar — shows only the Overview tab for the marketing
 * prototype; additional tabs (Pedigree, Events, …) are not yet implemented.
 */
export function OverviewTabs(): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <TabNav.Root>
      <TabNav.Link href="#" active>
        {t('overview.tabs.overview')}
      </TabNav.Link>
    </TabNav.Root>
  );
}
