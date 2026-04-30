import { Fragment } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Save',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'link'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'icon'],
    },
    asChild: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: 'primary' },
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Outline: Story = {
  args: { variant: 'outline' },
};

export const Ghost: Story = {
  args: { variant: 'ghost' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Remove' },
};

export const Link: Story = {
  args: { variant: 'link', children: 'Read more' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const IconOnly: Story = {
  args: {
    size: 'icon',
    variant: 'ghost',
    'aria-label': 'Close',
    children: '×',
  },
};

export const AsChildLink: Story = {
  render: (args) => (
    <Button {...args} asChild>
      <a href="#example">{args.children}</a>
    </Button>
  ),
  args: { variant: 'outline', children: 'Open link' },
};

const variants = ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const;
const sizes = ['sm', 'md', 'lg'] as const;

export const Matrix: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="grid grid-cols-[auto_repeat(3,_minmax(0,_1fr))] items-center gap-3">
      <div />
      {sizes.map((size) => (
        <div key={size} className="text-muted-foreground text-xs uppercase">
          {size}
        </div>
      ))}
      {variants.map((variant) => (
        <Fragment key={variant}>
          <div className="text-muted-foreground text-xs">{variant}</div>
          {sizes.map((size) => (
            <div key={size}>
              <Button variant={variant} size={size}>
                {variant}
              </Button>
            </div>
          ))}
        </Fragment>
      ))}
    </div>
  ),
};
