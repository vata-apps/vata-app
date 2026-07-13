import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { Icon } from '$components/icon';
import { Select } from './select';

const OPTIONS = [
  { value: 'birth', label: 'Birth' },
  { value: 'married', label: 'Married' },
  { value: 'aka', label: 'Also Known As' },
];

function TestSelect({ onValueChange = vi.fn(), disabled = false }) {
  const [value, setValue] = useState('birth');
  return (
    <Select.Root
      value={value}
      disabled={disabled}
      onValueChange={(next) => {
        if (next !== null) {
          setValue(next);
          onValueChange(next);
        }
      }}
    >
      <Select.Trigger aria-label="Name type">
        <Select.Value />
        <Select.Icon>
          <Icon name="chevron-down" size={12} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={4} positionMethod="fixed">
          <Select.Popup>
            {OPTIONS.map((o) => (
              <Select.Item key={o.value} value={o.value}>
                <Select.ItemText>{o.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

describe('Select', () => {
  it('opens the popup on trigger click', async () => {
    const user = userEvent.setup();
    render(<TestSelect />);
    await user.click(screen.getByRole('combobox', { name: 'Name type' }));
    expect(screen.getByRole('option', { name: 'Married' })).toBeInTheDocument();
  });

  it('selects an option and fires onValueChange', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TestSelect onValueChange={onValueChange} />);
    await user.click(screen.getByRole('combobox', { name: 'Name type' }));
    await user.click(await screen.findByRole('option', { name: 'Married' }));
    expect(onValueChange).toHaveBeenCalledWith('married');
  });

  it('disables the trigger when disabled is true', () => {
    render(<TestSelect disabled />);
    expect(screen.getByRole('combobox', { name: 'Name type' })).toBeDisabled();
  });
});
