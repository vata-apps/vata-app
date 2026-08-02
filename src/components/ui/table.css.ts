/**
 * Table primitive styles — semantic, sortable, activatable rows over the
 * grayscale design tokens. Owns table mechanics only: no loading, error, or
 * empty messages (those live in the application {@link EntityTable}).
 */
import { primitiveStyle } from '$/design/primitive-layer';
import { focusRing, vars } from '$/design/theme.css';

export const table = primitiveStyle({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: vars.text.sm,
  color: vars.color.text.body,
});

export const headerCell = primitiveStyle({
  position: 'sticky',
  top: 0,
  zIndex: 1,
  background: vars.color.surface.card,
  textAlign: 'left',
  fontWeight: vars.weight.semibold,
  fontSize: vars.text.xs,
  padding: `${vars.space['4']} ${vars.space['5']}`,
  borderBottom: `1px solid ${vars.color.border.default}`,
  whiteSpace: 'nowrap',
});

export const sortButton = primitiveStyle({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['3'],
  background: 'transparent',
  border: 'none',
  padding: 0,
  margin: 0,
  font: 'inherit',
  color: 'inherit',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  selectors: {
    '&:focus-visible': focusRing,
  },
});

export const sortIndicator = primitiveStyle({
  display: 'inline-flex',
  color: vars.color.text.subtle,
  opacity: 0,
  transition: `opacity ${vars.motion.duration.instant} ${vars.motion.ease.standard}`,
  selectors: {
    '&[data-sort-active="true"]': { opacity: 1, color: vars.color.text.strong },
    [`${sortButton}:hover &`]: { opacity: 1 },
    [`${sortButton}:focus-visible &`]: { opacity: 1 },
  },
});

export const row = primitiveStyle({
  borderBottom: `1px solid ${vars.color.border.subtle}`,
  selectors: {
    '&:last-child': { borderBottom: 'none' },
    // Only rows that actually carry a link are pointer-cursored. A row whose
    // primary cell renders plain text (e.g. an unrecorded parent slot) has no
    // anchor, so it must read as non-navigable — matching that its click is a
    // no-op.
    '&[data-row-link="true"]:has(a)': { cursor: 'pointer' },
  },
});

export const cell = primitiveStyle({
  padding: `${vars.space['4']} ${vars.space['5']}`,
  textAlign: 'left',
  verticalAlign: 'middle',
  selectors: {
    [`${row}[data-row-link="true"]:has(a):hover &`]: { background: vars.color.surface.hover },
  },
});

export const rowHeaderCell = primitiveStyle({
  padding: `${vars.space['4']} ${vars.space['5']}`,
  textAlign: 'left',
  verticalAlign: 'middle',
  fontWeight: vars.weight.medium,
  selectors: {
    [`${row}[data-row-link="true"]:has(a):hover &`]: { background: vars.color.surface.hover },
  },
});
