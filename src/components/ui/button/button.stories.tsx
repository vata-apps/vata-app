import type { Meta, StoryObj } from '@storybook/react-vite';

import { Icon } from '$components/icon';
import { Button, BUTTON_SIZES, BUTTON_VARIANTS } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { children: 'Save person' },
  argTypes: {
    disabled: { control: 'boolean' },
    size: { control: 'inline-radio', options: BUTTON_SIZES },
    variant: { control: 'inline-radio', options: BUTTON_VARIANTS },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary' } };

export const Disabled: Story = { args: { disabled: true } };

export const Md: Story = { args: { size: 'md' } };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        {BUTTON_VARIANTS.map((variant) => (
          <Button {...args} key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {BUTTON_VARIANTS.map((variant) => (
          <Button {...args} key={variant} disabled variant={variant}>
            {variant}
          </Button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {BUTTON_SIZES.map((size) => (
          <div key={size}>
            <Button {...args} size={size}>
              {size}
            </Button>
          </div>
        ))}
      </div>
    </div>
  ),
};
