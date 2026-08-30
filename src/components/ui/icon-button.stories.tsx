import type { Meta, StoryObj } from '@storybook/react-vite';

import { Icon } from '$components/icon';
import { IconButton } from './icon-button';

const meta = {
  title: 'UI/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    'aria-label': 'Remove name',
    children: <Icon name="x" size={14} />,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['md', 'lg'] },
  },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** `md` (32px) — a row action. */
export const Md: Story = { args: { size: 'md' } };

/** `lg` (38px) — a navigation-rail item. */
export const Lg: Story = {
  args: { size: 'lg', 'aria-label': 'People', children: <Icon name="users" size={18} /> },
};

/** `active` marks the current selection, e.g. the open nav section. */
export const Active: Story = {
  args: {
    size: 'lg',
    active: true,
    'aria-label': 'People',
    children: <Icon name="users" size={18} />,
  },
};

export const Disabled: Story = { args: { disabled: true } };

/** `render` applies the styling to another element — here a plain anchor. */
export const AsLink: Story = {
  args: {
    'aria-label': 'Open help',
    render: <a href="https://example.com" />,
    children: <Icon name="circle-help" size={14} />,
  },
};
