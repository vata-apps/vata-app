/**
 * Vanilla Extract styles for the Person editor + Person picker (ADR-0014).
 * Base UI supplies behavior; these styles supply the warm-earth look over the
 * `src/design/theme.css.ts` token contract. Shared by `person-editor-dialog.tsx`
 * and `person-picker.tsx`.
 */
import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

const focusRing = {
  outline: `2px solid ${vars.color.accent}`,
  outlineOffset: 2,
};

/* ---- dialog chrome -------------------------------------------------- */

export const backdrop = style({
  position: 'fixed',
  inset: 0,
  zIndex: 100,
  background: vars.color.scrim,
});

export const modal = style({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 101,
  fontFamily: vars.font.sans,
  color: vars.color.text,
  width: 'calc(100vw - 44px)',
  maxWidth: 1180,
  background: vars.color.panel,
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: 14,
  boxShadow: vars.shadow.lg,
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
  borderBottom: `1px solid ${vars.color.border}`,
  flex: '0 0 auto',
});
export const headAvatar = style({
  width: 38,
  height: 38,
  borderRadius: 10,
  background: vars.color.subtle,
  border: `1px solid ${vars.color.borderStrong}`,
  color: vars.color.muted,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
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
  fontSize: 15,
  fontWeight: 650,
  margin: 0,
  whiteSpace: 'nowrap',
  flex: '0 0 auto',
});
/** Breadcrumb separator between the title and the person name. */
export const headSep = style({ fontSize: 14, color: vars.color.faint, flex: '0 0 auto' });
/** The lineage signature: the person's name in Fraunces italic, truncated if long. */
export const headSub = style({
  fontFamily: vars.font.serif,
  fontStyle: 'italic',
  fontSize: 15,
  color: vars.color.muted,
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
    // Warm, inset thumb (transparent border + padding-box clip) that sits on the theme.
    '&::-webkit-scrollbar-thumb': {
      background: vars.color.faint,
      borderRadius: 999,
      border: '4px solid transparent',
      backgroundClip: 'padding-box',
    },
    '&::-webkit-scrollbar-thumb:hover': { background: vars.color.muted },
  },
});
export const mfoot = style({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '11px 18px',
  borderTop: `1px solid ${vars.color.border}`,
  flex: '0 0 auto',
  background: `color-mix(in srgb, ${vars.color.panel} 92%, transparent)`,
});
export const dirty = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 12.5,
  color: vars.color.warn,
  fontWeight: 600,
  '::before': {
    content: '""',
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: vars.color.warn,
  },
});
export const loadingText = style({ fontSize: 13.5, color: vars.color.muted, padding: '8px 0' });

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
  background: vars.color.panel,
  border: `1px solid ${vars.color.border}`,
  borderRadius: 11,
  padding: '14px 15px',
});
export const familyCard = style({
  border: `1px solid ${vars.color.border}`,
  borderRadius: 10,
  padding: '12px 13px',
  marginTop: 4,
});
/** The first family sits below the Parents rows and wants a clearer break from them. */
export const familyCardFirst = style({ marginTop: 16 });
export const sectitle = style({
  fontSize: 11,
  letterSpacing: '.09em',
  textTransform: 'uppercase',
  color: vars.color.muted,
  fontWeight: 650,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 12,
});
export const subhead = style({
  fontSize: 11.5,
  fontWeight: 650,
  color: vars.color.text,
  margin: '0 0 8px',
});
export const subheadMt = style({ marginTop: 14 });

/* ---- controls ------------------------------------------------------- */

export const field = style({ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 });
export const fieldLabel = style({ fontSize: 11.5, fontWeight: 600, color: vars.color.text });
export const input = style({
  height: 34,
  border: `1px solid ${vars.color.borderStrong}`,
  background: vars.color.panel,
  color: vars.color.text,
  borderRadius: vars.radius.sm,
  padding: '0 10px',
  fontSize: 13.5,
  width: '100%',
  boxShadow: 'inset 0 1px 1px rgba(0,0,0,.03)',
  fontFamily: 'inherit',
  selectors: {
    '&:hover': { borderColor: vars.color.faint },
    '&::placeholder': { color: vars.color.faint },
    '&:focus-visible': { ...focusRing, outlineOffset: 1, borderColor: vars.color.accent },
    '&:disabled': { opacity: 0.55, cursor: 'not-allowed' },
    '&:disabled:hover': { borderColor: vars.color.borderStrong },
  },
});
export const textarea = style([
  input,
  { height: 'auto', minHeight: 62, padding: '8px 10px', lineHeight: 1.45, resize: 'vertical' },
]);
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
  borderTop: `1px solid ${vars.color.border}`,
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

export const seg = style({
  display: 'inline-flex',
  background: vars.color.subtle,
  borderRadius: 8,
  padding: 3,
  gap: 2,
  width: 'max-content',
});
export const segItem = style({
  padding: '6px 13px',
  borderRadius: 6,
  fontSize: 12.5,
  fontWeight: 600,
  color: vars.color.muted,
  cursor: 'pointer',
  border: 'none',
  background: 'transparent',
  fontFamily: 'inherit',
  selectors: {
    '&:disabled': { cursor: 'default', opacity: 0.6 },
    '&:focus-visible': focusRing,
  },
});
export const segItemOn = style({
  background: vars.color.panel,
  color: vars.color.text,
  boxShadow: vars.shadow.sm,
});

export const switchRoot = style({
  width: 38,
  height: 22,
  borderRadius: 99,
  background: vars.color.borderStrong,
  position: 'relative',
  flex: '0 0 auto',
  cursor: 'pointer',
  border: 'none',
  padding: 0,
  selectors: {
    '&[data-checked]': { background: vars.color.accent },
    '&:focus-visible': focusRing,
    '&:disabled': { cursor: 'default', opacity: 0.6 },
  },
});
export const switchThumb = style({
  position: 'absolute',
  top: 2,
  left: 2,
  width: 18,
  height: 18,
  borderRadius: '50%',
  background: '#fff',
  boxShadow: vars.shadow.sm,
  transition: 'left .15s',
  selectors: { [`${switchRoot}[data-checked] &`]: { left: 18 } },
});
export const statusrow = style({ display: 'flex', alignItems: 'center', gap: 10 });
export const switchLabel = style({ fontSize: 13, fontWeight: 600 });

export const iconbtn = style({
  width: 30,
  height: 30,
  borderRadius: 6,
  border: '1px solid transparent',
  background: 'transparent',
  color: vars.color.faint,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '0 0 auto',
  selectors: {
    '&:hover': { background: vars.color.subtle, color: vars.color.danger },
    '&:focus-visible': focusRing,
    '&:disabled': { cursor: 'default', opacity: 0.5 },
  },
});
export const addbtn = style({
  alignSelf: 'flex-start',
  background: 'transparent',
  border: `1px dashed ${vars.color.borderStrong}`,
  color: vars.color.muted,
  borderRadius: vars.radius.sm,
  height: 32,
  padding: '0 12px',
  fontSize: 12.5,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  fontFamily: 'inherit',
  selectors: {
    '&:hover': { borderColor: vars.color.accent, color: vars.color.accent },
    '&:focus-visible': focusRing,
    '&:disabled': { cursor: 'default', opacity: 0.6 },
  },
});

const btnBase = style({
  height: 34,
  borderRadius: vars.radius.sm,
  padding: '0 16px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  border: '1px solid transparent',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontFamily: 'inherit',
  selectors: {
    '&:focus-visible': focusRing,
    '&:disabled': { cursor: 'default', opacity: 0.6 },
  },
});
export const btnSolid = style([
  btnBase,
  {
    background: vars.color.accent,
    color: vars.color.accentText,
    selectors: { '&:hover:not(:disabled)': { background: vars.color.accentHover } },
  },
]);
export const btnGhost = style([
  btnBase,
  {
    background: 'transparent',
    color: vars.color.muted,
    selectors: { '&:hover:not(:disabled)': { color: vars.color.text } },
  },
]);
export const btnDanger = style([
  btnBase,
  {
    background: vars.color.danger,
    color: vars.color.accentText,
    selectors: { '&:hover:not(:disabled)': { filter: 'brightness(0.94)' } },
  },
]);

export const altrow = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) 128px 30px',
  gap: 8,
  alignItems: 'center',
});

/* ---- Base UI Select ------------------------------------------------- */

export const selbox = style({
  height: 34,
  border: `1px solid ${vars.color.borderStrong}`,
  background: vars.color.panel,
  borderRadius: vars.radius.sm,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '0 10px',
  fontSize: 12.5,
  color: vars.color.text,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  fontFamily: 'inherit',
  width: '100%',
  selectors: {
    '&:hover': { borderColor: vars.color.faint },
    '&:focus-visible': focusRing,
    '&:disabled': { cursor: 'default', opacity: 0.6 },
  },
});
export const selboxCaret = style({ marginLeft: 'auto', fontSize: 9, color: vars.color.faint });
/**
 * Z-index for the Base UI positioner wrappers (Popover + Select). Floating UI
 * sets `will-change: transform` inline on these, which creates a stacking
 * context with `z-index: auto` — so any z-index on the popup inside is
 * trapped and the dialog (z 101) wins. Giving the positioner itself a z-index
 * above the dialog lifts the whole context. 105 sits below the discard
 * AlertDialog (110/111) so the confirm prompt still covers the pickers.
 */
export const positionerZ = style({ zIndex: 105 });

export const selectPopup = style({
  background: vars.color.panel2,
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: 11,
  boxShadow: vars.shadow.lg,
  padding: 6,
  minWidth: 160,
  maxHeight: 260,
  overflow: 'auto',
});
export const selectItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '7px 9px',
  borderRadius: 7,
  fontSize: 13,
  color: vars.color.text,
  cursor: 'pointer',
  userSelect: 'none',
  outline: 'none',
  selectors: {
    '&[data-highlighted]': { background: vars.color.subtle },
    '&[data-selected]': { color: vars.color.accent, fontWeight: 600 },
  },
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
  fontSize: 13,
  fontWeight: 550,
  color: vars.color.text,
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
  border: `1px solid ${vars.color.border}`,
  background: vars.color.panel2,
  borderRadius: 10,
  padding: 8,
});
export const typegridBtn = style({
  border: `1px solid ${vars.color.border}`,
  background: vars.color.panel,
  borderRadius: 7,
  padding: '8px 9px',
  fontSize: 12.5,
  cursor: 'pointer',
  color: vars.color.text,
  textAlign: 'left',
  fontFamily: 'inherit',
  selectors: {
    '&:hover': {
      borderColor: vars.color.accent,
      color: vars.color.accent,
      background: vars.color.accentSoft,
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
export const relLabel = style({ fontSize: 12, color: vars.color.text, paddingTop: 12 });
export const childstack = style({ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 });
export const relslot = style({
  minHeight: 44,
  border: `1px dashed ${vars.color.borderStrong}`,
  background: 'transparent',
  color: vars.color.faint,
  borderRadius: vars.radius.sm,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '0 12px',
  fontSize: 12.5,
  fontWeight: 600,
  cursor: 'pointer',
  width: '100%',
  fontFamily: 'inherit',
  selectors: {
    '&:hover': { borderColor: vars.color.accent, color: vars.color.accent },
    '&:focus-visible': focusRing,
    '&:disabled': { cursor: 'default', opacity: 0.6 },
    // Keep the resting look while disabled — no accent hover on a dead control.
    '&:disabled:hover': { borderColor: vars.color.borderStrong, color: vars.color.faint },
  },
});
export const pfield = style({
  minHeight: 44,
  border: `1px solid ${vars.color.borderStrong}`,
  background: vars.color.panel,
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
  background: vars.color.accentSoft,
  color: vars.color.accent,
  fontSize: 9,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '0 0 auto',
});
export const pfieldBody = style({ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 });
export const pfieldName = style({
  fontSize: 13,
  fontWeight: 550,
  color: vars.color.text,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});
export const pfieldDates = style({ fontSize: 11, color: vars.color.faint });

/* ---- Person picker (Base UI Popover) -------------------------------- */

export const pickerPopup = style({
  background: vars.color.panel,
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: 11,
  boxShadow: vars.shadow.lg,
  padding: 9,
  width: 288,
});
export const pickerList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  marginTop: 8,
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
  borderRadius: 7,
  cursor: 'pointer',
  color: vars.color.text,
  fontFamily: 'inherit',
  selectors: {
    '&:hover': { background: vars.color.subtle },
    '&:focus-visible': focusRing,
  },
});
export const pickerMeta = style({ fontSize: 12, color: vars.color.faint, padding: '6px 8px' });
export const pickerCreate = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  marginTop: 6,
  border: 0,
  borderTop: `1px solid ${vars.color.border}`,
  paddingTop: 9,
  paddingBottom: 3,
  paddingInline: 8,
  background: 'transparent',
  color: vars.color.accent,
  fontWeight: 650,
  fontSize: 12.5,
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
  fontSize: 12.5,
  color: vars.color.danger,
  background: `color-mix(in srgb, ${vars.color.danger} 12%, transparent)`,
  border: `1px solid color-mix(in srgb, ${vars.color.danger} 30%, transparent)`,
  borderRadius: 8,
  padding: '9px 12px',
});

/* ---- discard AlertDialog ------------------------------------------- */

export const alertBackdrop = style({
  position: 'fixed',
  inset: 0,
  zIndex: 110,
  background: vars.color.scrim,
});
export const alertPopup = style({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 111,
  fontFamily: vars.font.sans,
  width: 'calc(100vw - 44px)',
  maxWidth: 440,
  background: vars.color.panel,
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: 12,
  boxShadow: vars.shadow.lg,
  padding: 20,
});
export const alertTitle = style({
  fontSize: 16,
  fontWeight: 650,
  color: vars.color.text,
  margin: 0,
});
export const alertDesc = style({
  fontSize: 13,
  color: vars.color.muted,
  margin: '8px 0 0',
  lineHeight: 1.5,
});
export const alertActions = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 10,
  marginTop: 18,
});
