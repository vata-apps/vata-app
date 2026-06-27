import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

/** Reset so a router `Link` carries no underline or link color of its own. */
const plainLinkStyle = { textDecoration: 'none', color: 'inherit' } as const;

/** Links its children to an individual's page within the given tree. */
export function IndividualLink({
  treeId,
  individualId,
  children,
}: {
  treeId: string;
  individualId: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <Link
      to="/tree/$treeId/individual/$individualId"
      params={{ treeId, individualId }}
      style={plainLinkStyle}
    >
      {children}
    </Link>
  );
}

/** Links its children to a place's page within the given tree. */
export function PlaceLink({
  treeId,
  placeId,
  children,
}: {
  treeId: string;
  placeId: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <Link to="/tree/$treeId/place/$placeId" params={{ treeId, placeId }} style={plainLinkStyle}>
      {children}
    </Link>
  );
}
