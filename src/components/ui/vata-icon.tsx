import * as React from 'react';

import { cn } from '$lib/utils';

/**
 * Vata custom icon set — 24px grid, 1.5px stroke, rounded joins.
 * Each glyph may carry one small terracotta accent (uses var(--primary)).
 */

const GLYPHS = {
  tree: (
    <>
      <circle cx="6" cy="5" r="2" />
      <circle cx="18" cy="5" r="2" />
      <circle cx="12" cy="19" r="2" fill="var(--primary)" stroke="var(--primary)" />
      <path d="M6 7v3M18 7v3M6 10h12M12 10v7" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
      <circle cx="12" cy="8" r="1" fill="var(--primary)" stroke="none" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="9" r="3" />
      <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" />
      <path d="M15 7.2a3 3 0 0 1 0 5.6" />
      <path d="M17 19c0-2.2 1.2-3.8 4-4.4" />
    </>
  ),
  'person-plus': (
    <>
      <circle cx="10" cy="8" r="3.3" />
      <path d="M3.5 20c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" />
      <path d="M19 5v5M16.5 7.5h5" stroke="var(--primary)" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.5-4.5" />
      <circle cx="11" cy="11" r="1.3" fill="var(--primary)" stroke="none" />
    </>
  ),
  home: (
    <>
      <path d="M4 11 12 4l8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1Z" />
      <circle cx="12" cy="14" r="1.2" fill="var(--primary)" stroke="none" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.3 7-11.5A7 7 0 1 0 5 9.5C5 14.7 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.2" fill="var(--primary)" stroke="none" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <rect x="9.5" y="13" width="2.2" height="2.2" rx=".3" fill="var(--primary)" stroke="none" />
    </>
  ),
  document: (
    <>
      <path d="M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v4h4M8 12h8M8 15.5h8M8 19h5" />
    </>
  ),
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
      <circle cx="9" cy="10" r="1.8" fill="var(--primary)" stroke="none" />
      <path d="m4.5 18 4.5-4.5 4 4 3.5-3 3 3" />
    </>
  ),
  bookmark: (
    <>
      <path d="M6 3h12v18l-6-4-6 4Z" />
      <circle cx="12" cy="10" r="1.4" fill="var(--primary)" stroke="none" />
    </>
  ),
  upload: (
    <>
      <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
      <path d="M12 4v11M7 9l5-5 5 5" strokeLinejoin="round" />
    </>
  ),
  download: (
    <>
      <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
      <path d="M12 4v11M7 10l5 5 5-5" strokeLinejoin="round" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5.5" rx="7" ry="2.5" />
      <path d="M5 5.5v13c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-13" />
      <path d="M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" />
      <circle cx="8" cy="18" r="0.8" fill="var(--primary)" stroke="none" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="2.8" />
      <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" />
    </>
  ),
  filter: (
    <>
      <path d="M4 5h16l-6 8v5l-4 2v-7Z" />
      <circle cx="12" cy="18" r="1.2" fill="var(--primary)" stroke="none" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5Z" />
      <path d="m3 13 9 5 9-5M3 18l9 5 9-5" />
    </>
  ),
  'zoom-in': (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.5-4.5M8.5 11H13M11 8.5V13" stroke="var(--primary)" />
    </>
  ),
  'zoom-out': (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.5-4.5M8.5 11H13" stroke="var(--primary)" />
    </>
  ),
  undo: (
    <>
      <path d="M4 10h9a6 6 0 0 1 0 12H9" />
      <path d="M4 10l4-4M4 10l4 4" />
    </>
  ),
  redo: (
    <>
      <path d="M20 10h-9a6 6 0 0 0 0 12h4" />
      <path d="m20 10-4-4M20 10l-4 4" />
    </>
  ),
  share: (
    <>
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="6" r="2.4" />
      <circle cx="18" cy="18" r="2.4" />
      <path d="m8 11 8-4M8 13l8 4" />
    </>
  ),
  merge: (
    <>
      <circle cx="6" cy="5" r="2" />
      <circle cx="18" cy="5" r="2" />
      <circle cx="12" cy="20" r="2" />
      <path d="M6 7v2a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V7M12 13v5" />
      <circle cx="12" cy="13" r="0.8" fill="var(--primary)" stroke="none" />
    </>
  ),
  external: (
    <path d="M14 4h6v6M20 4l-9 9M10 6H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" />
  ),
  star: <path d="m12 3.5 2.7 5.5 6 .9-4.3 4.2 1 6L12 17.3 6.6 20.1l1-6L3.3 9.9l6-.9Z" />,
  heart: <path d="M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.7-7 10-7 10Z" />,
  link: (
    <>
      <path d="M10 14a4 4 0 0 1 0-5.6l2.8-2.8a4 4 0 0 1 5.6 5.6l-1.5 1.5" />
      <path d="M14 10a4 4 0 0 1 0 5.6l-2.8 2.8a4 4 0 0 1-5.6-5.6l1.5-1.5" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 4v6M12 14v6M4 12h6M14 12h6" />
      <circle cx="12" cy="12" r="1.6" fill="var(--primary)" stroke="none" />
    </>
  ),
  ribbon: (
    <>
      <path d="M7 3h10v12l-5-3-5 3Z" />
      <path d="M7 15l-2 6 3.5-2 3.5 2 3.5-2 3.5 2-2-6" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7v13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7" />
      <path d="M10 11v6M14 11v6" />
      <circle cx="12" cy="4.5" r=".9" fill="var(--primary)" stroke="none" />
    </>
  ),
  check: <path d="m5 12 5 5 9-11" />,
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="m9 6 6 6-6 6" />,

  /* ---- Extensions for Vata app (same 1.5px style, optional clay accent) ---- */

  moon: (
    <>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
      <circle cx="17" cy="8" r="0.9" fill="var(--primary)" stroke="none" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="3.6" fill="var(--primary)" stroke="var(--primary)" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2 2M16.8 16.8l2 2M5.2 18.8l2-2M16.8 7.2l2-2" />
    </>
  ),
  monitor: (
    <>
      <rect x="3" y="4" width="18" height="13" rx="1.5" />
      <path d="M8 20h8M12 17v3" />
      <circle cx="7" cy="7.5" r="0.9" fill="var(--primary)" stroke="none" />
    </>
  ),
  languages: (
    <>
      <path d="M3.5 5h7M7 3v2M4 11c0-3 1.5-5 3-6 1.5 1 3 3 3 6" />
      <path d="M3.5 9h7" />
      <path d="M14 21l4-10 4 10M15.5 18h5" stroke="var(--primary)" />
    </>
  ),
  pencil: (
    <>
      <path d="M4 20h4l10-10-4-4L4 16Z" />
      <path d="m13 6 4 4" />
      <path d="m17 4 2 2-1.5 1.5-2-2Z" fill="var(--primary)" stroke="var(--primary)" />
    </>
  ),
  'folder-open': (
    <>
      <path d="M3 7a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v2" />
      <path d="m4 10 2 9a1 1 0 0 0 1 .8h11.5a1 1 0 0 0 1-.8l1.5-7a1 1 0 0 0-1-1.2H5a1 1 0 0 0-1 .8Z" />
      <circle cx="12" cy="15" r="1" fill="var(--primary)" stroke="none" />
    </>
  ),
  'file-up': (
    <>
      <path d="M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v4h4" />
      <path d="M12 17v-6M9.5 13 12 10.5 14.5 13" stroke="var(--primary)" strokeLinejoin="round" />
    </>
  ),
  'arrow-up-down': (
    <>
      <path d="M8 4v16M4 8l4-4 4 4" strokeLinejoin="round" />
      <path d="M16 20V4M12 16l4 4 4-4" stroke="var(--primary)" strokeLinejoin="round" />
    </>
  ),
  circle: <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />,
  'circle-check': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" stroke="var(--primary)" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6" />
      <circle cx="12" cy="7.5" r="1" fill="var(--primary)" stroke="none" />
    </>
  ),
  'loader-circle': (
    <>
      <path d="M12 3a9 9 0 1 1-9 9" />
      <circle cx="12" cy="3" r="1" fill="var(--primary)" stroke="none" />
    </>
  ),
  'octagon-x': (
    <>
      <path d="M8 3h8l5 5v8l-5 5H8l-5-5V8Z" />
      <path d="m9 9 6 6M15 9l-6 6" stroke="var(--primary)" />
    </>
  ),
  'triangle-alert': (
    <>
      <path d="M12 3.5 22 20H2Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="1" fill="var(--primary)" stroke="none" />
    </>
  ),
} as const;

export type VataIconName = keyof typeof GLYPHS;

export interface VataIconProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'name'> {
  name: VataIconName;
  size?: number | string;
}

export function VataIcon({
  name,
  size = 16,
  className,
  'aria-hidden': ariaHidden = true,
  ...rest
}: VataIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={cn('shrink-0', className)}
      {...rest}
    >
      {GLYPHS[name]}
    </svg>
  );
}

export const VATA_ICON_NAMES = Object.keys(GLYPHS) as VataIconName[];
