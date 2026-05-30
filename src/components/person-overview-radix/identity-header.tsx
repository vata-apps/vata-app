import { Avatar, Badge, Flex, Heading, Separator, TabNav, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import type { OverviewPerson } from './overview-mock';

/** Tab keys, in display order; the first is the active tab. */
const TAB_KEYS = ['overview', 'pedigree', 'events', 'relations', 'sources', 'notes'] as const;

/**
 * The identity band — a monogram avatar, the person's name with an ancestry
 * badge, a lifespan summary, and the section tab bar. Pure `@radix-ui/themes`:
 * the monogram uses `Avatar`'s fallback, the tabs use `TabNav`.
 */
export function IdentityHeader({ person }: { person: OverviewPerson }): JSX.Element {
  const { t } = useTranslation('individuals');

  const lifespanParts = [
    `${person.birthYear} – ${person.deathYear}`,
    t('overview.lifespan.aged', { age: person.age }),
    t('overview.lifespan.media', { count: person.mediaCount }),
  ];

  return (
    <Flex direction="column" gap="4">
      <Flex align="center" gap="4">
        <Avatar size="5" radius="full" variant="soft" fallback={person.initials} />

        <Flex direction="column" gap="1">
          <Flex align="center" gap="3" wrap="wrap">
            <Heading size="8">{person.name}</Heading>
            <Text size="3" color="gray">
              {person.sex}
            </Text>
            <Badge variant="soft" radius="full" size="2">
              {t('overview.ancestorPill', { count: person.generations })}
            </Badge>
          </Flex>
          <Flex align="center" gap="2" wrap="wrap">
            {lifespanParts.map((part, i) => (
              <Flex key={part} align="center" gap="2">
                {i > 0 && (
                  <Text size="2" color="gray">
                    ·
                  </Text>
                )}
                <Text size="3" color="gray">
                  {part}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Flex>

      <TabNav.Root>
        {TAB_KEYS.map((key, i) => (
          <TabNav.Link key={key} href="#" active={i === 0}>
            {t(`overview.tabs.${key}`)}
          </TabNav.Link>
        ))}
      </TabNav.Root>

      <Separator size="4" />
    </Flex>
  );
}
