import { style } from '@vanilla-extract/css';

import { transitionFast } from '$/design/primitive-layer';
import { vars } from '$/design/theme.css';

/** Styles for {@link ./panel}: the section head strip shared by every Overview card. */

/** Pushed to the trailing edge of the head, whether it links somewhere or not. */
const action = style({
  marginLeft: 'auto',
  flexShrink: 0,
  whiteSpace: 'nowrap',
  fontFamily: vars.font.sans,
  fontSize: vars.text.xs,
  fontWeight: vars.weight.semibold,
  lineHeight: vars.leading.tight,
});

export const viewAll = style([
  action,
  {
    color: vars.color.brand.base,
    textDecoration: 'none',
    transition: transitionFast('color'),
    selectors: { '&:hover': { color: vars.color.brand.hover } },
  },
]);

/** The same slot when the destination doesn't exist yet — present, but inert. */
export const viewAllDisabled = style([
  action,
  { color: vars.color.text.subtle, cursor: 'default' },
]);
