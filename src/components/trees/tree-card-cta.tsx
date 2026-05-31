import { type ReactNode } from 'react';
import { Card, Flex, Text } from '@radix-ui/themes';

import { Icon } from '$components/icon';

/**
 * Props accepted by {@link TreeCardCta}.
 */
export interface TreeCardCtaProps {
  /** Localized title rendered below the plus icon. */
  title: ReactNode;
  /** Optional localized subtitle (e.g., "Or drop a .ged file"). */
  subtitle?: ReactNode;
  /** Called when the tile is clicked. */
  onClick: () => void;
}

/**
 * CTA tile used as the trailing cell of the trees grid to trigger
 * "Add a new tree". Renders as a `<button>` inside an interactive Card
 * so it is keyboard-focusable and announced as a button.
 *
 * @example
 * <TreeCardCta
 *   title={t('cta.title')}
 *   subtitle={t('cta.subtitle')}
 *   onClick={() => openCreateDialog()}
 * />
 */
export function TreeCardCta({ title, subtitle, onClick }: TreeCardCtaProps): JSX.Element {
  return (
    <Card asChild variant="surface" size="3" style={{ minHeight: 240, width: '100%' }}>
      <button type="button" onClick={onClick}>
        <Flex direction="column" align="center" justify="center" gap="3" height="100%">
          <Flex
            align="center"
            justify="center"
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              border: '1px dashed var(--accent-a7)',
              color: 'var(--accent-a11)',
            }}
          >
            <Icon name="plus" size={24} />
          </Flex>
          <Flex direction="column" align="center" gap="1">
            <Text size="2" weight="medium">
              {title}
            </Text>
            {subtitle && (
              <Text size="1" color="gray">
                {subtitle}
              </Text>
            )}
          </Flex>
        </Flex>
      </button>
    </Card>
  );
}
