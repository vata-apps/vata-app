import { Link } from '@tanstack/react-router';
import { Avatar, Flex, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import type { IndividualWithDetails, Name } from '$types/database';
import { formatName } from '$db-tree/names';

function initialsOf(name: Name | null): string {
  if (!name) return '?';
  const given = name.givenNames?.trim().split(/\s+/)[0]?.charAt(0) ?? '';
  const surname = name.surname?.trim().charAt(0) ?? '';
  const initials = (given + surname).toUpperCase();
  if (initials) return initials;
  const nick = name.nickname?.trim().charAt(0);
  return nick ? nick.toUpperCase() : '?';
}

function birthYearOf(individual: IndividualWithDetails): string | null {
  return individual.birthEvent?.dateSort?.slice(0, 4) ?? null;
}

/** Props accepted by {@link PersonChip}. */
export interface PersonChipProps {
  individual: IndividualWithDetails;
  treeId: string;
  /** Marks this chip as the focal person — rendered with an accent ring and accent text. */
  self?: boolean;
}

/**
 * A compact, clickable chip representing an individual. Shows an avatar
 * (initials), primary name, and birth year. Navigates to the individual's
 * Overview on click.
 *
 * The `self` variant highlights the focal person when they appear inside a
 * family roster (accent ring + accent name colour), so the user never loses
 * track of "you are here".
 */
export function PersonChip({ individual, treeId, self = false }: PersonChipProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const name = individual.primaryName;
  const displayName = name ? formatName(name).short : t('overview.unknownPerson');
  const birthYear = birthYearOf(individual);

  return (
    <Link
      to="/tree/$treeId/individual/$individualId"
      params={{ treeId, individualId: individual.id }}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <Flex
        align="center"
        gap="2"
        p="2"
        style={{
          borderRadius: 'var(--radius-2)',
          outline: self ? '2px solid var(--accent-9)' : undefined,
          outlineOffset: self ? '-2px' : undefined,
          cursor: 'pointer',
        }}
      >
        <Avatar
          size="1"
          fallback={initialsOf(name)}
          color={self ? 'indigo' : 'gray'}
          variant={self ? 'solid' : 'soft'}
          radius="full"
        />
        <Flex direction="column" gap="0" minWidth="0">
          <Text
            size="1"
            weight={self ? 'bold' : 'regular'}
            color={self ? 'indigo' : undefined}
            style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {displayName}
          </Text>
          {birthYear && (
            <Text size="1" color="gray">
              b. {birthYear}
            </Text>
          )}
        </Flex>
      </Flex>
    </Link>
  );
}

/** Placeholder chip for an unknown or missing individual. */
export function UnknownPersonChip(): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Flex align="center" gap="2" p="2">
      <Avatar size="1" fallback="?" color="gray" variant="soft" radius="full" />
      <Text size="1" color="gray">
        {t('overview.unknownPerson')}
      </Text>
    </Flex>
  );
}
