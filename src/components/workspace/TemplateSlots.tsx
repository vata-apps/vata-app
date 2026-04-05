import { PersonSlot, type PersonSlotValue } from './PersonSlot';
import type { TemplateDefinition } from '$/lib/templates';

interface TemplateSlotsProps {
  template: TemplateDefinition;
  values: Record<string, PersonSlotValue | PersonSlotValue[] | null>;
  onChange: (slotKey: string, value: PersonSlotValue | null, index?: number) => void;
}

export function TemplateSlots({ template, values, onChange }: TemplateSlotsProps): JSX.Element {
  return (
    <div style={{ padding: '0.75rem 1rem' }}>
      {template.slots.map((slot) => {
        if (slot.multiple) {
          const entries = (values[slot.key] as PersonSlotValue[] | null) ?? [];
          return (
            <div key={slot.key}>
              {entries.map((entry, index) => (
                <PersonSlot
                  key={`${slot.key}-${index}`}
                  label={`${slot.label} ${index + 1}`}
                  value={entry}
                  defaultGender={slot.gender}
                  onChange={(val) => onChange(slot.key, val, index)}
                />
              ))}
              <PersonSlot
                key={`${slot.key}-new`}
                label={entries.length === 0 ? slot.label : `${slot.label} ${entries.length + 1}`}
                defaultGender={slot.gender}
                onChange={(val) => onChange(slot.key, val, entries.length)}
              />
            </div>
          );
        }

        return (
          <PersonSlot
            key={slot.key}
            label={slot.label}
            value={values[slot.key] as PersonSlotValue | null}
            defaultGender={slot.gender}
            required={slot.required}
            onChange={(val) => onChange(slot.key, val)}
          />
        );
      })}
    </div>
  );
}
