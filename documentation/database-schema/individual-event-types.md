# Individual Event Types

The `individual_event_types` table defines the different types of events that can be associated with individuals.

## Schema

| Column     | Type                     | Description                          |
| ---------- | ------------------------ | ------------------------------------ |
| id         | uuid                     | Primary key, automatically generated |
| created_at | timestamp with time zone | Timestamp of record creation         |
| name       | text                     | Name of the event type               |

## Relationships

- Has many `individual_events` through `type_id`

## Row Level Security

Row level security is enabled on this table.

## Default Values

The following event types are pre-populated in the database:

- birth
- death
- baptism
- burial
- graduation
- retirement
- immigration
- emigration
- naturalization
- census
- will
- probate
- other

## Notes

- Each event type must have a unique name
- The list of event types helps standardize event categorization
- The pre-populated types cover common life events in genealogical research
- New types can be added as needed
