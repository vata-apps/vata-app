import { Box, Flex, Text } from '@radix-ui/themes';

/** A single stat in the {@link EntityStats} row. */
export interface StatItem {
  label: string;
  value: number | string;
  onClick?: () => void;
}

/** Props accepted by {@link EntityStats}. */
export interface EntityStatsProps {
  stats: StatItem[];
}

/**
 * A horizontal row of labeled stat boxes. Each box shows a numeric value and
 * a label; an optional `onClick` makes it a jump point to the detail view.
 *
 * Used by the Person Overview to show event, relation, source, media, and
 * generation counts. Reusable by other entity screens.
 */
export function EntityStats({ stats }: EntityStatsProps): JSX.Element {
  return (
    <Flex
      gap="1"
      mb="5"
      style={{
        borderRadius: 'var(--radius-3)',
        border: '1px solid var(--gray-a4)',
        overflow: 'hidden',
      }}
    >
      {stats.map((stat, index) => (
        <Box
          key={stat.label}
          flexGrow="1"
          p="3"
          style={{
            textAlign: 'center',
            cursor: stat.onClick ? 'pointer' : 'default',
            borderLeft: index > 0 ? '1px solid var(--gray-a4)' : undefined,
            background: stat.onClick ? undefined : undefined,
            transition: 'background 0.1s',
          }}
          onClick={stat.onClick}
          role={stat.onClick ? 'button' : undefined}
          tabIndex={stat.onClick ? 0 : undefined}
          onKeyDown={
            stat.onClick
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') stat.onClick?.();
                }
              : undefined
          }
        >
          <Text as="div" size="5" weight="bold" style={{ lineHeight: 1 }}>
            {stat.value}
          </Text>
          <Text as="div" size="1" color="gray" mt="1">
            {stat.label}
          </Text>
        </Box>
      ))}
    </Flex>
  );
}
