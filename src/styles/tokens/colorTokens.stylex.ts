import { defineVars } from '@stylexjs/stylex';
import { colorPrimitives } from './colorPrimitives.stylex';

export const colorTokens = defineVars({
  // --- Shell / layout (nav, header, panels) ---
  surfaceShell: colorPrimitives.gray50,
  surfaceContent: colorPrimitives.sand50,
  borderDefault: colorPrimitives.gray200,

  // --- Texte ---
  textPrimary: colorPrimitives.olive900,
  textSecondary: colorPrimitives.olive600,
  textMuted: colorPrimitives.gray500,

  textOnPrimary: colorPrimitives.sand50,

  // --- Actions ---
  actionPrimary: colorPrimitives.olive500,
  actionPrimaryHover: colorPrimitives.olive600,
  actionPrimaryActive: colorPrimitives.olive700,

  actionSubtle: colorPrimitives.sand400,
  actionSubtleHover: colorPrimitives.sand500,
  actionSubtleActive: colorPrimitives.sand600,

  actionAccent: colorPrimitives.ochre500,
  actionAccentHover: colorPrimitives.ochre600,
  actionAccentActive: colorPrimitives.ochre700,
});
