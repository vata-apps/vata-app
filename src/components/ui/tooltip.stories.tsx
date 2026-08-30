import type { Meta, StoryObj } from '@storybook/react-vite';

import { Icon } from '$components/icon';
import { IconButton } from './icon-button';
import { Tooltip } from './tooltip';

const meta = {
  title: 'UI/Tooltip',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Styled Base UI Tooltip assembly. Wrap one trigger per `Root`. There is no shared ' +
          '`Provider` yet, so tooltips do not share an open delay across a group.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

type Story = StoryObj;

/** `defaultOpen` keeps it visible for the docs snapshot; normally it opens on hover/focus. */
export const Default: Story = {
  render: () => (
    <div style={{ padding: 48 }}>
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger
          render={
            <IconButton aria-label="Edit person">
              <Icon name="pencil" size={14} />
            </IconButton>
          }
        />
        <Tooltip.Portal>
          <Tooltip.Positioner side="top" sideOffset={6}>
            <Tooltip.Popup>Edit person</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </div>
  ),
};

export const OnHover: Story = {
  render: () => (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <IconButton aria-label="Delete name">
            <Icon name="trash" size={14} />
          </IconButton>
        }
      />
      <Tooltip.Portal>
        <Tooltip.Positioner side="right" sideOffset={6}>
          <Tooltip.Popup>Delete name</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  ),
};
