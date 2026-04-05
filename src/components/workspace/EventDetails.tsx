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
    <div
      style={{
        marginBottom: '0.75rem',
        padding: '0.6rem',
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        background: '#fff',
      }}
    >
      <div
        style={{
          fontSize: '0.7rem',
          color: '#888',
          textTransform: 'uppercase',
          marginBottom: '0.4rem',
        }}
      >
        Event Details
      </div>
      <div style={{ marginBottom: '0.4rem' }}>
        <label
          htmlFor="event-date-input"
          style={{
            display: 'block',
            fontSize: '0.7rem',
            color: '#666',
            marginBottom: '0.15rem',
          }}
        >
          Date
        </label>
        <input
          id="event-date-input"
          type="text"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          placeholder="e.g., 15 Jun 1892"
          style={{
            width: '100%',
            padding: '0.3rem 0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '0.8rem',
            boxSizing: 'border-box',
          }}
        />
      </div>
      <div>
        <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '0.15rem' }}>Place</div>
        <PlaceAutocomplete value={place} onChange={onPlaceChange} />
      </div>
    </div>
  );
}
