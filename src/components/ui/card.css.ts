/**
 * Card primitive styles — shared panel chrome for entity-detail sections.
 *
 * Pure visual chrome, no variants: consumers place their own heading and
 * content inside (same convention as {@link ../badge.css}).
 *
 * `stack`/`list`/`separator` are the recurring "heading + separator-divided
 * rows" content shape every Person Overview card uses (Vitals, Parents,
 * Names, Media, Life events, Places) — exported here rather than
 * re-declared per panel so all of them share one hairline and one rhythm.
 */
import { primitiveStyle } from '$/design/primitive-layer';
import { vars } from '$/design/theme.css';

export const card = primitiveStyle({
  background: vars.color.surface.card,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.sm,
  padding: vars.space.cardPad,
});

export const stack = primitiveStyle({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['5'],
});

export const list = primitiveStyle({ display: 'flex', flexDirection: 'column' });

export const separator = primitiveStyle({
  height: 1,
  background: vars.color.border.subtle,
  margin: `${vars.space['5']} 0`,
});
