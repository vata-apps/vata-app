/**
 * Table primitive styles — semantic, sortable, activatable rows over the
 * warm-earth tokens. Owns table mechanics only: no loading, error, or empty
 * messages (those live in the application {@link EntityTable}).
 */
import { primitiveStyle } from '$/design/primitive-layer';
import { focusRing, vars } from '$/design/theme.css';

export const table = primitiveStyle({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: vars.text['13'].fontSize,
  lineHeight: vars.text['13'].lineHeight,
  color: vars.color.text,
});

export const headerCell = primitiveStyle({
  position: 'sticky',
  top: 0,
  zIndex: 1,
  background: vars.color.panel,
  textAlign: 'left',
  fontWeight: 600,
  fontSize: vars.text['12.5'].fontSize,
  lineHeight: vars.text['12.5'].lineHeight,
  padding: `${vars.space['2.5']} ${vars.space['3']}`,
  borderBottom: `1px solid ${vars.color.borderStrong}`,
  whiteSpace: 'nowrap',
});

export const sortButton = primitiveStyle({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['1.5'],
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
  color: vars.color.faint,
  opacity: 0,
  transition: 'opacity 100ms ease',
  selectors: {
    '[data-sort-active="true"] &': { opacity: 1, color: vars.color.text },
    [`${sortButton}:hover &`]: { opacity: 1 },
    [`${sortButton}:focus-visible &`]: { opacity: 1 },
  },
});

export const row = primitiveStyle({
  borderBottom: `1px solid ${vars.color.border}`,
  selectors: {
    '&:last-child': { borderBottom: 'none' },
    '&[data-row-link="true"]': { cursor: 'pointer' },
  },
});

export const cell = primitiveStyle({
  padding: `${vars.space['2.5']} ${vars.space['3']}`,
  textAlign: 'left',
  verticalAlign: 'middle',
  selectors: {
    [`${row}[data-row-link="true"]:hover &`]: { background: vars.color.subtle },
  },
});

export const rowHeaderCell = primitiveStyle({
  padding: `${vars.space['2.5']} ${vars.space['3']}`,
  textAlign: 'left',
  verticalAlign: 'middle',
  fontWeight: 500,
  selectors: {
    [`${row}[data-row-link="true"]:hover &`]: { background: vars.color.subtle },
  },
});
