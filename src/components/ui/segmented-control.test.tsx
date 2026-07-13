import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SegmentedControl } from './segmented-control';

function renderControl(value: string, onValueChange = vi.fn()) {
  render(
    <SegmentedControl.Root value={value} onValueChange={onValueChange} aria-label="Sex">
      <SegmentedControl.Item value="F">Female</SegmentedControl.Item>
      <SegmentedControl.Item value="M">Male</SegmentedControl.Item>
      <SegmentedControl.Item value="U">Unknown</SegmentedControl.Item>
    </SegmentedControl.Root>
  );
  return { onValueChange };
}

describe('SegmentedControl', () => {
  it('renders all items', () => {
    renderControl('U');
    expect(screen.getByRole('radio', { name: 'Female' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Male' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Unknown' })).toBeInTheDocument();
  });

  it('marks the active item as checked', () => {
    renderControl('M');
    expect(screen.getByRole('radio', { name: 'Male' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Female' })).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onValueChange with the clicked item value', async () => {
    const user = userEvent.setup();
    const { onValueChange } = renderControl('U');
    await user.click(screen.getByRole('radio', { name: 'Female' }));
    expect(onValueChange).toHaveBeenCalledWith('F');
  });

  it('disables all items when Root receives disabled', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SegmentedControl.Root value="U" onValueChange={onValueChange} aria-label="Sex" disabled>
        <SegmentedControl.Item value="F">Female</SegmentedControl.Item>
      </SegmentedControl.Root>
    );
    await user.click(screen.getByRole('radio', { name: 'Female' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
