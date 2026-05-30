import { Avatar, Box, Card, Flex, Grid, IconButton, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { Icon } from '$components/icon';
import type { OverviewChild, OverviewMilestone } from './overview-mock';

/**
 * The life spine — a vertical chronology of a person's milestones, each a
 * year-stamped card on a connected timeline rail.
 */
export function LifeSpine({ milestones }: { milestones: OverviewMilestone[] }): JSX.Element {
  return (
    <Flex direction="column">
      {milestones.map((milestone, i) => (
        <Milestone key={milestone.id} milestone={milestone} isLast={i === milestones.length - 1} />
      ))}
    </Flex>
  );
}

function Milestone({
  milestone,
  isLast,
}: {
  milestone: OverviewMilestone;
  isLast: boolean;
}): JSX.Element {
  const { t } = useTranslation('individuals');
  let title = milestone.title;
  if (milestone.kind === 'born') title = t('overview.milestone.born');
  else if (milestone.kind === 'death') title = t('overview.milestone.died');

  return (
    <Flex align="stretch" gap="2">
      <Box width="48px" flexShrink="0" pt="1">
        <Text size="3" weight="medium" align="right" as="div">
          {milestone.year}
        </Text>
      </Box>

      <Flex direction="column" align="center" width="24px" flexShrink="0" pt="1">
        <Box
          width="14px"
          height="14px"
          flexShrink="0"
          style={{
            borderRadius: '50%',
            border: '2px solid var(--accent-9)',
            background: milestone.emphasised ? 'var(--accent-9)' : 'var(--color-background)',
          }}
        />
        {!isLast && (
          <Box flexGrow="1" width="2px" mt="1" style={{ background: 'var(--accent-8)' }} />
        )}
      </Flex>

      <Box flexGrow="1" pb={isLast ? '0' : '5'} minWidth="0">
        <Card>
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <Flex
                align="center"
                justify="center"
                width="30px"
                height="30px"
                flexShrink="0"
                style={{ borderRadius: '50%', background: 'var(--gray-3)' }}
              >
                <Icon name={milestone.icon} size={15} style={{ color: 'var(--accent-11)' }} />
              </Flex>
              <Text size="4" weight="medium" truncate>
                {title}
              </Text>
              <Box flexGrow="1" />
              <Flex align="center" gap="1" flexShrink="0">
                <Icon name="map-pin" size={13} style={{ color: 'var(--teal-11)' }} />
                <Text size="2" color="teal">
                  {milestone.place}
                </Text>
              </Flex>
              <Flex align="center" gap="1" flexShrink="0">
                <IconButton
                  size="1"
                  variant="soft"
                  color="gray"
                  aria-label={t('overview.editAction')}
                >
                  <Icon name="pencil" size={13} />
                </IconButton>
                <IconButton
                  size="1"
                  variant="soft"
                  color="gray"
                  aria-label={t('overview.deleteAction')}
                >
                  <Icon name="trash" size={13} />
                </IconButton>
              </Flex>
            </Flex>

            <Text size="2" color="gray">
              {milestone.detail}
            </Text>

            {milestone.children && milestone.children.length > 0 && (
              <Box pt="2" mt="1" style={{ borderTop: '1px solid var(--gray-a5)' }}>
                <Grid columns="4" gap="2">
                  {milestone.children.map((child, i) => (
                    <ChildChip key={`${child.name}-${i}`} child={child} />
                  ))}
                </Grid>
              </Box>
            )}
          </Flex>
        </Card>
      </Box>
    </Flex>
  );
}

function ChildChip({ child }: { child: OverviewChild }): JSX.Element {
  return (
    <Flex
      align="center"
      gap="2"
      px="2"
      py="1"
      minWidth="0"
      style={{ background: 'var(--gray-3)', borderRadius: 'var(--radius-3)' }}
    >
      <Avatar variant="soft" radius="full" size="1" fallback={child.initials} />
      <Text size="1" truncate>
        {child.name}
      </Text>
    </Flex>
  );
}
