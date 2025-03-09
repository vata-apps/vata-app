# Individual Events

The `individual_events` table records events associated with individuals throughout their lives.

## Schema

| Column        | Type                     | Description                                                |
| ------------- | ------------------------ | ---------------------------------------------------------- |
| id            | uuid                     | Primary key, automatically generated                       |
| created_at    | timestamp with time zone | Timestamp of record creation                               |
| individual_id | uuid                     | Reference to the individual                                |
| type_id       | uuid                     | Reference to the event type                                |
| date          | text                     | Date of the event (nullable)                               |
| place_id      | uuid                     | Reference to the place where the event occurred (nullable) |
| description   | text                     | Additional details about the event (nullable)              |

## Relationships

- Belongs to one `individual` through `individual_id`
- Belongs to one `individual_event_type` through `type_id`
- Can belong to one `place` through `place_id`

## Row Level Security

Row level security is enabled on this table.

## Notes

- Events can include birth, death, baptism, graduation, etc.
- The `date` field is stored as text to accommodate various date formats and partial dates
- The `place_id` is optional but helps track where events occurred
- The `description` field allows for additional context about the event
