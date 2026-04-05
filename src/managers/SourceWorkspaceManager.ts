import { createIndividual } from '$db-tree/individuals';
import { createName } from '$db-tree/names';
import type { TemplateDefinition } from '$lib/templates';
import type { Gender } from '$/types/database';

// =============================================================================
// Types
// =============================================================================

export interface SlotValue {
  slotKey: string;
  existingId?: string;
  newName?: string;
  newGender?: Gender;
}

interface ResolvedSlot {
  slotKey: string;
  individualId: string;
  created: boolean;
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Parse a full name string into given names and surname.
 * The last word is treated as the surname; everything else is given names.
 * Single-word names become the surname with no given names.
 */
export function parseName(fullName: string): { givenNames?: string; surname?: string } {
  const trimmed = fullName.trim();
  if (!trimmed) return {};

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { surname: parts[0] };
  }

  const surname = parts[parts.length - 1];
  const givenNames = parts.slice(0, -1).join(' ');
  return { givenNames, surname };
}

// =============================================================================
// SourceWorkspaceManager
// =============================================================================

export class SourceWorkspaceManager {
  /**
   * Resolve slot values into individuals. Creates new individuals with
   * primary names for slots that don't reference an existing individual.
   * Skips slots with neither existingId nor newName.
   */
  static async resolveIndividuals(
    slots: SlotValue[],
    template: TemplateDefinition
  ): Promise<ResolvedSlot[]> {
    const resolved: ResolvedSlot[] = [];

    for (const slot of slots) {
      if (slot.existingId) {
        resolved.push({
          slotKey: slot.slotKey,
          individualId: slot.existingId,
          created: false,
        });
        continue;
      }

      if (!slot.newName || !slot.newName.trim()) {
        continue;
      }

      // Determine gender: explicit from slot, or default from template slot definition
      const templateSlot = template.slots.find((s) => s.key === slot.slotKey);
      const gender: Gender = slot.newGender ?? templateSlot?.gender ?? 'U';

      const individualId = await createIndividual({ gender });
      const { givenNames, surname } = parseName(slot.newName);
      await createName({
        individualId,
        givenNames,
        surname,
        isPrimary: true,
      });

      resolved.push({
        slotKey: slot.slotKey,
        individualId,
        created: true,
      });
    }

    return resolved;
  }
}
