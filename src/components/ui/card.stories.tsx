import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from './badge';
import { Card, PanelHead } from './card';
import { Typography } from './typography';

const meta = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    layout: { control: 'inline-radio', options: ['box', 'sectioned'] },
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

/** `layout="box"` (default) — the card is padded, the consumer fills it. */
export const Box: Story = {
  args: {
    layout: 'box',
    style: { maxWidth: 420 },
    children: (
      <>
        <Typography as="h2" size="md" weight="strong">
          Vital record
        </Typography>
        <Typography as="p" size="sm" tone="muted" style={{ marginTop: 8 }}>
          Born 12 March 1847 in Saint-Roch-des-Aulnaies, Québec. Baptised two days later at the
          parish church.
        </Typography>
      </>
    ),
  },
};

/** `layout="sectioned"` — no padding of its own, so `PanelHead` and rows span edge to edge. */
export const Sectioned: Story = {
  render: () => (
    <Card layout="sectioned" style={{ maxWidth: 420 }}>
      <PanelHead title="Names">
        <Badge>3</Badge>
      </PanelHead>
      <div style={{ padding: '10px 16px' }}>Marie-Louise Gagnon — birth name</div>
      <div style={{ padding: '10px 16px' }}>Marie-Louise Bélanger — married name</div>
      <div style={{ padding: '10px 16px' }}>Mary Gagnon — anglicised</div>
    </Card>
  ),
};
