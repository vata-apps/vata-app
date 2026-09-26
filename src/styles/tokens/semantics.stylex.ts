import { defineVars } from '@stylexjs/stylex';
import { borderPrimitives } from './border.primitives.stylex';
import { colorPrimitives } from './colorPrimitives.stylex';

export const borders = defineVars({
  transparent: `${borderPrimitives.width1px} ${borderPrimitives.styleSolid} ${colorPrimitives.transparent}`,
});

export const colors = defineVars({
  bgPrimary: colorPrimitives.olive500,
  bgPrimaryHover: colorPrimitives.olive600,
  bgPrimaryActive: colorPrimitives.olive700,
  bgPrimaryDisabled: colorPrimitives.olive200,

  textOnPrimary: colorPrimitives.sand500,
  textOnPrimaryDisabled: colorPrimitives.sand600,
});

export const scale = defineVars({
  default: '0.98',
});
