import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EventTypeSelector } from './EventTypeSelector';
import { TemplateSlots } from './TemplateSlots';
import { EventDetails } from './EventDetails';
import { CreateEventButton } from './CreateEventButton';
import { FreeFormAdd } from './FreeFormAdd';
import { getTemplateById } from '$/lib/templates';
import { SourceWorkspaceManager } from '$/managers/SourceWorkspaceManager';
import { queryKeys } from '$/lib/query-keys';
import type { PersonSlotValue } from './PersonSlot';
import type { PlaceValue } from './PlaceAutocomplete';
import type { SlotValue } from '$/managers/SourceWorkspaceManager';

interface RightPanelProps {
  sourceId: string;
}

export function RightPanel({ sourceId }: RightPanelProps): JSX.Element {
  const queryClient = useQueryClient();
  const [templateId, setTemplateId] = useState('');
  const [slotValues, setSlotValues] = useState<
    Record<string, PersonSlotValue | PersonSlotValue[] | null>
  >({});
  const [date, setDate] = useState('');
  const [place, setPlace] = useState<PlaceValue | null>(null);
  const [freeFormValues, setFreeFormValues] = useState<PersonSlotValue[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const template = templateId ? getTemplateById(templateId) : null;

  const { mutate: submit, isPending } = useMutation({
    mutationFn: async () => {
      if (!template) throw new Error('No template selected');

      const slots: SlotValue[] = [];

      for (const slot of template.slots) {
        const val = slotValues[slot.key];
        if (slot.multiple && Array.isArray(val)) {
          for (const v of val) {
            slots.push(personSlotToSlotValue(slot.key, v));
          }
        } else if (val && !Array.isArray(val)) {
          slots.push(personSlotToSlotValue(slot.key, val));
        }
      }

      for (let i = 0; i < freeFormValues.length; i++) {
        slots.push(personSlotToSlotValue(`freeform_${i}`, freeFormValues[i]));
      }

      return SourceWorkspaceManager.createFromTemplate({
        sourceId,
        templateId: template.id,
        slots,
        date: date || undefined,
        place: place?.type === 'new' ? place.name : undefined,
        existingPlaceId: place?.type === 'existing' ? place.id : undefined,
      });
    },
    onSuccess: (result) => {
      setSlotValues({});
      setDate('');
      setPlace(null);
      setFreeFormValues([]);
      setSuccessMessage(
        `Created${result.eventId ? ' event' : ''}: ${result.createdIndividuals.length} individual(s), ${result.createdFamilies.length} family(ies), 1 citation`
      );
      setTimeout(() => setSuccessMessage(null), 4000);

      void queryClient.invalidateQueries({ queryKey: queryKeys.citationsWithDetails(sourceId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.citations(sourceId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.individuals });
      void queryClient.invalidateQueries({ queryKey: queryKeys.families });
      void queryClient.invalidateQueries({ queryKey: queryKeys.events });
    },
  });

  function handleTemplateChange(newId: string) {
    const hasFilled = Object.values(slotValues).some(
      (v) => v !== null && (!Array.isArray(v) || v.length > 0)
    );
    if (
      hasFilled &&
      !window.confirm('Changing the template will clear all filled slots. Continue?')
    ) {
      return;
    }
    setTemplateId(newId);
    setSlotValues({});
  }

  const handleSlotChange = useCallback(
    (slotKey: string, value: PersonSlotValue | null, index?: number) => {
      setSlotValues((prev) => {
        const slot = template?.slots.find((s) => s.key === slotKey);
        if (slot?.multiple) {
          const arr = (prev[slotKey] as PersonSlotValue[] | null) ?? [];
          const newArr = [...arr];
          if (value) {
            newArr[index ?? arr.length] = value;
          } else if (index !== undefined) {
            newArr.splice(index, 1);
          }
          return { ...prev, [slotKey]: newArr };
        }
        return { ...prev, [slotKey]: value };
      });
    },
    [template]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <EventTypeSelector value={templateId} onChange={handleTemplateChange} />

      {template && (
        <>
          <TemplateSlots template={template} values={slotValues} onChange={handleSlotChange} />
          <EventDetails date={date} place={place} onDateChange={setDate} onPlaceChange={setPlace} />
          <FreeFormAdd values={freeFormValues} onChange={setFreeFormValues} />
          <CreateEventButton
            template={template}
            slotValues={slotValues}
            freeFormValues={freeFormValues}
            isPending={isPending}
            onSubmit={() => submit()}
          />
        </>
      )}

      {successMessage && (
        <div
          style={{
            margin: '0 1rem',
            padding: '0.5rem',
            background: '#e8f5e9',
            borderRadius: '4px',
            fontSize: '0.8rem',
            color: '#2e7d32',
            textAlign: 'center',
          }}
        >
          {successMessage}
        </div>
      )}

      {!template && (
        <div
          style={{
            padding: '2rem 1rem',
            textAlign: 'center',
            color: '#888',
            fontSize: '0.85rem',
          }}
        >
          Select a document type above to begin.
        </div>
      )}
    </div>
  );
}

function personSlotToSlotValue(slotKey: string, psv: PersonSlotValue): SlotValue {
  if (psv.type === 'existing') {
    return { slotKey, existingId: psv.id };
  }
  return { slotKey, newName: psv.newName, newGender: psv.newGender };
}
