/**
 * SegmentedControl primitive styles — a compact radio-group that looks like a
 * single pill with one raised active segment.
 *
 * Lifted from the Person editor's sex selector. Base UI marks the selected
 * radio with `data-checked`, so the active segment is a selector rather than a
 * variant the component has to thread through.
 */
import { primitiveStyle, transitionFast } from '$/design/primitive-layer';
import { focusRing, vars } from '$/design/theme.css';

export const track = primitiveStyle({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 2,
  background: vars.color.surface.sunken,
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.full,
  padding: 4,
  width: 'max-content',
});

export const item = primitiveStyle({
  padding: '8px 16px',
  borderRadius: vars.radius.full,
  fontSize: vars.text.sm,
  fontWeight: vars.weight.medium,
  color: vars.color.text.muted,
  cursor: 'pointer',
  border: 'none',
  background: 'transparent',
  fontFamily: 'inherit',
  lineHeight: vars.leading.none,
  transition: transitionFast('color', 'background'),
  selectors: {
    '&:hover:not(:disabled):not([data-checked])': { color: vars.color.text.strong },
    '&[data-checked]': {
      background: vars.color.surface.card,
      color: vars.color.text.strong,
      boxShadow: vars.shadow.sm,
    },
    '&:disabled': { cursor: 'default', opacity: 0.6 },
    '&:focus-visible': focusRing,
  },
});
