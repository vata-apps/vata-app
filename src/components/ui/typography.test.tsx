import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Typography } from './typography';

describe('Typography', () => {
  it('renders the chosen semantic element via the `as` prop', () => {
    render(<Typography as="h2">Heading</Typography>);

    const heading = screen.getByRole('heading', { name: 'Heading', level: 2 });
    expect(heading).toBeInTheDocument();
  });

  it('renders as a span by default', () => {
    render(<Typography>Plain text</Typography>);

    expect(screen.getByText('Plain text').tagName.toLowerCase()).toBe('span');
  });

  it('forwards native attributes and a custom class name', () => {
    render(
      <Typography as="p" className="extra-class" data-extra="true">
        Content
      </Typography>
    );

    const element = screen.getByText('Content');
    expect(element).toHaveAttribute('data-extra', 'true');
  });
});
