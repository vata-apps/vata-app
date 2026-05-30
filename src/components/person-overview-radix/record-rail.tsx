import { Avatar, Button, Card, DataList, Flex, Grid, Heading, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import type { OverviewFigures, OverviewMarriageInfo, OverviewParent } from './overview-mock';

interface RecordRailProps {
  figures: OverviewFigures;
  parents: OverviewParent[];
  marriage: OverviewMarriageInfo;
}

/**
 * The left record rail: a figures strip, the parents panel, and the
 * quick-actions panel. Pure `@radix-ui/themes`: `DataList` for the figures,
 * `Avatar` for parents, and label-only `Button`s for the actions.
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
    <Card>
      <DataList.Root orientation="horizontal" size="2">
        {items.map(([value, label]) => (
          <DataList.Item key={label}>
            <DataList.Label minWidth="0">{label}</DataList.Label>
            <DataList.Value>
              <Text weight="medium">{value}</Text>
            </DataList.Value>
          </DataList.Item>
        ))}
      </DataList.Root>
    </Card>
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
        <Text size="1" color="gray">
          {t('overview.parents.title')}
        </Text>
        {parents.map((parent) => (
          <Flex key={parent.name} align="center" gap="3">
            <Avatar variant="solid" radius="full" size="2" fallback={parent.initials} />
            <Flex direction="column">
              <Text size="3">{parent.name}</Text>
              <Text size="1" color="gray">
                b. {parent.bornYear}
              </Text>
            </Flex>
          </Flex>
        ))}
        <Flex align="center" gap="2" wrap="wrap">
          <Text size="2" color="gray">
            {marriage.label}
          </Text>
          <Text size="2" color="gray">
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
        <Heading size="4">{t('overview.quickActions.title')}</Heading>
        <Button size="3">{t('overview.quickActions.addEvent')}</Button>
        <Grid columns="2" gap="2">
          <Button variant="soft" color="gray">
            {t('overview.quickActions.addSource')}
          </Button>
          <Button variant="soft" color="gray">
            {t('overview.quickActions.addMedia')}
          </Button>
        </Grid>
        <Button variant="soft" color="gray">
          {t('overview.quickActions.addNote')}
        </Button>
      </Flex>
    </Card>
  );
}
