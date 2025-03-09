# Families

The `families` table represents family units, typically consisting of a couple (married or otherwise) and their potential children.

## Schema

| Column     | Type                     | Description                                                                  |
| ---------- | ------------------------ | ---------------------------------------------------------------------------- |
| id         | uuid                     | Primary key, automatically generated                                         |
| created_at | timestamp with time zone | Timestamp of record creation                                                 |
| husband_id | uuid                     | Reference to the individual who is the husband (nullable)                    |
| wife_id    | uuid                     | Reference to the individual who is the wife (nullable)                       |
| gedcom_id  | bigint                   | Auto-incrementing ID for GEDCOM compatibility                                |
| type       | family_type              | Type of family relationship (enum: married, civil union, unknown, unmarried) |

## Relationships

- Has one `individual` as husband through `husband_id`
- Has one `individual` as wife through `wife_id`
- Has many `family_children` through `family_id`
- Has many `family_events` through `family_id`

## Row Level Security

Row level security is enabled on this table.

## Notes

- Both `husband_id` and `wife_id` are nullable to accommodate various family structures
- The `type` field indicates the nature of the relationship between the partners
- A family can exist with only one parent (either `husband_id` or `wife_id` can be null)
- Children are linked to families through the `family_children` table
