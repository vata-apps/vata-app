import { primitiveStyle } from '$/design/primitive-layer';
import { vars } from '$/design/theme.css';

export const badge = primitiveStyle({
  display: 'inline-flex',
  alignItems: 'center',
  height: 22,
  padding: `0 ${vars.space['2']}`,
  background: vars.color.subtle,
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: vars.radius.base,
  fontSize: vars.text['12.5'].fontSize,
  lineHeight: vars.text['12.5'].lineHeight,
  color: vars.color.text,
  whiteSpace: 'nowrap',
});
