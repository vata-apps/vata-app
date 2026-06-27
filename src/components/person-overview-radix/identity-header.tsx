import { Avatar, Badge, Code, Flex, Heading, TabNav, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { Icon, type IconName } from '../icon';
import type { OverviewPerson } from './overview-types';

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
/** Join a (possibly partial) date and place into one label, or `null` when neither is recorded. */
function vitalLabel(date: string, place: string): string | null {
  return [date, place].filter(Boolean).join(', ') || null;
}

interface MetaSegmentData {
  key: string;
  icon?: IconName;
  label?: string;
  text?: string;
}

/** One item in the identity metadata strip: the ID, the sex glyph, or a vital. */
function MetaSegment({ segment }: { segment: MetaSegmentData }): JSX.Element | null {
  const { t } = useTranslation('individuals');

  if (segment.text) {
    return (
      <Code variant="ghost" size="2" color="gray">
        {segment.text}
      </Code>
    );
  }
  if (segment.icon && segment.label) {
    return (
      <Flex align="center" gap="1">
        {/* Icon sits next to text that carries the meaning → decorative. */}
        <Icon name={segment.icon} size={14} color="var(--gray-9)" />
        <Text size="2" color="gray">
          {segment.label}
        </Text>
      </Flex>
    );
  }
  if (segment.icon) {
    return (
      // Standalone icon (sex) → make it announce.
      <Icon
        name={segment.icon}
        size={14}
        color="var(--gray-9)"
        aria-hidden={false}
        aria-label={t(`overview.vital.${segment.key}`)}
      />
    );
  }
  return null;
}

export function IdentityHeader({ person }: { person: OverviewPerson }): JSX.Element {
  const { t } = useTranslation('individuals');

  const bornLabel = vitalLabel(person.birthDate, person.birthPlace);
  const diedLabel = vitalLabel(person.deathDate, person.deathPlace);

  // The sex glyph is always shown; the born/died segments only appear when the
  // event is recorded, so people without a death event don't show a stray icon.
  const segments: MetaSegmentData[] = [
    { key: 'sex', icon: sexIcon(person.sex) },
    ...(person.id ? [{ key: 'id', text: person.id }] : []),
    ...(bornLabel ? [{ key: 'born', icon: 'baby' as IconName, label: bornLabel }] : []),
    ...(diedLabel ? [{ key: 'died', icon: 'cross' as IconName, label: diedLabel }] : []),
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
          {person.otherNamesCount > 0 && (
            <Badge variant="soft" color="gray" radius="full">
              {t('overview.lifespan.otherNames', { count: person.otherNamesCount })}
            </Badge>
          )}
        </Flex>
        <Flex align="center" gap="2" wrap="wrap">
          {segments.map((segment, i) => (
            <Flex key={segment.key} align="center" gap="2">
              {i > 0 && (
                <Text size="1" color="gray">
                  ·
                </Text>
              )}
              <MetaSegment segment={segment} />
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
}

const OVERVIEW_TABS = ['overview', 'pedigree', 'events', 'relations', 'sources', 'notes'] as const;

/**
 * The section tab bar. Only **Overview** is implemented and active; the other
 * tabs are visible but inert (their content lands in later work), so the screen
 * advertises its full shape without dead navigation.
 */
export function OverviewTabs(): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <TabNav.Root>
      {OVERVIEW_TABS.map((tab) => (
        <TabNav.Link
          key={tab}
          href="#"
          active={tab === 'overview'}
          onClick={(event) => event.preventDefault()}
        >
          {t(`overview.tabs.${tab}`)}
        </TabNav.Link>
      ))}
    </TabNav.Root>
  );
}
