import { TEMPLATES } from '$/lib/templates';

interface EventTypeSelectorProps {
  value: string;
  onChange: (templateId: string) => void;
}

export function EventTypeSelector({ value, onChange }: EventTypeSelectorProps): JSX.Element {
  return (
    <div
      style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #e0e0e0',
        background: '#fff',
      }}
    >
      <div
        style={{
          fontSize: '0.75rem',
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '0.4rem',
        }}
      >
        Document Type
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '0.5rem',
          border: '1px solid #ddd',
          borderRadius: '6px',
          fontSize: '0.9rem',
        }}
      >
        <option value="">Select document type...</option>
        {TEMPLATES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}
