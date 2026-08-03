/**
 * Shared styles for the person rail (the persistent people list beside a
 * person's detail screen) — the expanded list, the collapsed avatar rail,
 * the filter panel, and the sort menu all live in this one visual unit.
 */
import { style } from '@vanilla-extract/css';
import { focusRing, vars } from '$/design/theme.css';

const EXPANDED_WIDTH = 280;
const COLLAPSED_WIDTH = 60;

// ---------------------------------------------------------------------------
// Collapsed rail
// ---------------------------------------------------------------------------

export const collapsedRail = style({
  width: COLLAPSED_WIDTH,
  flexShrink: 0,
  height: '100%',
  boxSizing: 'border-box',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.space['5'],
  padding: `${vars.space['5']} 0 ${vars.space['4']}`,
  borderRight: `1px solid ${vars.color.border.subtle}`,
  background: vars.color.surface.panel,
});

export const collapsedToggle = style({ position: 'relative' });

export const filterDot = style({
  position: 'absolute',
  top: -2,
  right: -2,
  width: 7,
  height: 7,
  borderRadius: vars.radius.full,
  background: vars.color.brand.base,
  border: `1.5px solid ${vars.color.surface.panel}`,
  boxSizing: 'border-box',
});

export const collapsedAvatars = style({
  flex: 1,
  minHeight: 0,
  width: '100%',
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.space['4'],
});

export const collapsedAvatarButton = style({
  display: 'flex',
  border: 'none',
  background: 'transparent',
  padding: 0,
  cursor: 'pointer',
  borderRadius: vars.radius.full,
  textDecoration: 'none',
  selectors: {
    '&:focus-visible': focusRing,
  },
});

export const collapsedCount = style({
  flexShrink: 0,
  fontFamily: vars.font.mono,
  fontSize: vars.text['2xs'],
  color: vars.color.text.subtle,
});

export const hoverPopover = style({
  width: 240,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['4'],
  background: vars.color.surface.card,
  color: vars.color.text.body,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.lg,
  padding: vars.space['5'],
  whiteSpace: 'normal',
});

export const hoverHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['5'],
});

export const hoverDivider = style({
  height: 1,
  background: vars.color.border.subtle,
});

export const hoverRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['4'],
  fontSize: vars.text.xs,
  color: vars.color.text.subtle,
});

export const hoverRowValue = style({
  marginLeft: 'auto',
  color: vars.color.text.body,
  fontWeight: vars.weight.medium,
});

// ---------------------------------------------------------------------------
// Expanded list
// ---------------------------------------------------------------------------

export const expandedRail = style({
  width: EXPANDED_WIDTH,
  flexShrink: 0,
  height: '100%',
  boxSizing: 'border-box',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  borderRight: `1px solid ${vars.color.border.subtle}`,
  background: vars.color.surface.panel,
});

export const expandedHeader = style({
  flexShrink: 0,
  padding: `${vars.space['6']} ${vars.space['5']} ${vars.space['4']}`,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['5'],
});

export const titleRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['4'],
});

export const title = style({ fontSize: vars.text.md, fontWeight: vars.weight.strong });

export const titleTotal = style({
  fontSize: vars.text['2xs'],
  color: vars.color.text.subtle,
});

export const collapseTrigger = style({ marginLeft: 'auto' });

export const rows = style({
  flex: 1,
  minHeight: 0,
  overflow: 'auto',
  padding: `${vars.space['1']} ${vars.space['4']} ${vars.space['5']}`,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['1'],
});

export const row = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['5'],
  padding: `${vars.space['4']} ${vars.space['4']}`,
  borderRadius: vars.radius.sm,
  border: '1px solid transparent',
  cursor: 'pointer',
  textDecoration: 'none',
  color: 'inherit',
  selectors: {
    '&:hover': { background: vars.color.surface.hover },
    '&:focus-visible': focusRing,
  },
});

export const rowActive = style({
  background: vars.color.brand.subtleBg,
  borderColor: vars.color.brand.subtleBorder,
  selectors: {
    '&:hover': { background: vars.color.brand.subtleBg },
  },
});

export const rowText = style({ minWidth: 0, flex: 1 });

export const rowName = style({
  fontSize: vars.text.sm,
  fontWeight: vars.weight.semibold,
  lineHeight: vars.leading.tight,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const rowMeta = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['3'],
  fontSize: vars.text['2xs'],
  color: vars.color.text.muted,
});

export const emptyRows = style({
  padding: `${vars.space['8']} ${vars.space['5']}`,
  textAlign: 'center',
  fontSize: vars.text.xs,
  color: vars.color.text.muted,
});

// ---------------------------------------------------------------------------
// Filter button + panel
// ---------------------------------------------------------------------------

export const filterBar = style({
  width: '100%',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['4'],
  height: 30,
  padding: `0 ${vars.space['4']}`,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  background: vars.color.surface.card,
  color: vars.color.text.subtle,
  fontSize: vars.text.xs,
});

export const filterButton = style({
  flex: 1,
  minWidth: 0,
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['4'],
  padding: 0,
  border: 'none',
  background: 'none',
  color: 'inherit',
  fontSize: 'inherit',
  fontFamily: 'inherit',
  cursor: 'pointer',
  selectors: {
    '&:focus-visible': focusRing,
  },
});

export const filterButtonLabel = style({ fontWeight: vars.weight.medium, flexShrink: 0 });

export const filterButtonSummary = style({
  minWidth: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const filterButtonClear = style({
  display: 'flex',
  flexShrink: 0,
  padding: 0,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  color: vars.color.text.subtle,
  selectors: {
    '&:hover': { color: vars.color.text.body },
    '&:focus-visible': focusRing,
  },
});

export const filterButtonChevron = style({
  marginLeft: 'auto',
  display: 'flex',
  flexShrink: 0,
});

// `Popover.Popup` (ui/popover.css.ts) already applies `padding: space.4` and the
// card/border/shadow chrome — this only sizes the popup and, like
// `entity-picker.css.ts`, bleeds the header/footer bands back out to its edges.
export const filterPanel = style({ width: 260, display: 'flex', flexDirection: 'column' });

const bleed = `calc(${vars.space['4']} * -1)`;

export const filterPanelHeader = style({
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['4'],
  margin: `${bleed} ${bleed} 0`,
  padding: `${vars.space['4']} ${vars.space['4']} ${vars.space['3']}`,
  borderBottom: `1px solid ${vars.color.border.subtle}`,
});

export const filterPanelTitle = style({
  fontSize: vars.text.sm,
  fontWeight: vars.weight.strong,
});

export const filterPanelReset = style({
  marginLeft: 'auto',
  fontSize: vars.text['2xs'],
  color: vars.color.text.subtle,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  selectors: { '&:hover': { color: vars.color.text.body } },
});

export const filterPanelBody = style({
  maxHeight: 300,
  overflow: 'auto',
  margin: `0 ${bleed}`,
  padding: `${vars.space['4']} ${vars.space['4']} 0`,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['6'],
});

export const filterSectionLabel = style({
  fontSize: vars.text['2xs'],
  letterSpacing: vars.tracking.caps,
  textTransform: 'uppercase',
  color: vars.color.text.subtle,
  marginBottom: vars.space['3'],
});

export const filterValues = style({ display: 'flex', flexDirection: 'column', gap: 2 });

export const filterValueRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['4'],
  padding: `${vars.space['3']} ${vars.space['4']}`,
  borderRadius: vars.radius.sm,
  border: 'none',
  background: 'none',
  width: '100%',
  boxSizing: 'border-box',
  cursor: 'pointer',
  fontSize: vars.text.xs,
  color: vars.color.text.body,
  textAlign: 'left',
  selectors: {
    '&:hover': { background: vars.color.surface.hover },
    '&:focus-visible': focusRing,
  },
});

export const filterValueBox = style({
  width: 14,
  height: 14,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${vars.color.border.strong}`,
  borderRadius: 3,
  color: vars.color.brand.base,
});

export const filterValueBoxChecked = style({
  background: vars.color.brand.subtleBg,
  borderColor: vars.color.brand.base,
});

export const filterValueLabel = style({ flex: 1, minWidth: 0 });

export const filterValueCount = style({
  fontFamily: vars.font.mono,
  fontSize: vars.text['2xs'],
  color: vars.color.text.subtle,
});

export const filterPanelFooter = style({
  flexShrink: 0,
  display: 'flex',
  margin: `0 ${bleed} ${bleed}`,
  padding: vars.space['4'],
  borderTop: `1px solid ${vars.color.border.subtle}`,
});

// ---------------------------------------------------------------------------
// Sort footer + menu
// ---------------------------------------------------------------------------

export const sortFooter = style({
  flexShrink: 0,
  borderTop: `1px solid ${vars.color.border.subtle}`,
});

export const sortButton = style({
  width: '100%',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['4'],
  height: 36,
  padding: `0 ${vars.space['5']}`,
  border: 'none',
  background: 'transparent',
  color: vars.color.text.subtle,
  fontSize: vars.text.xs,
  cursor: 'pointer',
  selectors: {
    '&:hover': { background: vars.color.surface.hover },
    '&:focus-visible': focusRing,
  },
});

export const sortButtonField = style({
  fontWeight: vars.weight.semibold,
  color: vars.color.text.body,
});

export const sortButtonDirection = style({
  fontFamily: vars.font.mono,
  fontSize: vars.text['2xs'],
  color: vars.color.text.muted,
});

export const sortButtonChevron = style({
  marginLeft: 'auto',
  display: 'flex',
  flexShrink: 0,
});

// Same "size the popup, bleed the label back to its edges" approach as the filter panel.
export const sortMenu = style({ width: 260 });

export const sortMenuLabel = style({
  padding: `${vars.space['3']} ${vars.space['4']} ${vars.space['4']}`,
  fontSize: vars.text['2xs'],
  letterSpacing: vars.tracking.caps,
  textTransform: 'uppercase',
  color: vars.color.text.subtle,
});

export const sortMenuItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['4'],
  width: '100%',
  boxSizing: 'border-box',
  padding: `${vars.space['3']} ${vars.space['4']}`,
  border: 'none',
  background: 'none',
  borderRadius: vars.radius.sm,
  cursor: 'pointer',
  fontSize: vars.text.xs,
  color: vars.color.text.body,
  textAlign: 'left',
  selectors: {
    '&:hover': { background: vars.color.surface.hover },
    '&:focus-visible': focusRing,
  },
});

export const sortMenuItemCheck = style({
  width: 14,
  flexShrink: 0,
  display: 'flex',
  color: vars.color.brand.base,
});

export const sortMenuDivider = style({
  height: 1,
  background: vars.color.border.subtle,
  margin: `${vars.space['3']} 0`,
});
