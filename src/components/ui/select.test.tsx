import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Select } from './select';

const OPTIONS = [
  { value: 'birth', label: 'Birth' },
  { value: 'married', label: 'Married' },
  { value: 'other', label: 'Other' },
];

function renderSelect(props: {
  value: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}) {
  return render(
    <Select.Root
      value={props.value}
      disabled={props.disabled}
      onValueChange={(next) => {
        if (next !== null) props.onValueChange?.(next);
      }}
    >
      <Select.Trigger aria-label="Name type">
        <Select.Value />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup>
            {OPTIONS.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

describe('Select', () => {
  it('opens the popup and selects an option with the mouse', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderSelect({ value: 'birth', onValueChange });

    await user.click(screen.getByRole('combobox', { name: 'Name type' }));
    const popup = await screen.findByRole('listbox');

    await user.click(within(popup).getByRole('option', { name: 'Married' }));
    expect(onValueChange).toHaveBeenCalledWith('married');
  });

  it('cannot be opened when disabled', async () => {
    const user = userEvent.setup();

    renderSelect({ value: 'birth', disabled: true });

    const trigger = screen.getByRole('combobox', { name: 'Name type' });
    expect(trigger).toBeDisabled();

    await user.click(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
