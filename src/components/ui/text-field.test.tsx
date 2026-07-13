import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TextField } from './text-field';

describe('TextField', () => {
  it('renders a single-line input and accepts text', async () => {
    const user = userEvent.setup();

    render(<TextField aria-label="Given names" />);

    const input = screen.getByRole('textbox', { name: 'Given names' });
    await user.type(input, 'Jane');

    expect(input).toHaveValue('Jane');
  });

  it('renders a multiline textarea', async () => {
    const user = userEvent.setup();

    render(<TextField multiline aria-label="Notes" />);

    const textarea = screen.getByRole('textbox', { name: 'Notes' });
    await user.type(textarea, 'Line one\nLine two');

    expect(textarea).toHaveValue('Line one\nLine two');
    expect(textarea.tagName.toLowerCase()).toBe('textarea');
  });

  it('forwards disabled so the field cannot be edited', async () => {
    const user = userEvent.setup();

    render(<TextField aria-label="Read-only" disabled value="Locked" onChange={() => {}} />);

    const input = screen.getByRole('textbox', { name: 'Read-only' });
    expect(input).toBeDisabled();

    await user.type(input, 'x');
    expect(input).toHaveValue('Locked');
  });
});
