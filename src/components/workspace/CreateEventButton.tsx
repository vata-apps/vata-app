import type { TemplateDefinition } from '$/lib/templates';
import type { PersonSlotValue } from './PersonSlot';

interface CreateEventButtonProps {
  template: TemplateDefinition;
  slotValues: Record<string, PersonSlotValue | PersonSlotValue[] | null>;
  freeFormValues: PersonSlotValue[];
  isPending: boolean;
  onSubmit: () => void;
}

function countCreations(
  template: TemplateDefinition,
  slotValues: Record<string, PersonSlotValue | PersonSlotValue[] | null>,
  freeFormValues: PersonSlotValue[]
): { individuals: number; families: number; events: number; citations: number } {
  let individuals = 0;
  const filledSlotKeys: string[] = [];

  // Count from template slots
  for (const slot of template.slots) {
    const val = slotValues[slot.key];
    if (slot.multiple && Array.isArray(val)) {
      for (const v of val) {
        if (v.type === 'new') individuals++;
        filledSlotKeys.push(slot.key);
      }
    } else if (val && !Array.isArray(val)) {
      if (val.type === 'new') individuals++;
      filledSlotKeys.push(slot.key);
    }
  }

  // Count free-form
  individuals += freeFormValues.filter((v) => v.type === 'new').length;

  const events = template.eventTypeTag ? 1 : 0;
  const families = template.families.filter((rule) => {
    if (rule.type === 'couple') {
      return rule.members.every((m) => filledSlotKeys.includes(m.slot));
    }
    const childSlot = rule.members.find((m) => m.role === 'child')?.slot;
    const hasParent = rule.members.some(
      (m) => m.role !== 'child' && filledSlotKeys.includes(m.slot)
    );
    return Boolean(childSlot) && filledSlotKeys.includes(childSlot!) && hasParent;
  }).length;

  return { individuals, families, events, citations: 1 };
}

export function CreateEventButton({
  template,
  slotValues,
  freeFormValues,
  isPending,
  onSubmit,
}: CreateEventButtonProps): JSX.Element {
  // Check if required slots are filled
  const hasRequired = template.slots
    .filter((s) => s.required)
    .every((s) => {
      const val = slotValues[s.key];
      return val && (!Array.isArray(val) || val.length > 0);
    });

  const isGenericEmpty = template.id === 'generic' && freeFormValues.length === 0;
  const disabled = isPending || (!hasRequired && template.slots.length > 0) || isGenericEmpty;

  const counts = countCreations(template, slotValues, freeFormValues);
  const label = template.eventTypeTag ? `Create ${template.label} Event` : 'Create Citation';

  const summaryParts: string[] = [];
  if (counts.events > 0) summaryParts.push(`${counts.events} event`);
  if (counts.individuals > 0)
    summaryParts.push(`${counts.individuals} individual${counts.individuals > 1 ? 's' : ''}`);
  if (counts.families > 0)
    summaryParts.push(`${counts.families} famil${counts.families > 1 ? 'ies' : 'y'}`);
  summaryParts.push('1 citation');

  return (
    <div
      style={{
        margin: '0.75rem 1rem',
        padding: '0.75rem',
        background: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
      }}
    >
      <button
        onClick={onSubmit}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '0.6rem',
          background: disabled ? '#999' : '#333',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {isPending ? 'Creating...' : label}
      </button>
      <div style={{ fontSize: '0.7rem', color: '#888', textAlign: 'center', marginTop: '0.4rem' }}>
        Will create: {summaryParts.join(', ')}
      </div>
    </div>
  );
}
