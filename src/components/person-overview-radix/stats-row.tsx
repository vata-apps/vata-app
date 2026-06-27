import { Card, Flex, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import type { PersonStats } from '$db-tree/person-stats';

const STAT_KEYS = ['events', 'relations', 'generationsUp', 'generationsDown'] as const;

/**
 * The headline stats row: a box per count (events, relations, ancestral and
 * descendant generations). Click-through jumps are deferred until the target
 * tabs exist, so the boxes are read-only for now. `sources` and `media` are
 * omitted — those roll-ups have no individual-scoped data yet.
 */
export function StatsRow({ stats }: { stats: PersonStats }): JSX.Element {
  const { t } = useTranslation('individuals');

  return (
    <Flex gap="3" wrap="wrap">
      {STAT_KEYS.map((key) => (
        <Card key={key} style={{ minWidth: 96 }}>
          <Flex direction="column" gap="1">
            <Text size="6" weight="bold">
              {stats[key]}
            </Text>
            <Text size="1" color="gray">
              {t(`overview.stats.${key}`)}
            </Text>
          </Flex>
        </Card>
      ))}
    </Flex>
  );
}
