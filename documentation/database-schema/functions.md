# Database Functions

The database includes several functions that provide complex data operations and aggregations.

## get_next_gedcom_id

Returns the next available `gedcom_id` for a specific table and tree.

### Signature

```sql
get_next_gedcom_id(table_name: string, tree_id: string) RETURNS number
```

### Parameters

- `table_name` (string): The name of the table (e.g., 'individuals', 'families', 'events', 'places')
- `tree_id` (string): The UUID of the tree

### Returns

- The next available `gedcom_id` (number) for the specified table and tree.

## get_current_gedcom_id

Returns the current sequence value for a specific table and tree (for debugging or inspection).

### Signature

```sql
get_current_gedcom_id(table_name: string, tree_id: string) RETURNS number
```

### Parameters

- `table_name` (string): The name of the table
- `tree_id` (string): The UUID of the tree

### Returns

- The current value of the `gedcom_id` sequence (number) for the specified table and tree.

## Notes

- Functions provide server-side processing for complex queries
- They help reduce the number of round trips between client and database
- Functions respect row level security policies
- JSON return types allow for flexible data structures
- Functions can be called from SQL queries or through the Supabase client
- Performance is optimized through database-level processing
