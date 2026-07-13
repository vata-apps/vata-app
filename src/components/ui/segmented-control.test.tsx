import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SegmentedControl } from './segmented-control';

const OPTIONS = [
  { value: 'F', label: 'Female' },
  { value: 'M', label: 'Male' },
  { value: 'U', label: 'Unknown' },
];

describe('SegmentedControl', () => {
  it('selects an option when clicked', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <SegmentedControl
        aria-label="Sex"
        value="U"
        onValueChange={onValueChange}
        options={OPTIONS}
      />
    );

    await user.click(screen.getByRole('radio', { name: 'Male' }));
    expect(onValueChange).toHaveBeenCalledWith('M');
  });

  it('marks the current value as checked', () => {
    render(
      <SegmentedControl aria-label="Sex" value="F" onValueChange={vi.fn()} options={OPTIONS} />
    );

    expect(screen.getByRole('radio', { name: 'Female' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Male' })).toHaveAttribute('aria-checked', 'false');
  });

  it('does not select when disabled', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <SegmentedControl
        aria-label="Sex"
        value="U"
        onValueChange={onValueChange}
        options={OPTIONS}
        disabled
      />
    );

    const radio = screen.getByRole('radio', { name: 'Male' });
    expect(radio).toBeDisabled();

    await user.click(radio);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
