import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { withRouter } from '$/test/story-router';

import { TreeShell } from './tree-shell';

const meta = {
  title: 'App/TreeShell',
  component: TreeShell,
  tags: ['autodocs'],
  decorators: [withRouter],
  parameters: { layout: 'fullscreen', routerPath: '/tree/demo/' },
  args: {
    children: <div className="p-6">Page content</div>,
  },
} satisfies Meta<typeof TreeShell>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The shell: navigation header, left panel, body, right panel. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('navigation')).toBeInTheDocument();
    await expect(await canvas.findByRole('main')).toHaveTextContent('Page content');
  },
};

/** Tall page content scrolls inside the centre column, not the whole window. */
export const WithLongContent: Story = {
  args: {
    children: (
      <div className="p-6">
        {Array.from({ length: 60 }, (_, i) => (
          <p key={i}>Page content line {i + 1}</p>
        ))}
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('main')).toHaveTextContent('Page content line 1');
  },
};
