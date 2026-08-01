/**
 * Field primitive styles — label + hint/error scaffold around a single
 * form control.
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

export const required = primitiveStyle({
  color: vars.color.status.err.text,
  marginLeft: 2,
});

export const hint = primitiveStyle({
  fontSize: vars.text.xs,
  color: vars.color.text.muted,
  lineHeight: vars.leading.snug,
});

export const error = primitiveStyle({
  fontSize: vars.text.xs,
  color: vars.color.status.err.text,
  lineHeight: vars.leading.snug,
});
