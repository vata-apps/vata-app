import type { Meta, StoryObj } from '@storybook/react-vite';

import { Field } from './field';
import { TextField } from './text-field';

const meta = {
  title: 'UI/Field',
  component: Field,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Pass `htmlFor` matching the control's `id` to wire the label. */
export const WithLabel: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Field label="Given name" htmlFor="given-name">
        <TextField id="given-name" defaultValue="Marie-Louise" />
      </Field>
    </div>
  ),
};

export const NoLabel: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Field>
        <TextField aria-label="Given name" placeholder="Given name" />
      </Field>
    </div>
  ),
};
