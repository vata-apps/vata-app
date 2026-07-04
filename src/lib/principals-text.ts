import { formatName } from '$db-tree/names';
import type { EventPrincipal, Name } from '$types/database';

/** A single principal name, falling back to the unknown label. */
export function nameText(name: Name | null, unknownLabel: string): string {
  if (!name) return unknownLabel;
  return formatName(name).full;
}

/** Comma-joined principal names for an event row, spouses paired with `&`. */
export function principalsText(principals: EventPrincipal[], unknownLabel: string): string {
  if (principals.length === 0) return unknownLabel;
  return principals
    .map((principal) =>
      principal.kind === 'individual'
        ? nameText(principal.name, unknownLabel)
        : `${nameText(principal.husband, unknownLabel)} & ${nameText(principal.wife, unknownLabel)}`
    )
    .join(', ');
}
