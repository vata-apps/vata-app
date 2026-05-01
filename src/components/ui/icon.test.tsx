import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Icon } from './icon';

describe('Icon', () => {
  it('renders an SVG for the requested icon', () => {
    const { container } = render(<Icon name="plus" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('hides itself from assistive tech by default', () => {
    const { container } = render(<Icon name="plus" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('can be made accessible by overriding aria-hidden and providing a label', () => {
    const { container } = render(<Icon name="search" aria-hidden={false} aria-label="Search" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-label', 'Search');
    expect(svg).not.toHaveAttribute('aria-hidden', 'true');
  });

  it('honours the size prop in pixel dimensions', () => {
    const { container } = render(<Icon name="plus" size={24} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('renders a different icon when name changes', () => {
    const { container, rerender } = render(<Icon name="plus" />);
    const first = container.querySelector('svg')?.outerHTML;
    rerender(<Icon name="trash" />);
    const second = container.querySelector('svg')?.outerHTML;
    expect(first).not.toEqual(second);
  });
});
