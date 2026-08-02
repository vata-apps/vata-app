import { primitiveStyle } from '$/design/primitive-layer';
import { vars } from '$/design/theme.css';

export const badge = primitiveStyle({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  fontSize: vars.text['2xs'],
  fontWeight: vars.weight.semibold,
  lineHeight: vars.leading.none,
  padding: '3px 7px',
  borderRadius: vars.radius.full,
  border: '1px solid transparent',
  letterSpacing: vars.tracking.wide,
  whiteSpace: 'nowrap',
  background: vars.color.surface.sunken,
  color: vars.color.text.muted,
  borderColor: vars.color.border.subtle,
});
