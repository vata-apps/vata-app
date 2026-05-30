import { Badge, Flex, Heading, Separator, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { Icon } from '$components/icon';
import type { OverviewPerson } from './overview-mock';

/** Tab keys, in display order; the first is the active tab. */
const TAB_KEYS = ['overview', 'pedigree', 'events', 'relations', 'sources', 'notes'] as const;

/**
 * The identity band at the top of the Person Overview — a monogram, the
 * person's name with an ancestry badge, a lifespan summary, and the section
 * tab bar, above a divider.
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
      <Flex align="center" justify="between" gap="4" wrap="wrap">
        <Flex align="center" gap="4">
          <Flex
            align="center"
            justify="center"
            width="56px"
            height="56px"
            flexShrink="0"
            style={{
              borderRadius: '50%',
              background: 'var(--accent-3)',
              border: '2px solid var(--accent-8)',
            }}
          >
            <Heading size="5" style={{ color: 'var(--accent-11)' }}>
              {person.initials}
            </Heading>
          </Flex>

          <Flex direction="column" gap="1">
            <Flex align="center" gap="3" wrap="wrap">
              <Heading size="8">{person.name}</Heading>
              <Text size="3" color="gray">
                {person.sex}
              </Text>
              <Badge variant="soft" radius="full" size="2">
                <Icon name="git-branch" size={12} />
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

        <Flex align="center" gap="4" wrap="wrap">
          {TAB_KEYS.map((key, i) => (
            <Text
              key={key}
              size="3"
              weight={i === 0 ? 'medium' : 'regular'}
              style={{ color: i === 0 ? 'var(--accent-11)' : 'var(--gray-10)' }}
            >
              {t(`overview.tabs.${key}`)}
            </Text>
          ))}
        </Flex>
      </Flex>

      <Separator size="4" />
    </Flex>
  );
}
