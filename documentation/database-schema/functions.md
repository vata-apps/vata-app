# Database Functions

The database includes several functions that provide complex data operations and aggregations.

## get_event_participants

Returns detailed information about all participants in a specific event, including their roles and individual details.

### Signature

```sql
get_event_participants(event_id: string) RETURNS Json
```

### Parameters

- `event_id` (string): The UUID of the event to get participants for

### Returns

Returns a JSON object containing detailed event and participant information, including:

- Event details (date, description, type, place)
- All participants with their roles and individual information
- Nested individual names and other details

### Usage

This function is useful for:

- Displaying complete event details with all participants
- Event detail pages
- Generating event reports
- API endpoints that need full event context

## get_events_with_subjects

Returns a paginated list of events with their subjects, supporting search and sorting.

### Signature

```sql
get_events_with_subjects(
  search_text?: string,
  page_number?: number,
  sort_field?: string,
  sort_direction?: string
) RETURNS TABLE
```

### Parameters

- `search_text` (optional string): Text to search in event descriptions, types, and places
- `page_number` (optional number): Page number for pagination (default: 1)
- `sort_field` (optional string): Field to sort by (date, event_type_name, place_name, etc.)
- `sort_direction` (optional string): Sort direction ('asc' or 'desc')

### Returns

Returns a table with the following columns:

- `id` (string): Event ID
- `date` (string): Event date
- `description` (string): Event description
- `event_type_name` (string): Name of the event type
- `place_name` (string): Name of the place where event occurred
- `subjects` (string): Comma-separated list of subject names

### Usage

This function is useful for:

- Event listing pages with search and pagination
- Event browsing interfaces
- Generating event summaries
- API endpoints for event lists

## Notes

- Functions provide server-side processing for complex queries
- They help reduce the number of round trips between client and database
- Functions respect row level security policies
- JSON return types allow for flexible data structures
- Functions can be called from SQL queries or through the Supabase client
- Performance is optimized through database-level processing
