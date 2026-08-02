/**
 * EmptyState primitive styles — "nothing here yet", in the archivist's voice.
 */
import { primitiveStyle } from '$/design/primitive-layer';
import { vars } from '$/design/theme.css';

export const inline = primitiveStyle({
  fontFamily: vars.font.serif,
  fontStyle: 'italic',
  fontSize: vars.text.md,
  color: vars.color.text.muted,
  lineHeight: vars.leading.snug,
});
