import { globalStyle } from '@vanilla-extract/css';

import { vars } from '../src/design/theme.css';

/**
 * In the app the workspace ground and default ink come from Radix Themes'
 * `.radix-themes` wrapper, which Storybook doesn't mount — so paint the story
 * iframe body from the same tokens, and the Theme toolbar recolors the backdrop.
 * (`theme.css.ts` already sets the body font.)
 */
globalStyle('body.sb-show-main', {
  background: vars.color.surface.app,
  color: vars.color.text.body,
});
