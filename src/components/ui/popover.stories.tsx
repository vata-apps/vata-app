import type { Meta, StoryObj } from '@storybook/react-vite';

import { Icon } from '$components/icon';
import { Button } from './button/button';
import { Popover } from './popover';
import { Typography } from './typography';

const meta = {
  title: 'UI/Popover',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Styled Base UI Popover assembly — `Root`, `Trigger`, `Portal`, `Positioner`, ' +
          '`Popup`, and `Close` (an icon-button-styled close trigger).',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Popover.Root>
      <Popover.Trigger render={<Button>Column options</Button>} />
      <Popover.Portal>
        <Popover.Positioner sideOffset={6}>
          <Popover.Popup style={{ width: 220, padding: 12 }}>
            <Typography as="p" size="sm" tone="muted">
              Choose which columns are visible in the people table.
            </Typography>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  ),
};

/** With the `Close` affordance pinned in the corner. */
export const WithClose: Story = {
  render: () => (
    <Popover.Root>
      <Popover.Trigger render={<Button>Details</Button>} />
      <Popover.Portal>
        <Popover.Positioner sideOffset={6}>
          <Popover.Popup
            style={{
              width: 260,
              padding: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              justifyContent: 'space-between',
            }}
          >
            <Typography as="p" size="sm">
              Saint-Roch-des-Aulnaies, Québec
            </Typography>
            <Popover.Close aria-label="Close">
              <Icon name="x" size={14} />
            </Popover.Close>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  ),
};
