import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { withRouter } from '$/test/story-router';

import { TreeNav } from './tree-nav';

const meta = {
  title: 'App/TreeNav',
  component: TreeNav,
  tags: ['autodocs'],
  decorators: [withRouter],
  parameters: { layout: 'padded', routerPath: '/tree/demo/' },
} satisfies Meta<typeof TreeNav>;

export default meta;
type Story = StoryObj<typeof meta>;

const SECTION_LABELS = ['Home', 'People', 'Families', 'Sources', 'Repositories'];

/** The five section icons; Home is active on the bare tree path. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const name of SECTION_LABELS) {
      await expect(await canvas.findByRole('link', { name })).toBeInTheDocument();
    }
    await expect(await canvas.findByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  },
};

/** On a section list route, that section's icon is highlighted. */
export const ActiveOnListRoute: Story = {
  parameters: { routerPath: '/tree/demo/individuals' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('link', { name: 'People' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    await expect(await canvas.findByRole('link', { name: 'Home' })).not.toHaveAttribute(
      'aria-current'
    );
  },
};

/** A detail route highlights its section's icon (individual detail → People). */
export const ActiveOnDetailRoute: Story = {
  parameters: { routerPath: '/tree/demo/individual/I-0001' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('link', { name: 'People' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  },
};

/** Clicking an icon navigates: the clicked section becomes the active one. */
export const NavigatesOnClick: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('link', { name: 'Families' }));
    await expect(await canvas.findByRole('link', { name: 'Families' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  },
};
