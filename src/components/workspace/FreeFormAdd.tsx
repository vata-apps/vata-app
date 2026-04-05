import { useState } from 'react';
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
    <div style={{ padding: '0 1rem 0.75rem' }}>
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
        <button
          type="button"
          onClick={() => setShowNew(true)}
          style={{
            width: '100%',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: '#4a90d9',
            cursor: 'pointer',
            padding: '0.5rem',
            background: 'none',
            border: 'none',
          }}
        >
          + Add person
        </button>
      )}
    </div>
  );
}
