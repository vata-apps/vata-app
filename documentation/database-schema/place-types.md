# Place Types

The `place_types` table defines the different types of places that can be recorded in the genealogical database.

## Schema

| Column     | Type                     | Description                          |
| ---------- | ------------------------ | ------------------------------------ |
| id         | uuid                     | Primary key, automatically generated |
| created_at | timestamp with time zone | Timestamp of record creation         |
| name       | text                     | Name of the place type               |

## Relationships

- Has many `places` through `type_id`

## Row Level Security

Row level security is enabled on this table.

## Default Values

The following place types are pre-populated in the database:

- country
- state
- province
- city
- town
- village
- address
- cemetery
- church
- hospital
- other

## Notes

- Each place type must have a unique name
- The list of place types helps standardize place categorization
- The pre-populated types cover common genealogical place categories
- New types can be added as needed
