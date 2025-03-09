# Individuals

The `individuals` table stores basic information about each person in the genealogical database.

## Schema

| Column     | Type                     | Description                                   |
| ---------- | ------------------------ | --------------------------------------------- |
| id         | uuid                     | Primary key, automatically generated          |
| created_at | timestamp with time zone | Timestamp of record creation                  |
| gender     | gender                   | Gender of the individual (enum: male, female) |
| gedcom_id  | bigint                   | Auto-incrementing ID for GEDCOM compatibility |

## Relationships

- Has many `names` through `individual_id`
- Has many `individual_events` through `individual_id`
- Can be a husband in multiple `families` through `husband_id`
- Can be a wife in multiple `families` through `wife_id`
- Can be a child in multiple `family_children` through `individual_id`

## Row Level Security

Row level security is enabled on this table.
