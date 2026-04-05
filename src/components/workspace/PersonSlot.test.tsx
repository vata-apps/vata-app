import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PersonSlot, type PersonSlotValue } from './PersonSlot';

// Mock the search function
vi.mock('$db-tree/individuals', () => ({
  searchIndividuals: vi.fn().mockResolvedValue([
    { id: 'I-0001', gender: 'M' },
    { id: 'I-0002', gender: 'F' },
  ]),
}));

vi.mock('$db-tree/names', () => ({
  getPrimaryName: vi.fn().mockImplementation((id: string) => {
    if (id === 'I-0001') return Promise.resolve({ givenNames: 'Joseph', surname: 'Dupont' });
    if (id === 'I-0002') return Promise.resolve({ givenNames: 'Marie', surname: 'Dupont' });
    return Promise.resolve(null);
  }),
  formatName: vi.fn().mockImplementation((name) => {
    if (!name) return { full: 'Unknown' };
    return { full: `${name.givenNames} ${name.surname}` };
  }),
}));

describe('PersonSlot', () => {
  it('renders with label', () => {
    render(<PersonSlot label="Husband" onChange={vi.fn()} />);
    expect(screen.getByText('Husband')).toBeDefined();
  });

  it('shows search input when empty', () => {
    render(<PersonSlot label="Husband" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Search or type name...')).toBeDefined();
  });

  it('shows filled state when value is provided', () => {
    const value: PersonSlotValue = {
      type: 'existing',
      id: 'I-0001',
      displayName: 'Joseph Dupont',
    };
    render(<PersonSlot label="Husband" value={value} onChange={vi.fn()} />);
    expect(screen.getByText('Joseph Dupont')).toBeDefined();
  });

  it('calls onChange with null when X is clicked on filled slot', () => {
    const onChange = vi.fn();
    const value: PersonSlotValue = {
      type: 'existing',
      id: 'I-0001',
      displayName: 'Joseph Dupont',
    };
    render(<PersonSlot label="Husband" value={value} onChange={onChange} />);
    fireEvent.click(screen.getByText('\u2715'));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
