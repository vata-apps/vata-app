# Event Subjects

The `event_subjects` table links events to the primary individuals that the event is about. This table identifies who the main subject(s) of an event are.

## Schema

| Column        | Type                     | Description                          |
| ------------- | ------------------------ | ------------------------------------ |
| id            | uuid                     | Primary key, automatically generated |
| created_at    | timestamp with time zone | Timestamp of record creation         |
| event_id      | uuid                     | Reference to the event               |
| individual_id | uuid                     | Reference to the individual          |

## Relationships

- Belongs to one `event` through `event_id`
- Belongs to one `individual` through `individual_id`

## Row Level Security

Row level security is enabled on this table.

## Usage Examples

- **Birth Event**: The newborn is the subject
- **Death Event**: The deceased person is the subject
- **Marriage Event**: Both the husband and wife are subjects
- **Baptism Event**: The person being baptized is the subject
- **Graduation Event**: The graduate is the subject

## Notes

- An event can have multiple subjects (e.g., marriage has two subjects)
- Most events will have only one subject
- This table distinguishes between who the event is about (subjects) vs. who else was involved (participants)
- The combination of event_id and individual_id should be unique to prevent duplicate subject entries
