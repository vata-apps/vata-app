import type { Meta, StoryObj } from '@storybook/react-vite';

import { Icon } from '$components/icon';
import { Button } from './button';

const VARIANTS = ['solid', 'ghost', 'danger', 'dashed'] as const;

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { children: 'Save person' },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Solid: Story = { args: { variant: 'solid' } };

export const Ghost: Story = { args: { variant: 'ghost', children: 'Cancel' } };

export const Danger: Story = { args: { variant: 'danger', children: 'Discard changes' } };

export const Dashed: Story = { args: { variant: 'dashed', children: 'Add another name' } };

export const Disabled: Story = { args: { disabled: true } };

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Icon name="plus" size={14} />
        Add person
      </>
    ),
  },
};

/** Every variant side by side for a visual pass against the design system. */
export const Matrix: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12 }}>
      {VARIANTS.map((variant) => (
        <Button {...args} key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};
