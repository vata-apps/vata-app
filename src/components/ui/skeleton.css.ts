/**
 * Skeleton primitive — a pulsing placeholder block for loading states.
 *
 * Consumers size it with width/height/className. The default height matches
 * a line of body text so it can drop into table cells and form fields.
 */
import { keyframes, style } from '@vanilla-extract/css';

import { primitive } from '$/design/primitive-layer';
import { vars } from '$/design/theme.css';

const pulse = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 },
});

export const skeleton = style(
  primitive({
    display: 'inline-block',
    width: '100%',
    height: '1em',
    borderRadius: vars.radius.sm,
    background: vars.color.subtle,
    animation: `${pulse} 2s ease-in-out infinite`,
  })
);
