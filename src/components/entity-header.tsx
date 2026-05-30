import React, { type ReactNode } from 'react';
import { Badge, Flex, Heading, Text } from '@radix-ui/themes';

/** A single item in the metadata strip below the entity title. */
export interface EntityHeaderMetaItem {
  label: string;
  value: string;
}

/** Props accepted by {@link EntityHeader}. */
export interface EntityHeaderProps {
  /** The main title string. */
  title: string;
  /** Optional chip rendered immediately after the title (e.g. "+3 names"). */
  titleChip?: ReactNode;
  /** Metadata strip items rendered as key·value pairs separated by bullets. */
  meta?: EntityHeaderMetaItem[];
  /** Status badges rendered below the metadata strip. */
  badges?: string[];
}

/**
 * Generic entity page header — title, optional title chip, a metadata strip,
 * and status badges. Used by the Person screen today; reusable by Family,
 * Event, Place, and Source screens later.
 */
export function EntityHeader({
  title,
  titleChip,
  meta = [],
  badges = [],
}: EntityHeaderProps): JSX.Element {
  return (
    <Flex direction="column" gap="2" mb="5">
      <Flex align="baseline" gap="2" wrap="wrap">
        <Heading size="6">{title}</Heading>
        {titleChip}
      </Flex>

      {meta.length > 0 && (
        <Flex align="center" gap="2" wrap="wrap">
          {meta.map((item, index) => (
            <React.Fragment key={item.label}>
              {index > 0 && (
                <Text size="2" color="gray" aria-hidden="true">
                  ·
                </Text>
              )}
              <Text size="2" color="gray">
                <Text as="span" weight="medium">
                  {item.label}
                </Text>{' '}
                {item.value}
              </Text>
            </React.Fragment>
          ))}
        </Flex>
      )}

      {badges.length > 0 && (
        <Flex gap="2" wrap="wrap">
          {badges.map((badge) => (
            <Badge key={badge} variant="soft" color="indigo">
              {badge}
            </Badge>
          ))}
        </Flex>
      )}
    </Flex>
  );
}
