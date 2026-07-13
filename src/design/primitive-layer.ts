/**
 * Puts a style into the `vata-primitives` cascade layer.
 *
 * Every rule in `src/components/ui/` goes through this. Layered declarations
 * always lose to unlayered ones regardless of source order, so a feature
 * stylesheet overrides a primitive just by passing `className` — no reliance
 * on which `.css.ts` the bundler emitted first, and no specificity arms race.
 *
 * Use {@link primitiveStyle} for a plain style. Inside a `recipe()`, wrap
 * `base` and each variant value with {@link primitive} by hand — a rule that
 * skips it lands unlayered and silently outranks the feature CSS meant to
 * override it.
 *
 * This lives outside `theme.css.ts` because Vanilla Extract serializes every
 * export of a `.css.ts` file at build time and cannot serialize an arbitrary
 * function. Moving it back in there fails the build.
 */
import { style, type StyleRule } from '@vanilla-extract/css';

import { primitiveLayer } from './theme.css';

export function primitive(rule: StyleRule): StyleRule {
  return { '@layer': { [primitiveLayer]: rule } };
}

/** `style()` for primitives: the rule lands in the primitives layer. */
export function primitiveStyle(rule: StyleRule): string {
  return style(primitive(rule));
}
