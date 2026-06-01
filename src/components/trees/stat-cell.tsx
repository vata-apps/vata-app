import { type ReactNode } from 'react';
import { Flex, Text } from '@radix-ui/themes';

/**
 * One cell in a tree modal's stat grid: a bold value over a small, muted
 * label. Shared by the delete / download / import-GEDCOM modals.
 *
 * Pass `color="red"` to tint the value (the delete modal's destructive
 * summary). The label is always muted gray and may be any node — the import
 * scan grid passes a label that embeds a `Soon` badge.
 */
export function StatCell({
  value,
  label,
  color,
}: {
  value: ReactNode;
  label: ReactNode;
  color?: 'red';
}): JSX.Element {
  return (
    <Flex direction="column" gap="1">
      <Text size="5" weight="bold" color={color}>
        {value}
      </Text>
      <Text size="1" weight="medium" color="gray">
        {label}
      </Text>
    </Flex>
  );
}
