import { useState } from 'react';
import { Button } from '$components/ui/button';
import { PersonSlot, type PersonSlotValue } from './PersonSlot';

interface FreeFormAddProps {
  values: PersonSlotValue[];
  onChange: (values: PersonSlotValue[]) => void;
}

export function FreeFormAdd({ values, onChange }: FreeFormAddProps): JSX.Element {
  const [showNew, setShowNew] = useState(false);

  function handleAdd(val: PersonSlotValue | null) {
    if (val) {
      onChange([...values, val]);
    }
    setShowNew(false);
  }

  function handleRemove(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div className="px-4 pb-3">
      {values.map((val, index) => (
        <PersonSlot
          key={`freeform-${index}`}
          label={`Person ${index + 1}`}
          value={val}
          onChange={(v) => {
            if (!v) handleRemove(index);
          }}
        />
      ))}
      {showNew ? (
        <PersonSlot label="New Person" onChange={handleAdd} />
      ) : (
        <Button type="button" variant="link" onClick={() => setShowNew(true)} className="w-full">
          + Add person
        </Button>
      )}
    </div>
  );
}
