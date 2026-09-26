import type { Meta, StoryObj } from '@storybook/react-vite';

import { toastManager } from '$lib/toast';
import { Button } from './button/button';

const meta = {
  title: 'UI/Toast',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Styled Base UI Toast assembly driven by the module-level `toastManager` ' +
          '(`src/lib/toast.ts`), so non-React code can raise a toast without a hook. ' +
          '`Toast.Provider` / `Toast.Viewport` are mounted once by the Storybook preview.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Success: Story = {
  render: () => (
    <Button
      onClick={() =>
        toastManager.add({ title: 'Person saved', description: 'Marie-Louise Gagnon' })
      }
    >
      Raise a toast
    </Button>
  ),
};

export const Error: Story = {
  render: () => (
    <Button
      onClick={() =>
        toastManager.add({
          type: 'error',
          title: 'Save failed',
          description: 'The record was modified by another change.',
        })
      }
    >
      Raise an error toast
    </Button>
  ),
};
