import type { Meta, StoryObj } from '@storybook/react-vite';

import { TextField } from './text-field';

// Discriminated-union props → bare `Meta`, render-driven stories (see docs/ui/storybook.md).
const meta = {
  title: 'UI/TextField',
  component: TextField,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => <TextField aria-label="Given name" placeholder="Given name" />,
};

export const WithValue: Story = {
  render: () => <TextField aria-label="Given name" defaultValue="Marie-Louise" />,
};

export const Disabled: Story = {
  render: () => <TextField aria-label="Given name" defaultValue="Marie-Louise" disabled />,
};

/** `aria-invalid` drives the error treatment from the stylesheet. */
export const Invalid: Story = {
  render: () => <TextField aria-label="Given name" defaultValue="Marie-Louise" aria-invalid />,
};

/** `multiline` renders a `<textarea>`; all native attributes still forward. */
export const Multiline: Story = {
  render: () => (
    <TextField multiline aria-label="Research note" placeholder="Research note…" rows={4} />
  ),
};
