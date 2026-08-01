/**
 * Vanilla Extract styles for the Person editor + Person picker (ADR-0005).
 * Base UI supplies behavior; these styles supply the grayscale look over the
 * `src/design/theme.css.ts` token contract. Shared by `person-editor-dialog.tsx`
 * and `person-picker.tsx`.
 *
 * Generic controls (Button, TextField, Select, SegmentedControl, Switch, Dialog,
 * Popover) now live in `src/components/ui/`; this file keeps only the
 * layout/feature-specific atoms that have no behavior to encapsulate.
 */
import { style } from '@vanilla-extract/css';

import { focusRing, vars } from '$/design/theme.css';

/* ---- dialog chrome -------------------------------------------------- */

export const modal = style({
  width: 'calc(100vw - 44px)',
  maxWidth: 1180,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  maxHeight: 'calc(100vh - 54px)',
});

export const mhead = style({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '14px 18px',
  borderBottom: `1px solid ${vars.color.border.subtle}`,
  flex: '0 0 auto',
});
export const headAvatar = style({
  width: 38,
  height: 38,
  borderRadius: vars.radius.md,
  background: vars.color.surface.sunken,
  border: `1px solid ${vars.color.border.default}`,
  color: vars.color.text.muted,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: vars.weight.bold,
  fontSize: 13,
  flex: '0 0 auto',
});
/** Title + person name on one line, read as a breadcrumb (`Add person / Jane Doe`). */
export const headCrumb = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: 8,
  minWidth: 0,
});
export const headTitle = style({
  fontSize: vars.text.md,
  fontWeight: vars.weight.strong,
  margin: 0,
  whiteSpace: 'nowrap',
  flex: '0 0 auto',
});
/** Breadcrumb separator between the title and the person name. */
export const headSep = style({
  fontSize: vars.text.md,
  color: vars.color.text.subtle,
  flex: '0 0 auto',
});
/** The lineage signature: the person's name in Spectral italic, truncated if long. */
export const headSub = style({
  fontFamily: vars.font.serif,
  fontStyle: 'italic',
  fontSize: vars.text.md,
  color: vars.color.text.muted,
  minWidth: 0,
  flex: '0 1 auto',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});
export const grow = style({ flex: 1 });
export const mbody = style({
  flex: 1,
  minHeight: 0,
  overflow: 'auto',
  padding: '14px 18px 18px',
  // Local for now (first VE screen); promote to the design layer when a second
  // VE screen needs a styled scroll container instead of copying this block.
  selectors: {
    '&::-webkit-scrollbar': { width: 14, height: 14 },
    '&::-webkit-scrollbar-track': { background: 'transparent' },
    // Inset thumb (transparent border + padding-box clip) that sits on the theme.
    '&::-webkit-scrollbar-thumb': {
      background: vars.color.text.subtle,
      borderRadius: vars.radius.full,
      border: '4px solid transparent',
      backgroundClip: 'padding-box',
    },
    '&::-webkit-scrollbar-thumb:hover': { background: vars.color.text.muted },
  },
});
export const mfoot = style({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '11px 18px',
  borderTop: `1px solid ${vars.color.border.subtle}`,
  flex: '0 0 auto',
  background: `color-mix(in srgb, ${vars.color.surface.card} 92%, transparent)`,
});
export const dirty = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontSize: vars.text.xs,
  color: vars.color.status.warn.fg,
  fontWeight: vars.weight.semibold,
  '::before': {
    content: '""',
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: vars.color.status.warn.fg,
  },
});
export const loadingText = style({
  fontSize: vars.text.sm,
  color: vars.color.text.muted,
  padding: '8px 0',
});

/* ---- layout + cards ------------------------------------------------- */

export const cols = style({
  display: 'grid',
  gap: 14,
  alignItems: 'start',
  gridTemplateColumns: '1.35fr 1fr',
  '@media': { 'screen and (max-width: 900px)': { gridTemplateColumns: '1fr' } },
});
export const col = style({ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 });
export const ecard = style({
  background: vars.color.surface.card,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  padding: '14px 15px',
});
export const familyCard = style({
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  padding: '12px 13px',
  marginTop: 4,
});
/** The first family sits below the Parents rows and wants a clearer break from them. */
export const familyCardFirst = style({ marginTop: 16 });
export const sectitle = style({
  fontSize: vars.text['2xs'],
  letterSpacing: '.09em',
  textTransform: 'uppercase',
  color: vars.color.text.muted,
  fontWeight: vars.weight.strong,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 12,
});
export const subhead = style({
  fontSize: vars.text.xs,
  fontWeight: vars.weight.strong,
  color: vars.color.text.strong,
  margin: '0 0 8px',
});
export const subheadMt = style({ marginTop: 14 });

/* ---- controls ------------------------------------------------------- */

export const tnum = style({ fontVariantNumeric: 'tabular-nums' });
export const fgridC2 = style({ display: 'grid', gap: '10px 12px', gridTemplateColumns: '1fr 1fr' });
export const fgridC3 = style({
  display: 'grid',
  gap: '10px 12px',
  gridTemplateColumns: '1fr 1fr 1fr',
});
export const stack = style({ display: 'flex', flexDirection: 'column', gap: 8 });
/** The prefix/suffix/nickname grid, spaced below the given/surname grid. */
export const fgrid3Gap = style([fgridC3, { marginTop: 10 }]);
/**
 * The Deceased toggle and the always-present Death row. A top hairline sets them
 * apart from the events above while keeping the rows flush-left with Birth (no
 * indentation); the toggle sits directly over the Death row it gates.
 */
export const deathGroup = style({
  marginTop: 12,
  paddingTop: 12,
  borderTop: `1px solid ${vars.color.border.subtle}`,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
});
/** The "Add another family" action, spaced below the last family. */
export const familyActions = style({ marginTop: 12 });
/** Header of a family card: a label and the remove control. */
export const familyHead = style({ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 });
/** Same type ramp as {@link subhead}; the flex header owns the spacing, so drop its margin. */
export const familyTitle = style([subhead, { margin: 0 }]);

export const statusrow = style({ display: 'flex', alignItems: 'center', gap: 10 });
export const switchLabel = style({ fontSize: vars.text.sm, fontWeight: vars.weight.semibold });

export const altrow = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) 128px 30px',
  gap: 8,
  alignItems: 'center',
});

/* ---- life events ---------------------------------------------------- */

export const eventlist = style({ display: 'flex', flexDirection: 'column', gap: 8 });
const eventrowBase = { display: 'grid', gap: 8, alignItems: 'center' } as const;
/** Dates are short, places are long — keep the date compact, let the place take the rest. */
export const eventrow = style({ ...eventrowBase, gridTemplateColumns: '148px 190px 1fr' });
/** Added events: same fields, plus a trailing column for the remove control. */
export const eventrowRemovable = style({
  ...eventrowBase,
  gridTemplateColumns: '148px 190px 1fr 30px',
});
/** Read-only event-type cell (type is chosen when the event is added). */
export const eventType = style({
  display: 'flex',
  alignItems: 'center',
  height: 34,
  fontSize: vars.text.sm,
  fontWeight: vars.weight.semibold,
  color: vars.color.text.body,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});
export const addWrap = style({ marginTop: 10 });
export const typegrid = style({
  marginTop: 9,
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: 6,
  maxWidth: 430,
  border: `1px solid ${vars.color.border.default}`,
  background: vars.color.surface.panel,
  borderRadius: vars.radius.md,
  padding: 8,
});
export const typegridBtn = style({
  border: `1px solid ${vars.color.border.subtle}`,
  background: vars.color.surface.card,
  borderRadius: vars.radius.sm,
  padding: '8px 9px',
  fontSize: vars.text.xs,
  cursor: 'pointer',
  color: vars.color.text.body,
  textAlign: 'left',
  fontFamily: 'inherit',
  selectors: {
    '&:hover': {
      borderColor: vars.color.brand.base,
      color: vars.color.brand.base,
      background: vars.color.brand.subtleBg,
    },
    '&:focus-visible': focusRing,
  },
});

/* ---- relations ------------------------------------------------------ */

export const relrow2 = style({
  display: 'grid',
  gridTemplateColumns: '78px minmax(0,1fr)',
  gap: 10,
  alignItems: 'start',
  padding: '4px 0',
});
export const relLabel = style({
  fontSize: vars.text.xs,
  color: vars.color.text.body,
  paddingTop: 12,
});
export const childstack = style({ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 });
export const relslot = style({
  minHeight: 44,
  border: `1px dashed ${vars.color.border.strong}`,
  background: 'transparent',
  color: vars.color.text.subtle,
  borderRadius: vars.radius.sm,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '0 12px',
  fontSize: vars.text.xs,
  fontWeight: vars.weight.semibold,
  cursor: 'pointer',
  width: '100%',
  fontFamily: 'inherit',
  selectors: {
    '&:hover': { borderColor: vars.color.brand.base, color: vars.color.brand.base },
    '&:focus-visible': focusRing,
    '&:disabled': { cursor: 'default', opacity: 0.6 },
    // Keep the resting look while disabled — no brand hover on a dead control.
    '&:disabled:hover': { borderColor: vars.color.border.strong, color: vars.color.text.subtle },
  },
});
export const pfield = style({
  minHeight: 44,
  border: `1px solid ${vars.color.border.default}`,
  background: vars.color.surface.card,
  borderRadius: vars.radius.sm,
  display: 'flex',
  alignItems: 'center',
  gap: 9,
  padding: '4px 6px 4px 10px',
  width: '100%',
});
export const pfieldAvatar = style({
  width: 26,
  height: 26,
  borderRadius: '50%',
  background: vars.color.brand.subtleBg,
  color: vars.color.brand.base,
  fontSize: 9,
  fontWeight: vars.weight.bold,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '0 0 auto',
});
export const pfieldBody = style({ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 });
export const pfieldName = style({
  fontSize: vars.text.sm,
  fontWeight: vars.weight.semibold,
  color: vars.color.text.body,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});
export const pfieldDates = style({ fontSize: vars.text['2xs'], color: vars.color.text.subtle });

/* ---- Person picker (Base UI Popover) -------------------------------- */

/** The Popover primitive owns the popup shell; the picker only fixes its width. */
export const pickerPopup = style({ width: 288 });
export const pickerList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  marginTop: vars.space['4'],
  maxHeight: 260,
  overflow: 'auto',
});
export const pickerItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: 9,
  width: '100%',
  border: 0,
  background: 'transparent',
  textAlign: 'left',
  padding: '7px 8px',
  borderRadius: vars.radius.sm,
  cursor: 'pointer',
  color: vars.color.text.body,
  fontFamily: 'inherit',
  selectors: {
    '&:hover': { background: vars.color.surface.hover },
    '&:focus-visible': focusRing,
  },
});
export const pickerMeta = style({
  fontSize: vars.text.xs,
  color: vars.color.text.subtle,
  padding: '6px 8px',
});
export const pickerCreate = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  marginTop: 6,
  border: 0,
  borderTop: `1px solid ${vars.color.border.subtle}`,
  paddingTop: 9,
  paddingBottom: 3,
  paddingInline: 8,
  background: 'transparent',
  color: vars.color.brand.base,
  fontWeight: vars.weight.strong,
  fontSize: vars.text.xs,
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: 'inherit',
  selectors: { '&:focus-visible': focusRing },
});

/* ---- error callout -------------------------------------------------- */

export const callout = style({
  marginTop: 16,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: vars.text.xs,
  color: vars.color.status.err.text,
  background: `color-mix(in srgb, ${vars.color.status.err.text} 12%, transparent)`,
  border: `1px solid color-mix(in srgb, ${vars.color.status.err.text} 30%, transparent)`,
  borderRadius: vars.radius.md,
  padding: '9px 12px',
});

/* ---- discard AlertDialog ------------------------------------------- */

/**
 * The Dialog primitive owns the shell and the stacking level (`layer="alert"`);
 * the confirmations only size and pad themselves.
 */
export const alertPopup = style({
  width: 'calc(100vw - 44px)',
  maxWidth: 440,
  borderRadius: vars.radius.lg,
  padding: 20,
});
export const alertTitle = style({
  fontSize: vars.text.lg,
  fontWeight: vars.weight.strong,
  color: vars.color.text.strong,
  margin: 0,
});
export const alertDesc = style({
  fontSize: vars.text.sm,
  color: vars.color.text.muted,
  margin: '8px 0 0',
  lineHeight: vars.leading.normal,
});
export const alertActions = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 10,
  marginTop: 18,
});
