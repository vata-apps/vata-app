import './sidebar-row.css';

import type { HTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from '@tanstack/react-router';

import { Icon } from '$components/icon';

/**
 * Props for the shared row shell. All `Link` props (to, params, …) are
 * forwarded verbatim; `className` and `aria-current` are managed internally.
 */
type SidebarRowProps = Omit<LinkProps, 'className' | 'children'> & {
  /** Drives `aria-current="page"` and selection styling. */
  selected: boolean;
  /**
   * Entity-specific leading visual (e.g. avatar circle, couple circles).
   * Omit for rows without a leading element (Events, Places); the left
   * padding adjusts automatically via the `--has-leading` modifier class.
   */
  leading?: ReactNode;
  /** Row text content, typically composed from SidebarRow.Name / .Meta / .Eyebrow. */
  children: ReactNode;
};

function SidebarRowRoot({
  selected,
  leading,
  children,
  ...linkProps
}: SidebarRowProps): JSX.Element {
  return (
    <Link
      {...linkProps}
      className={`sidebar-row${leading != null ? ' sidebar-row--has-leading' : ''}`}
      aria-current={selected ? 'page' : undefined}
    >
      {leading}
      <span className="sidebar-row__text">{children}</span>
      <Icon name="chevron-right" size={14} className="sidebar-row__chev" />
    </Link>
  );
}

type NameProps = Omit<HTMLAttributes<HTMLSpanElement>, 'className'> & {
  /** Render as italic/dim placeholder text. */
  unknown?: boolean;
  children: ReactNode;
};

function NameSlot({ unknown, children, ...props }: NameProps): JSX.Element {
  return (
    <span className={`sidebar-row__name${unknown ? ' sidebar-row__name--unknown' : ''}`} {...props}>
      {children}
    </span>
  );
}

type MetaProps = Omit<HTMLAttributes<HTMLSpanElement>, 'className'> & { children: ReactNode };

function MetaSlot({ children, ...props }: MetaProps): JSX.Element {
  return (
    <span className="sidebar-row__meta" {...props}>
      {children}
    </span>
  );
}

type EyebrowProps = Omit<HTMLAttributes<HTMLSpanElement>, 'className'> & { children: ReactNode };

function EyebrowSlot({ children, ...props }: EyebrowProps): JSX.Element {
  return (
    <span className="sidebar-row__eyebrow" {...props}>
      {children}
    </span>
  );
}

/**
 * Shared row shell for entity sidebar lists. Encapsulates the `Link` chrome —
 * border, hover, focus-visible, `aria-current` selection — and exposes
 * compound subcomponents for text content slots.
 *
 * The leading visual (avatar, couple circles) is supplied via the `leading`
 * prop and rendered as a flex sibling before the text block. Rows without a
 * leading element omit the prop; left padding adjusts automatically.
 *
 * @example
 * <SidebarRow
 *   to="/tree/$treeId/individual/$individualId"
 *   params={{ treeId, individualId }}
 *   selected={selected}
 *   leading={<span className="person-row__avatar">{initials}</span>}
 * >
 *   <SidebarRow.Name>{displayName}</SidebarRow.Name>
 *   <SidebarRow.Meta>{lifespan}</SidebarRow.Meta>
 * </SidebarRow>
 */
export const SidebarRow = Object.assign(SidebarRowRoot, {
  Name: NameSlot,
  Meta: MetaSlot,
  Eyebrow: EyebrowSlot,
});
