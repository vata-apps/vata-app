import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from './button';

describe('Button', () => {
  it('renders its label text', () => {
    render(<Button>Save person</Button>);
    expect(screen.getByRole('button', { name: 'Save person' })).toBeInTheDocument();
  });

  it('fires onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards type and form attributes', () => {
    render(
      <Button type="submit" form="my-form">
        Submit
      </Button>
    );
    const btn = screen.getByRole('button', { name: 'Submit' });
    expect(btn).toHaveAttribute('type', 'submit');
    expect(btn).toHaveAttribute('form', 'my-form');
  });

  it('exposes aria-label for icon variant', () => {
    render(
      <Button variant="icon" aria-label="Close dialog">
        ×
      </Button>
    );
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
  });

  it('renders all variants without throwing', () => {
    const variants = ['solid', 'ghost', 'danger', 'icon', 'add'] as const;
    for (const variant of variants) {
      render(<Button variant={variant}>Label</Button>);
    }
    expect(screen.getAllByRole('button', { name: 'Label' })).toHaveLength(variants.length);
  });
});
