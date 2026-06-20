import type { PlaceType } from '$types/database';

/**
 * Resolves a PlaceType to its user-visible label string.
 *
 * Place types are not seeded and have no translation keys: a system type
 * carries only a `tag` (e.g. `CITY`), a custom type only a `customName`.
 * So the label is simply the custom name when present, otherwise the tag.
 * Returns an empty string for the (schema-forbidden) case where both are
 * absent, leaving the caller to apply its own fallback.
 */
export function placeTypeLabel(type: PlaceType): string {
  return type.customName ?? type.tag ?? '';
}
