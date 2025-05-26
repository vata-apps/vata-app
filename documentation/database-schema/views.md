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

## family_sorting_view

A view that provides family information with searchable names for sorting and filtering.

### Schema

| Column             | Type   | Description                              |
| ------------------ | ------ | ---------------------------------------- |
| id                 | string | Family ID                                |
| created_at         | string | Family creation timestamp                |
| gedcom_id          | number | GEDCOM identifier                        |
| type               | string | Family type (married, civil union, etc.) |
| husband_id         | string | Husband's individual ID                  |
| husband_first_name | string | Husband's first name                     |
| husband_last_name  | string | Husband's last name                      |
| wife_id            | string | Wife's individual ID                     |
| wife_first_name    | string | Wife's first name                        |
| wife_last_name     | string | Wife's last name                         |
| searchable_names   | string | Combined searchable names string         |

### Usage

This view is useful for:

- Displaying family lists with spouse names
- Searching families by spouse names
- Sorting families alphabetically
- Family selection interfaces

## Notes

- Views are read-only and automatically updated when underlying tables change
- Views provide performance benefits by pre-joining commonly accessed data
- The JSON fields in views may contain complex nested data structures
- Views respect the same row level security policies as their underlying tables
