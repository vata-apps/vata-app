# Event Types

The `event_types` table defines the different types of events that can be recorded in the genealogical database. This unified system handles both individual and family event types.

## Schema

| Column     | Type                     | Description                          |
| ---------- | ------------------------ | ------------------------------------ |
| id         | uuid                     | Primary key, automatically generated |
| created_at | timestamp with time zone | Timestamp of record creation         |
| name       | text                     | Name of the event type               |

## Relationships

- Has many `events` through `type_id`

## Row Level Security

Row level security is enabled on this table.

## Default Values

The following event types are pre-populated in the database:

- birth
- death
- marriage
- baptism
- burial
- graduation
- immigration
- emigration
- naturalization
- census
- will
- probate
- engagement
- divorce
- annulment
- separation
- retirement
- other

## Notes

- Each event type must have a unique name
- The list of event types helps standardize event categorization
- The pre-populated types cover common life events and family events in genealogical research
- New types can be added as needed
- The unified system eliminates the need for separate individual and family event types
