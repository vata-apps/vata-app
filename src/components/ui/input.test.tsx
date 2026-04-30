import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

function ControlledInput(): JSX.Element {
  const [value, setValue] = useState('');
  return (
    <>
      <label htmlFor="name">Name</label>
      <Input id="name" value={value} onChange={(e) => setValue(e.target.value)} />
    </>
  );
}

describe('Input', () => {
  it('is reachable through its associated label', () => {
    render(
      <>
        <label htmlFor="name">Name</label>
        <Input id="name" />
      </>
    );
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('updates its value as the user types (controlled)', async () => {
    const user = userEvent.setup();
    render(<ControlledInput />);
    const input = screen.getByLabelText<HTMLInputElement>('Name');
    await user.type(input, 'Maria');
    expect(input.value).toBe('Maria');
  });

  it('renders the placeholder text', () => {
    render(<Input placeholder="Enter name" />);
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
  });

  it('does not accept typing when disabled', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Input aria-label="Name" disabled onChange={handleChange} />);
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: 'Name' });
    await user.type(input, 'Maria');
    expect(input.value).toBe('');
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('marks itself as invalid for assistive tech when invalid is set', () => {
    render(<Input aria-label="Name" invalid />);
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute('aria-invalid', 'true');
  });

  it('honors the type prop for non-text variants', () => {
    render(<Input aria-label="Email" type="email" />);
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('type', 'email');
  });
});
