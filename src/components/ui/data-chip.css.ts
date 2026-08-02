import { primitiveStyle } from '$/design/primitive-layer';
import { vars } from '$/design/theme.css';

export const dataChip = primitiveStyle({
  display: 'inline-flex',
  alignItems: 'center',
  height: 18,
  padding: '0 6px',
  background: vars.color.surface.hover,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  fontFamily: vars.font.mono,
  fontSize: vars.text['2xs'],
  lineHeight: vars.leading.none,
  color: vars.color.text.body,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
});
