import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Switch } from './switch';

describe('Switch', () => {
  it('toggles on click', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(
      <Switch.Root checked={false} aria-label="Deceased" onCheckedChange={onCheckedChange}>
        <Switch.Thumb />
      </Switch.Root>
    );

    const switchControl = screen.getByRole('switch', { name: 'Deceased' });
    expect(switchControl).toHaveAttribute('aria-checked', 'false');

    await user.click(switchControl);
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(
      <Switch.Root checked={false} aria-label="Deceased" disabled onCheckedChange={onCheckedChange}>
        <Switch.Thumb />
      </Switch.Root>
    );

    const switchControl = screen.getByRole('switch', { name: 'Deceased' });
    expect(switchControl).toHaveAttribute('aria-disabled', 'true');

    await user.click(switchControl);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
