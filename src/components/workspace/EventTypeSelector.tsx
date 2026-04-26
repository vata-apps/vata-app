import { TEMPLATES } from '$/lib/templates';

interface EventTypeSelectorProps {
  value: string;
  onChange: (templateId: string) => void;
}

export function EventTypeSelector({ value, onChange }: EventTypeSelectorProps): JSX.Element {
  return (
    <div className="border-b border-border bg-card px-4 py-3">
      <label
        htmlFor="event-template-select"
        className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground"
      >
        Document Type
      </label>
      <select
        id="event-template-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-background p-2 text-sm"
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
