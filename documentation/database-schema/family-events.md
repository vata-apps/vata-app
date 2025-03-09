# Family Events

The `family_events` table records events associated with families, such as marriages, divorces, and other significant family occasions.

## Schema

| Column      | Type                     | Description                                                |
| ----------- | ------------------------ | ---------------------------------------------------------- |
| id          | uuid                     | Primary key, automatically generated                       |
| created_at  | timestamp with time zone | Timestamp of record creation                               |
| family_id   | uuid                     | Reference to the family                                    |
| type_id     | uuid                     | Reference to the event type                                |
| date        | text                     | Date of the event (nullable)                               |
| place_id    | uuid                     | Reference to the place where the event occurred (nullable) |
| description | text                     | Additional details about the event (nullable)              |

## Relationships

- Belongs to one `family` through `family_id`
- Belongs to one `family_event_type` through `type_id`
- Can belong to one `place` through `place_id`

## Row Level Security

Row level security is enabled on this table.

## Notes

- Events can include marriages, divorces, engagements, etc.
- The `date` field is stored as text to accommodate various date formats and partial dates
- The `place_id` is optional but helps track where events occurred
- The `description` field allows for additional context about the event
