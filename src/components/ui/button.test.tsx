import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('renders its text content as an accessible button', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('calls onClick when the user clicks it', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Save</Button>);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button disabled onClick={handleClick}>
        Save
      </Button>
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('defaults to type="button" so it does not submit forms unexpectedly', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button');
  });

  it('renders the child element when asChild is set, instead of nesting a button around it', () => {
    render(
      <Button asChild>
        <a href="/somewhere">Go</a>
      </Button>
    );
    expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('href', '/somewhere');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('forwards aria-label so icon-only buttons stay accessible', () => {
    render(<Button aria-label="Close">×</Button>);
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });
});
