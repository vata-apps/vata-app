# Events

The `events` table is the main table for recording all types of events in the genealogical database. This unified system handles both individual and family events through a flexible participant-based model.

## Schema

| Column      | Type                     | Description                                                |
| ----------- | ------------------------ | ---------------------------------------------------------- |
| id          | uuid                     | Primary key, automatically generated                       |
| created_at  | timestamp with time zone | Timestamp of record creation                               |
| type_id     | uuid                     | Reference to the event type                                |
| date        | text                     | Date of the event (nullable)                               |
| place_id    | uuid                     | Reference to the place where the event occurred (nullable) |
| description | text                     | Additional details about the event (nullable)              |

## Relationships

- Belongs to one `event_type` through `type_id`
- Can belong to one `place` through `place_id`
- Has many `event_subjects` (who the event is about)
- Has many `event_participants` (everyone involved with specific roles)

## Row Level Security

Row level security is enabled on this table.

## Event Participation Model

Events use a flexible participation model:

- **Event Subjects**: The primary individuals the event is about (e.g., the person being born, the couple getting married)
- **Event Participants**: All individuals involved in the event with specific roles (e.g., witnesses, officiants, parents)

## Notes

- The unified event system can handle any type of event (birth, death, marriage, divorce, etc.)
- The `date` field is stored as text to accommodate various date formats and partial dates
- The `place_id` is optional but helps track where events occurred
- The `description` field allows for additional context about the event
- Events are connected to individuals through the `event_subjects` and `event_participants` tables
