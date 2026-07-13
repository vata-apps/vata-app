import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TextField } from './text-field';

describe('TextField', () => {
  it('renders with a placeholder and initial value', () => {
    render(<TextField placeholder="Given names" value="Harry" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Given names')).toHaveValue('Harry');
  });

  it('calls onChange when the user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TextField aria-label="Search" value="" onChange={onChange} />);
    await user.type(screen.getByRole('textbox', { name: 'Search' }), 'A');
    expect(onChange).toHaveBeenCalled();
  });

  it('is disabled when the disabled prop is set', () => {
    render(<TextField aria-label="Surname" disabled value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox', { name: 'Surname' })).toBeDisabled();
  });

  it('renders a textarea when multiline is true', () => {
    render(<TextField multiline aria-label="Notes" value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox', { name: 'Notes' }).tagName).toBe('TEXTAREA');
  });

  it('passes additional className through', () => {
    render(<TextField aria-label="Date" value="" onChange={() => {}} className="extra" />);
    expect(screen.getByRole('textbox', { name: 'Date' })).toHaveClass('extra');
  });
});
