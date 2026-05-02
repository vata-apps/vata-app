import type { Meta, StoryObj } from '@storybook/react-vite';
import { Fragment } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from './button';
import { iconRegistry } from './icon';

const iconNames = Object.keys(iconRegistry) as Array<keyof typeof iconRegistry>;

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Save',
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'link'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    leadingIcon: {
      control: 'select',
      options: [undefined, ...iconNames],
    },
    trailingIcon: {
      control: 'select',
      options: [undefined, ...iconNames],
    },
    hideLabel: { control: 'boolean' },
    asChild: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const expectAccessibleButton =
  (name: string): NonNullable<Story['play']> =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name })).toBeInTheDocument();
  };

export const Primary: Story = {
  args: { variant: 'primary' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Save' });
    await expect(button).toHaveAttribute('type', 'button');
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
  play: expectAccessibleButton('Save'),
};

export const Outline: Story = {
  args: { variant: 'outline' },
  play: expectAccessibleButton('Save'),
};

export const Ghost: Story = {
  args: { variant: 'ghost' },
  play: expectAccessibleButton('Save'),
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Remove' },
  play: expectAccessibleButton('Remove'),
};

export const Link: Story = {
  args: { variant: 'link', children: 'Read more' },
  play: expectAccessibleButton('Read more'),
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole<HTMLButtonElement>('button', { name: 'Save' });
    await expect(button).toBeDisabled();
  },
};

export const WithLeadingIcon: Story = {
  args: { leadingIcon: 'plus', children: 'Add individual' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Add individual' });
    await expect(button.querySelector('svg')).not.toBeNull();
  },
};

export const WithTrailingIcon: Story = {
  args: { trailingIcon: 'arrow-right', variant: 'secondary', children: 'Continue' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Continue' });
    await expect(button.querySelector('svg')).not.toBeNull();
  },
};

export const IconOnly: Story = {
  args: {
    leadingIcon: 'x',
    hideLabel: true,
    variant: 'ghost',
    children: 'Close dialog',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The accessible name still comes from the (sr-only) children — no aria-label needed.
    await expect(canvas.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
  },
};

export const AsChildLink: Story = {
  render: (args) => (
    <Button {...args} asChild>
      <a href="#example">{args.children}</a>
    </Button>
  ),
  args: { variant: 'outline', children: 'Open link' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Open link' })).toHaveAttribute(
      'href',
      '#example'
    );
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('button')).toHaveLength(variants.length * sizes.length);
  },
};

export const IconMatrix: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="grid grid-cols-[auto_repeat(3,_auto)] items-center gap-x-6 gap-y-3">
      <div />
      {sizes.map((size) => (
        <div key={size} className="text-muted-foreground text-xs uppercase">
          {size}
        </div>
      ))}

      <div className="text-muted-foreground text-xs">leading</div>
      {sizes.map((size) => (
        <Button key={size} size={size} leadingIcon="plus">
          Add
        </Button>
      ))}

      <div className="text-muted-foreground text-xs">trailing</div>
      {sizes.map((size) => (
        <Button key={size} size={size} trailingIcon="arrow-right" variant="secondary">
          Continue
        </Button>
      ))}

      <div className="text-muted-foreground text-xs">icon-only</div>
      {sizes.map((size) => (
        <Button key={size} size={size} leadingIcon="x" hideLabel variant="ghost">
          Close
        </Button>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 3 sizes × 3 rows = 9 buttons; icon-only ones still have an accessible name from sr-only children.
    await expect(canvas.getAllByRole('button')).toHaveLength(sizes.length * 3);
    await expect(canvas.getAllByRole('button', { name: 'Close' })).toHaveLength(sizes.length);
  },
};
