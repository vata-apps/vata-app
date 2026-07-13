import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { IconButton } from './icon-button';

describe('IconButton', () => {
  it('renders an icon-only button with an accessible label', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <IconButton aria-label="Close dialog" onClick={onClick}>
        <svg aria-hidden="true">
          <title>Icon</title>
        </svg>
      </IconButton>
    );

    const button = screen.getByRole('button', { name: 'Close dialog' });
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('ignores clicks when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <IconButton aria-label="Remove" disabled onClick={onClick}>
        <svg aria-hidden="true">
          <title>Icon</title>
        </svg>
      </IconButton>
    );

    const button = screen.getByRole('button', { name: 'Remove' });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
