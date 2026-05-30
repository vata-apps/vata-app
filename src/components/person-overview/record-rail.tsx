import { Avatar, Button, Card, Flex, Grid, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { Icon } from '$components/icon';
import type { OverviewFigures, OverviewMarriageInfo, OverviewParent } from './overview-mock';

interface RecordRailProps {
  figures: OverviewFigures;
  parents: OverviewParent[];
  marriage: OverviewMarriageInfo;
}

/**
 * The left record rail of the Person Overview: a figures strip, the parents
 * panel, and the quick-actions panel.
 */
export function RecordRail({ figures, parents, marriage }: RecordRailProps): JSX.Element {
  return (
    <Flex direction="column" gap="4">
      <FiguresStrip figures={figures} />
      <ParentsPanel parents={parents} marriage={marriage} />
      <QuickActions />
    </Flex>
  );
}

function FiguresStrip({ figures }: { figures: OverviewFigures }): JSX.Element {
  const { t } = useTranslation('individuals');
  const items: Array<[number, string]> = [
    [figures.events, t('overview.figures.events')],
    [figures.relations, t('overview.figures.relations')],
    [figures.sources, t('overview.figures.sources')],
    [figures.media, t('overview.figures.media')],
  ];
  return (
    <Grid
      columns="2"
      gapX="3"
      gapY="2"
      px="3"
      py="3"
      style={{
        background: 'var(--gray-3)',
        border: '1px solid var(--gray-a5)',
        borderRadius: 'var(--radius-3)',
      }}
    >
      {items.map(([value, label]) => (
        <Flex key={label} align="baseline" gap="1" minWidth="0">
          <Text size="3" weight="medium">
            {value}
          </Text>
          <Text size="2" color="gray" truncate>
            {label}
          </Text>
        </Flex>
      ))}
    </Grid>
  );
}

function ParentsPanel({
  parents,
  marriage,
}: {
  parents: OverviewParent[];
  marriage: OverviewMarriageInfo;
}): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Card>
      <Flex direction="column" gap="3">
        <Text className="mono-label" size="1" color="gray">
          {t('overview.parents.title')}
        </Text>
        {parents.map((parent) => (
          <Flex key={parent.name} align="center" gap="3">
            <Avatar variant="solid" radius="full" size="2" fallback={parent.initials} />
            <Flex direction="column">
              <Text size="3">{parent.name}</Text>
              <Text size="1" style={{ color: 'var(--gray-10)' }}>
                b. {parent.bornYear}
              </Text>
            </Flex>
          </Flex>
        ))}
        <Flex align="center" gap="2" wrap="wrap">
          <Text size="2" color="gray">
            {marriage.label}
          </Text>
          <Text size="2" style={{ color: 'var(--gray-9)' }}>
            ·
          </Text>
          <Text size="2" color="teal">
            {marriage.place}
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
}

function QuickActions(): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Card>
      <Flex direction="column" gap="3">
        <Text size="4" weight="medium" style={{ color: 'var(--accent-11)' }}>
          {t('overview.quickActions.title')}
        </Text>
        <Button size="3" style={{ width: '100%' }}>
          <Icon name="plus" size={16} />
          {t('overview.quickActions.addEvent')}
        </Button>
        <Grid columns="2" gap="2">
          <Button variant="soft" color="gray" style={{ width: '100%' }}>
            <Icon name="file-text" size={16} />
            {t('overview.quickActions.addSource')}
          </Button>
          <Button variant="soft" color="gray" style={{ width: '100%' }}>
            <Icon name="image" size={16} />
            {t('overview.quickActions.addMedia')}
          </Button>
        </Grid>
        <Button variant="soft" color="gray" style={{ width: '100%' }}>
          <Icon name="pencil" size={16} />
          {t('overview.quickActions.addNote')}
        </Button>
      </Flex>
    </Card>
  );
}
