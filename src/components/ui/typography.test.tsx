import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Typography } from './typography';

describe('Typography', () => {
  it('renders its text', () => {
    render(<Typography>Hello world</Typography>);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders as a span by default', () => {
    render(<Typography>Text</Typography>);
    expect(screen.getByText('Text').tagName).toBe('SPAN');
  });

  it('renders as the element specified by as', () => {
    render(<Typography as="h1">Heading</Typography>);
    expect(screen.getByRole('heading', { level: 1, name: 'Heading' })).toBeInTheDocument();
  });

  it('renders as a paragraph', () => {
    render(<Typography as="p">Paragraph text</Typography>);
    expect(screen.getByText('Paragraph text').tagName).toBe('P');
  });

  it('forwards additional props to the underlying element', () => {
    render(
      <Typography as="span" aria-label="description">
        Hidden
      </Typography>
    );
    expect(screen.getByLabelText('description')).toBeInTheDocument();
  });
});
