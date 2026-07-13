/**
 * SegmentedControl primitive styles — a compact radio-group that looks like a
 * single pill with one raised active segment.
 *
 * Lifted from the Person editor's sex selector. Base UI marks the selected
 * radio with `data-checked`, so the active segment is a selector rather than a
 * variant the component has to thread through.
 */
import { primitiveStyle } from '$/design/primitive-layer';
import { focusRing, vars } from '$/design/theme.css';

export const track = primitiveStyle({
  display: 'inline-flex',
  background: vars.color.subtle,
  borderRadius: 8,
  padding: vars.space['0.75'],
  gap: vars.space['0.5'],
  width: 'max-content',
});

export const item = primitiveStyle({
  padding: `${vars.space['1.5']} ${vars.space['3.25']}`,
  borderRadius: 6,
  fontSize: vars.text['12.5'].fontSize,
  lineHeight: vars.text['12.5'].lineHeight,
  fontWeight: 600,
  color: vars.color.muted,
  cursor: 'pointer',
  border: 'none',
  background: 'transparent',
  fontFamily: 'inherit',
  selectors: {
    '&[data-checked]': {
      background: vars.color.panel,
      color: vars.color.text,
      boxShadow: vars.shadow.sm,
    },
    '&:disabled': { cursor: 'default', opacity: 0.6 },
    '&:focus-visible': focusRing,
  },
});
