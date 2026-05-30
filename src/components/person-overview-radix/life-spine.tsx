import { Avatar, Badge, Button, Card, Flex, Heading, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import type { OverviewChild, OverviewMilestone } from './overview-mock';

/**
 * The life spine — a vertical chronology of a person's milestones. Pure
 * `@radix-ui/themes`: each milestone is a `Card` stamped with a year `Badge`.
 * The PoC's custom timeline rail and milestone glyph circles are dropped, as
 * Radix has no primitive for them.
 */
export function LifeSpine({ milestones }: { milestones: OverviewMilestone[] }): JSX.Element {
  return (
    <Flex direction="column" gap="3">
      {milestones.map((milestone) => (
        <Milestone key={milestone.id} milestone={milestone} />
      ))}
    </Flex>
  );
}

function Milestone({ milestone }: { milestone: OverviewMilestone }): JSX.Element {
  const { t } = useTranslation('individuals');
  let title = milestone.title;
  if (milestone.kind === 'born') title = t('overview.milestone.born');
  else if (milestone.kind === 'death') title = t('overview.milestone.died');

  return (
    <Card>
      <Flex direction="column" gap="2">
        <Flex align="center" gap="3">
          <Badge variant="soft" radius="full" size="2">
            {milestone.year}
          </Badge>
          <Heading size="3" truncate>
            {title}
          </Heading>
          <Flex flexGrow="1" />
          <Text size="2" color="teal">
            {milestone.place}
          </Text>
          <Flex align="center" gap="1">
            <Button size="1" variant="soft" color="gray">
              {t('overview.editAction')}
            </Button>
            <Button size="1" variant="soft" color="gray">
              {t('overview.deleteAction')}
            </Button>
          </Flex>
        </Flex>

        <Text size="2" color="gray">
          {milestone.detail}
        </Text>

        {milestone.children && milestone.children.length > 0 && (
          <Flex gap="2" wrap="wrap" pt="2">
            {milestone.children.map((child, i) => (
              <ChildChip key={`${child.name}-${i}`} child={child} />
            ))}
          </Flex>
        )}
      </Flex>
    </Card>
  );
}

function ChildChip({ child }: { child: OverviewChild }): JSX.Element {
  return (
    <Badge variant="soft" color="gray" radius="full" size="2">
      <Avatar variant="soft" radius="full" size="1" fallback={child.initials} />
      {child.name}
    </Badge>
  );
}
