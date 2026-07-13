import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SegmentedControl } from './segmented-control';

const OPTIONS = [
  { value: 'F', label: 'Female' },
  { value: 'M', label: 'Male' },
  { value: 'U', label: 'Unknown' },
];

/** Mirrors how a form drives the control: value comes back down as a prop. */
function ControlledSegmentedControl({ initial = 'F' }: { initial?: string }): JSX.Element {
  const [value, setValue] = useState(initial);
  return (
    <SegmentedControl aria-label="Sex" value={value} onValueChange={setValue} options={OPTIONS} />
  );
}

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

  it('walks every option with the arrow keys, moving focus with the selection', async () => {
    const user = userEvent.setup();
    render(<ControlledSegmentedControl />);

    await user.tab();
    expect(screen.getByRole('radio', { name: 'Female' })).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Male' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Male' })).toHaveFocus();

    // The far option is only reachable if focus followed the first step.
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Unknown' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Unknown' })).toHaveFocus();

    // ArrowRight wraps past the end, and Home jumps back to the first option.
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Female' })).toHaveAttribute('aria-checked', 'true');

    await user.keyboard('{End}');
    expect(screen.getByRole('radio', { name: 'Unknown' })).toHaveAttribute('aria-checked', 'true');

    await user.keyboard('{Home}');
    expect(screen.getByRole('radio', { name: 'Female' })).toHaveAttribute('aria-checked', 'true');
  });

  it('keeps the selected option as the single tab stop', () => {
    render(<ControlledSegmentedControl initial="M" />);

    expect(screen.getByRole('radio', { name: 'Male' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: 'Female' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('radio', { name: 'Unknown' })).toHaveAttribute('tabindex', '-1');
  });
});
