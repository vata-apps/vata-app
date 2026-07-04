import { Flex, Text } from '@radix-ui/themes';
import type { ReactNode } from 'react';

/** A centered gray status message — loading, error, or empty state for a page or tab. */
export function CenteredMessage({ children }: { children: ReactNode }): JSX.Element {
  return (
    <Flex p="6" justify="center">
      <Text color="gray">{children}</Text>
    </Flex>
  );
}
