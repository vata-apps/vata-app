import type { Meta, StoryObj } from '@storybook/react-vite';

import { Typography } from './typography';

const meta = {
  title: 'UI/Typography',
  component: Typography,
  tags: ['autodocs'],
  args: { children: 'Marie-Louise Gagnon' },
} satisfies Meta<typeof Typography>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The default: `size="sm"`, `weight="regular"`, `tone="body"`, `family="sans"`. Use the controls to explore. */
export const Default: Story = {};

const SIZES = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] as const;
const WEIGHTS = ['regular', 'medium', 'semibold', 'strong', 'bold'] as const;
const TONES = ['body', 'muted', 'subtle', 'brand', 'danger', 'warn'] as const;

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 8 }}>
      {SIZES.map((size) => (
        <Typography key={size} {...args} size={size}>
          {size} — Marie-Louise Gagnon
        </Typography>
      ))}
    </div>
  ),
};

export const Weights: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 8 }}>
      {WEIGHTS.map((weight) => (
        <Typography key={weight} {...args} size="lg" weight={weight}>
          {weight}
        </Typography>
      ))}
    </div>
  ),
};

export const Tones: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 8 }}>
      {TONES.map((tone) => (
        <Typography key={tone} {...args} size="md" tone={tone}>
          {tone}
        </Typography>
      ))}
    </div>
  ),
};

/** `serif` is reserved for person names, drafts and empty states. */
export const Families: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 8 }}>
      <Typography {...args} size="lg" family="sans">
        sans — IBM Plex Sans (UI / body)
      </Typography>
      <Typography {...args} size="lg" family="serif">
        serif — Spectral (person names, drafts)
      </Typography>
      <Typography {...args} size="lg" family="mono">
        mono — IBM Plex Mono (1847 · N 46.81°)
      </Typography>
    </div>
  ),
};

/** Use `as` to pick the semantic element independently of the visual size. */
export const Semantic: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      <Typography as="h1" size="3xl" weight="bold">
        Heading 1
      </Typography>
      <Typography as="h2" size="xl" weight="strong">
        Heading 2
      </Typography>
      <Typography as="p" size="sm">
        A paragraph of body copy set in IBM Plex Sans at the default size.
      </Typography>
    </div>
  ),
};
