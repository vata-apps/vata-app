import { primitiveStyle } from '$/design/primitive-layer';
import { vars } from '$/design/theme.css';

export const caption = primitiveStyle({
  display: 'block',
  fontFamily: vars.font.sans,
  fontSize: vars.text['2xs'],
  fontWeight: vars.weight.semibold,
  letterSpacing: vars.tracking.caps,
  textTransform: 'uppercase',
  color: vars.color.text.subtle,
  lineHeight: '1.2',
});
