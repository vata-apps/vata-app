import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { SegmentedControl } from './segmented-control';

// Generic + all-required props → bare `Meta`, wrapper-driven stories (see docs/ui/storybook.md).
const meta = {
  title: 'UI/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

type Story = StoryObj;

type Gender = 'male' | 'female' | 'unknown';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'unknown', label: 'Unknown' },
] as const;

function GenderPicker({ disabled }: { disabled?: boolean }) {
  const [value, setValue] = useState<Gender>('female');
  return (
    <SegmentedControl<Gender>
      aria-label="Gender"
      value={value}
      onValueChange={setValue}
      options={GENDER_OPTIONS}
      disabled={disabled}
    />
  );
}

export const SexSelector: Story = { render: () => <GenderPicker /> };

export const Disabled: Story = { render: () => <GenderPicker disabled /> };
