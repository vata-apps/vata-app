import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Popover } from './popover';

function TestPopover() {
  return (
    <Popover.Root>
      <Popover.Trigger>Open picker</Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner positionMethod="fixed">
          <Popover.Popup>Popover content</Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

describe('Popover', () => {
  it('renders the trigger button', () => {
    render(<TestPopover />);
    expect(screen.getByRole('button', { name: 'Open picker' })).toBeInTheDocument();
  });

  it('opens the popup on trigger click', async () => {
    const user = userEvent.setup();
    render(<TestPopover />);
    await user.click(screen.getByRole('button', { name: 'Open picker' }));
    expect(screen.getByText('Popover content')).toBeInTheDocument();
  });

  it('closes the popup on Escape', async () => {
    const user = userEvent.setup();
    render(<TestPopover />);
    await user.click(screen.getByRole('button', { name: 'Open picker' }));
    expect(screen.getByText('Popover content')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
  });
});
