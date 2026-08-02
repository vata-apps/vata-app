/**
 * Field primitive styles — label scaffold around a single form control.
 */
import { primitiveStyle } from '$/design/primitive-layer';
import { vars } from '$/design/theme.css';

export const field = primitiveStyle({
  display: 'flex',
  flexDirection: 'column',
  gap: 5,
  minWidth: 0,
  fontFamily: vars.font.sans,
});

export const label = primitiveStyle({
  fontSize: vars.text.xs,
  fontWeight: vars.weight.medium,
  color: vars.color.text.body,
});
