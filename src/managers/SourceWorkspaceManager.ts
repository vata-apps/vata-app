import { createIndividual } from '$db-tree/individuals';
import { createName } from '$db-tree/names';
import { getEventTypeByTag, createEvent, addEventParticipant } from '$db-tree/events';
import { createFamily, addFamilyMember } from '$db-tree/families';
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

  /**
   * Create an event from template configuration and add participants.
   * Returns the event ID, or undefined if the template has no event type tag
   * and no override is provided.
   */
  static async createEventFromTemplate(
    template: TemplateDefinition,
    resolvedSlots: ResolvedSlot[],
    options: {
      eventTypeTag?: string;
      date?: string;
      placeId?: string;
    }
  ): Promise<string | undefined> {
    const tag = options.eventTypeTag || template.eventTypeTag;
    if (!tag) return undefined;

    const eventType = await getEventTypeByTag(tag);
    if (!eventType) return undefined;

    const eventId = await createEvent({
      eventTypeId: eventType.id,
      dateOriginal: options.date,
      placeId: options.placeId,
    });

    // Build a set of slot keys that are defined in the template
    const templateSlotKeys = new Set(template.slots.map((s) => s.key));

    for (const resolved of resolvedSlots) {
      const templateSlot = template.slots.find((s) => s.key === resolved.slotKey);

      if (templateSlot) {
        // Only add as participant if the template slot has a participantRole
        if (templateSlot.participantRole) {
          await addEventParticipant({
            eventId,
            individualId: resolved.individualId,
            role: templateSlot.participantRole,
          });
        }
      } else if (!templateSlotKeys.has(resolved.slotKey)) {
        // Free-form slot (not defined in template) — add with role 'other'
        await addEventParticipant({
          eventId,
          individualId: resolved.individualId,
          role: 'other',
        });
      }
    }

    return eventId;
  }

  /**
   * Create families based on template family rules and resolved slots.
   * Returns an array of created family IDs.
   */
  static async createFamilies(
    template: TemplateDefinition,
    resolvedSlots: ResolvedSlot[]
  ): Promise<string[]> {
    const slotMap = new Map(resolvedSlots.map((r) => [r.slotKey, r.individualId]));
    const familyIds: string[] = [];

    for (const rule of template.families) {
      if (rule.type === 'couple') {
        // Need both members present
        const allPresent = rule.members.every((m) => slotMap.has(m.slot));
        if (!allPresent) continue;

        const familyId = await createFamily({});
        for (const member of rule.members) {
          const individualId = slotMap.get(member.slot)!;
          await addFamilyMember({
            familyId,
            individualId,
            role: member.role,
          });
        }
        familyIds.push(familyId);
      } else if (rule.type === 'parent-child') {
        // Need the child + at least one parent
        const childMember = rule.members.find((m) => m.role === 'child');
        if (!childMember || !slotMap.has(childMember.slot)) continue;

        const parentMembers = rule.members.filter((m) => m.role !== 'child');
        const hasAtLeastOneParent = parentMembers.some((m) => slotMap.has(m.slot));
        if (!hasAtLeastOneParent) continue;

        const familyId = await createFamily({});
        for (const member of rule.members) {
          const individualId = slotMap.get(member.slot);
          if (individualId) {
            await addFamilyMember({
              familyId,
              individualId,
              role: member.role,
            });
          }
        }
        familyIds.push(familyId);
      }
    }

    return familyIds;
  }
}
