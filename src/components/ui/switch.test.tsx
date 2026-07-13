import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Switch } from './switch';

describe('Switch', () => {
  it('renders as a switch', () => {
    render(
      <Switch.Root checked={false} onCheckedChange={() => {}} aria-label="Deceased">
        <Switch.Thumb />
      </Switch.Root>
    );
    expect(screen.getByRole('switch', { name: 'Deceased' })).toBeInTheDocument();
  });

  it('calls onCheckedChange when clicked', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <Switch.Root checked={false} onCheckedChange={onCheckedChange} aria-label="Deceased">
        <Switch.Thumb />
      </Switch.Root>
    );
    await user.click(screen.getByRole('switch', { name: 'Deceased' }));
    expect(onCheckedChange).toHaveBeenCalled();
    expect(onCheckedChange.mock.calls[0][0]).toBe(true);
  });

  it('does not fire onCheckedChange when disabled', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <Switch.Root checked={false} onCheckedChange={onCheckedChange} disabled aria-label="Deceased">
        <Switch.Thumb />
      </Switch.Root>
    );
    await user.click(screen.getByRole('switch', { name: 'Deceased' }));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('reflects checked state via aria-checked', () => {
    render(
      <Switch.Root checked={true} onCheckedChange={() => {}} aria-label="Deceased">
        <Switch.Thumb />
      </Switch.Root>
    );
    expect(screen.getByRole('switch', { name: 'Deceased' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
  });
});
