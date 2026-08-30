import type { Meta, StoryObj } from '@storybook/react-vite';

import { Avatar } from './avatar';

const meta = {
  title: 'UI/Avatar',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Styled Base UI Avatar assembly. `Root` sizes and tones the circle; `Image` ' +
          'fills it and falls back to `Fallback` (a monogram) when absent or failing to load.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

type Story = StoryObj;

// A self-contained placeholder portrait so the story needs no network.
const PORTRAIT =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
      <rect width="120" height="120" fill="#8a8a8a"/>
      <circle cx="60" cy="46" r="22" fill="#e5e5e5"/>
      <path d="M18 116c0-24 19-38 42-38s42 14 42 38z" fill="#e5e5e5"/>
    </svg>`
  );

export const WithImage: Story = {
  render: () => (
    <Avatar.Root size="lg">
      <Avatar.Image src={PORTRAIT} alt="Marie-Louise Gagnon" />
      <Avatar.Fallback>MG</Avatar.Fallback>
    </Avatar.Root>
  ),
};

/** No `Image` (or a broken `src`) — Base UI swaps in the monogram. */
export const MonogramFallback: Story = {
  render: () => (
    <Avatar.Root size="lg">
      <Avatar.Fallback>MG</Avatar.Fallback>
    </Avatar.Root>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Avatar.Root key={size} size={size}>
          <Avatar.Fallback>MG</Avatar.Fallback>
        </Avatar.Root>
      ))}
    </div>
  ),
};

/** `brand` (tinted, default) for a person; `neutral` for a subordinate reference. */
export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Avatar.Root size="lg" tone="brand">
        <Avatar.Fallback>MG</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="lg" tone="neutral">
        <Avatar.Fallback>MG</Avatar.Fallback>
      </Avatar.Root>
    </div>
  ),
};
