import { PlaceAutocomplete, type PlaceValue } from './PlaceAutocomplete';

interface EventDetailsProps {
  date: string;
  place: PlaceValue | null;
  onDateChange: (date: string) => void;
  onPlaceChange: (place: PlaceValue | null) => void;
}

export function EventDetails({
  date,
  place,
  onDateChange,
  onPlaceChange,
}: EventDetailsProps): JSX.Element {
  return (
    <div className="mb-3 rounded-md border border-border bg-card p-2.5">
      <div className="mb-1.5 text-[11px] uppercase text-muted-foreground">Event Details</div>
      <div className="mb-1.5">
        <label
          htmlFor="event-date-input"
          className="mb-0.5 block text-[11px] text-muted-foreground"
        >
          Date
        </label>
        <input
          id="event-date-input"
          type="text"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          placeholder="e.g., 15 Jun 1892"
          className="box-border w-full rounded border border-border px-2 py-1 text-xs"
        />
      </div>
      <div>
        <div className="mb-0.5 text-[11px] text-muted-foreground">Place</div>
        <PlaceAutocomplete value={place} onChange={onPlaceChange} />
      </div>
    </div>
  );
}
