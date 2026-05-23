import React, { type ReactNode } from 'react';
import { Flex, Text } from '@radix-ui/themes';

import { Icon, type IconName } from '$components/icon';

/** Props accepted by {@link EntityListBody}. */
export interface EntityListBodyProps {
  /**
   * Pre-computed query status. The caller resolves loading/error/empty/ready
   * from its query result so this component has no React Query dependency.
   */
  status: 'loading' | 'error' | 'empty' | 'ready';
  /** Per-entity inner skeleton row geometry, repeated `skeletonCount` times. */
  skeletonRow: ReactNode;
  /** Number of skeleton rows to render while loading. Defaults to `7`. */
  skeletonCount?: number;
  /** Icon shown in the empty state. */
  emptyIcon: IconName;
  /** Translated message shown when the list is empty. */
  emptyMessage: string;
  /** Translated message shown when the query failed. */
  errorMessage: string;
  /** Rendered inside the row-wrapper Flex when status is `'ready'`. */
  children: ReactNode;
}

function ListMessage({ icon, children }: { icon?: IconName; children: ReactNode }): JSX.Element {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap="2"
      px="5"
      py="8"
      style={{ textAlign: 'center' }}
    >
      {icon && <Icon name={icon} size={24} style={{ color: 'var(--gray-8)' }} />}
      <Text size="2" color="gray">
        {children}
      </Text>
    </Flex>
  );
}

/**
 * The shared loading / error / empty / ready state machine for every entity
 * sidebar body. Owns the outer `<Flex>` row-wrapper and the `Array.from`
 * skeleton repetition so neither can drift between entities.
 *
 * The per-entity skeleton geometry, empty icon, and translated messages are
 * supplied by the caller; the state switch and list frame live here.
 */
export function EntityListBody({
  status,
  skeletonRow,
  skeletonCount = 7,
  emptyIcon,
  emptyMessage,
  errorMessage,
  children,
}: EntityListBodyProps): JSX.Element {
  if (status === 'loading') {
    return (
      <Flex direction="column" gap="1" p="2" aria-hidden="true">
        {Array.from({ length: skeletonCount }, (_, index) => (
          <React.Fragment key={index}>{skeletonRow}</React.Fragment>
        ))}
      </Flex>
    );
  }
  if (status === 'error') {
    return <ListMessage>{errorMessage}</ListMessage>;
  }
  if (status === 'empty') {
    return <ListMessage icon={emptyIcon}>{emptyMessage}</ListMessage>;
  }
  return (
    <Flex direction="column" gap="1" p="2">
      {children}
    </Flex>
  );
}
