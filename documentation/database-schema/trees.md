# Trees Table

The `trees` table manages multiple family trees within the application, allowing users to organize and separate different family lineages or research projects.

## Table Structure

| Column      | Type                     | Constraints           | Description                           |
| ----------- | ------------------------ | --------------------- | ------------------------------------- |
| id          | uuid                     | PRIMARY KEY, NOT NULL | Unique identifier for the tree        |
| created_at  | timestamp with time zone | NOT NULL              | Timestamp when the record was created |
| name        | text                     | NOT NULL              | Human-readable name for the tree      |
| description | text                     |                       | Optional description of the tree      |
| is_default  | boolean                  | NOT NULL              | Whether this is the default tree      |

## Purpose

The trees table serves as the root organizational structure for the genealogy application, enabling:

- **Multi-tree Support**: Users can maintain separate family trees for different lineages
- **Data Isolation**: All genealogical data is scoped to a specific tree via `tree_id` foreign keys
- **Default Tree**: One tree can be marked as default for initial data entry
- **Organization**: Trees can have descriptive names and descriptions for easy identification

## Relationships

- **One-to-Many**: A tree can have many individuals, families, events, places, etc.
- All other tables in the system reference this table via a `tree_id` foreign key

## Data Integrity

- **Cascade Deletion**: When a tree is deleted, all associated data (individuals, families, events, etc.) is automatically deleted
- **Single Default**: Only one tree should be marked as default (enforced at application level)
- **Required References**: All main data tables require a valid `tree_id`

## Security

- Row Level Security (RLS) is enabled
- Read access is granted to all users
- Standard CRUD permissions are available for anon, authenticated, and service_role users

## Indexes

- Primary key index on `id`
- Implicit index on `is_default` for efficient default tree queries

## Initial Data

A default tree is created during migration:

- Name: "Default Family Tree"
- Description: "The main family tree"
- is_default: true
