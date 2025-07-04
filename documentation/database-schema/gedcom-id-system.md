# GEDCOM ID System

The GEDCOM ID system provides tree-specific auto-incrementing identifiers for genealogical entities, ensuring each family tree has its own sequential numbering starting from 1.

## Overview

The `gedcom_id` columns in the `individuals` and `families` tables use tree-specific sequences to provide clean, sequential identifiers within each family tree. This is essential for GEDCOM compatibility and provides a user-friendly way to reference entities within a specific tree.

## Implementation

### Tree-Specific Sequences

Each tree gets its own PostgreSQL sequences:

- `individuals_gedcom_id_{tree_id}` - for individual IDs
- `families_gedcom_id_{tree_id}` - for family IDs
- `events_gedcom_id_{tree_id}` - for event IDs
- `places_gedcom_id_{tree_id}` - for place IDs

### Automatic Population

The `gedcom_id` values are automatically populated by database triggers:

1. **Before Insert Trigger**: When a new record is inserted, if `gedcom_id` is NULL, the trigger automatically assigns the next available ID for that tree
2. **Sequence Management**: Sequences are created automatically when needed and cleaned up when trees are deleted

### Functions

#### `get_next_gedcom_id(table_name, tree_id)`

Returns the next available `gedcom_id` for a specific table and tree.

#### `get_current_gedcom_id(table_name, tree_id)`

Returns the current sequence value for debugging purposes.

#### `cleanup_tree_sequences()`

Trigger function that cleans up sequences when a tree is deleted.

#### `set_event_gedcom_id()`

Trigger function for events table.

#### `set_place_gedcom_id()`

Trigger function for places table.

## Benefits

### 1. Tree Isolation

- Each tree has its own numbering system starting from 1
- No conflicts between different trees
- Clean, sequential IDs within each tree

### 2. GEDCOM Compatibility

- Follows GEDCOM standards for entity identification
- Provides stable, human-readable identifiers
- Maintains referential integrity

### 3. Performance

- Uses PostgreSQL sequences for optimal performance
- No table scans required for ID generation
- Handles concurrent inserts safely

### 4. Data Integrity

- Unique constraint on `(gedcom_id, tree_id)` ensures no duplicates
- Automatic cleanup when trees are deleted
- Maintains referential integrity

## Example

```sql
-- Tree A: individuals with gedcom_id 1, 2, 3, 4, 5
-- Tree B: individuals with gedcom_id 1, 2, 3, 4, 5, 6, 7
-- Tree C: individuals with gedcom_id 1, 2

-- Each tree starts from 1 and has no gaps
```

## Usage

### Inserting New Records

```sql
-- gedcom_id will be automatically assigned
INSERT INTO individuals (gender, tree_id) VALUES ('male', 'tree-uuid-here');

-- Or explicitly set if needed
INSERT INTO individuals (gender, gedcom_id, tree_id) VALUES ('female', 10, 'tree-uuid-here');
```

### Querying by GEDCOM ID

```sql
-- Find individual by GEDCOM ID within a specific tree
SELECT * FROM individuals
WHERE gedcom_id = 5 AND tree_id = 'tree-uuid-here';
```

### Debugging

```sql
-- Check current sequence value for a tree
SELECT get_current_gedcom_id('individuals', 'tree-uuid-here');
```

## Migration Notes

The migration from global identity columns to tree-specific sequences:

1. **Preserves existing data**: All existing `gedcom_id` values are maintained
2. **Initializes sequences**: Creates sequences for existing trees with proper starting values
3. **Maintains constraints**: Keeps the unique constraint on `(gedcom_id, tree_id)`
4. **Automatic operation**: New inserts automatically use the new system

## Maintenance

### Adding New Trees

- Sequences are created automatically when the first record is inserted
- No manual intervention required

### Deleting Trees

- Sequences are automatically cleaned up by the `cleanup_tree_sequences()` trigger
- No orphaned sequences remain

### Backup and Restore

- Sequences are included in database backups
- Restore operations will maintain the numbering system

## Troubleshooting

### Sequence Issues

If sequences become out of sync, you can reset them:

```sql
-- Reset sequence for a specific tree
SELECT setval('individuals_gedcom_id_tree-uuid-here',
              (SELECT COALESCE(MAX(gedcom_id), 0) FROM individuals WHERE tree_id = 'tree-uuid-here'),
              true);
```

### Missing Sequences

If a sequence is missing, it will be created automatically on the next insert. You can also create it manually:

```sql
-- Create sequence for a tree
SELECT get_next_gedcom_id('individuals', 'tree-uuid-here');
```
