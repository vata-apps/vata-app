# Database Views

The database includes several views that provide convenient access to complex data by joining multiple tables and aggregating information.

## event_details

A comprehensive view that combines event information with related data for easy querying.

### Schema

| Column          | Type   | Description                                      |
| --------------- | ------ | ------------------------------------------------ |
| id              | string | Event ID                                         |
| created_at      | string | Event creation timestamp                         |
| date            | string | Event date                                       |
| description     | string | Event description                                |
| type_id         | string | Event type ID                                    |
| event_type_name | string | Name of the event type                           |
| place_id        | string | Place ID where event occurred                    |
| place_name      | string | Name of the place where event occurred           |
| subjects        | Json   | JSON array of individuals who are event subjects |

### Usage

This view is useful for:

- Displaying event lists with type and place names
- Searching events by type or location
- Getting event details without multiple joins

## Notes

- Views are read-only and automatically updated when underlying tables change
- Views provide performance benefits by pre-joining commonly accessed data
- The JSON fields in views may contain complex nested data structures
- Views respect the same row level security policies as their underlying tables
