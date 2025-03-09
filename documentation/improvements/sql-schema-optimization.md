# SQL Schema Optimization

This document outlines potential improvements to the database schema, including recommendations for views, functions, indexes, and table column modifications. Each suggestion includes what needs to be done, why it matters, how to implement it, and actionable tasks.

## 1. Add Performance Indexes

### What?

Create additional indexes for common query patterns to improve performance.

### Why?

The current schema only has primary key indexes, but lacks indexes for common query patterns like:

- Searching individuals by name
- Filtering events by date
- Finding places by name or type
- Retrieving children for a specific family

Without these indexes, queries will perform full table scans as data grows, leading to slower performance.

### How?

Add targeted indexes for the most common query patterns.

### Actionable Tasks

1. Add index for name searches:

   ```sql
   -- Index for searching individuals by name
   CREATE INDEX idx_names_first_last ON names (first_name, last_name);

   -- Index for primary names (most commonly used)
   CREATE INDEX idx_names_is_primary ON names (individual_id) WHERE is_primary = true;
   ```

2. Add indexes for event queries:

   ```sql
   -- Index for filtering individual events by date
   CREATE INDEX idx_individual_events_date ON individual_events (date);

   -- Index for filtering family events by date
   CREATE INDEX idx_family_events_date ON family_events (date);

   -- Combined indexes for common queries
   CREATE INDEX idx_individual_events_type_date ON individual_events (type_id, date);
   CREATE INDEX idx_family_events_type_date ON family_events (type_id, date);
   ```

3. Add indexes for place queries:

   ```sql
   -- Index for searching places by name
   CREATE INDEX idx_places_name ON places (name);

   -- Index for filtering places by type
   CREATE INDEX idx_places_type ON places (type_id);

   -- Index for hierarchical queries
   CREATE INDEX idx_places_parent ON places (parent_id);
   ```

4. Add indexes for family relationships:
   ```sql
   -- Indexes for finding families by husband/wife
   CREATE INDEX idx_families_husband ON families (husband_id);
   CREATE INDEX idx_families_wife ON families (wife_id);
   ```

## 2. Create Read-Optimized Views

### What?

Create database views to simplify common queries and improve readability.

### Why?

Currently, the application needs to perform complex joins to retrieve related data like:

- Individual details with their names
- Events with place information
- Family details with spouse and children information

This leads to duplicated query logic across API functions and potential inconsistencies.

### How?

Create well-designed views that pre-join related tables for common query patterns.

### Actionable Tasks

1. Create a view for individuals with their primary name:

   ```sql
   CREATE VIEW individuals_with_names AS
   SELECT
     i.id,
     i.gender,
     i.gedcom_id,
     n.first_name,
     n.last_name,
     n.surname,
     n.type as name_type
   FROM
     individuals i
   LEFT JOIN
     names n ON i.id = n.individual_id AND n.is_primary = true;
   ```

2. Create a view for events with place information:

   ```sql
   CREATE VIEW individual_events_with_details AS
   SELECT
     ie.id,
     ie.individual_id,
     ie.date,
     ie.description,
     iet.name as event_type,
     p.name as place_name,
     p.id as place_id,
     pt.name as place_type
   FROM
     individual_events ie
   JOIN
     individual_event_types iet ON ie.type_id = iet.id
   LEFT JOIN
     places p ON ie.place_id = p.id
   LEFT JOIN
     place_types pt ON p.type_id = pt.id;

   CREATE VIEW family_events_with_details AS
   SELECT
     fe.id,
     fe.family_id,
     fe.date,
     fe.description,
     fet.name as event_type,
     p.name as place_name,
     p.id as place_id,
     pt.name as place_type
   FROM
     family_events fe
   JOIN
     family_event_types fet ON fe.type_id = fet.id
   LEFT JOIN
     places p ON fe.place_id = p.id
   LEFT JOIN
     place_types pt ON p.type_id = pt.id;
   ```

3. Create a view for family details:
   ```sql
   CREATE VIEW families_with_details AS
   SELECT
     f.id,
     f.type,
     f.husband_id,
     h_names.first_name as husband_first_name,
     h_names.last_name as husband_last_name,
     f.wife_id,
     w_names.first_name as wife_first_name,
     w_names.last_name as wife_last_name,
     (
       SELECT COUNT(*)
       FROM family_children fc
       WHERE fc.family_id = f.id
     ) as children_count
   FROM
     families f
   LEFT JOIN
     individuals_with_names h_names ON f.husband_id = h_names.id
   LEFT JOIN
     individuals_with_names w_names ON f.wife_id = w_names.id;
   ```

## 3. Enhance Data Types

### What?

Improve data types for better data integrity and query performance.

### Why?

The current schema has some suboptimal data type choices:

- Dates are stored as text fields instead of proper date types
- Latitude/longitude are stored as decimals without constraints
- The gender enum is limited to binary values
- Names are split into multiple nullable fields with unclear semantics

### How?

Update data types and constraints to better match the domain model.

### Actionable Tasks

1. Improve date handling:

   ```sql
   -- Add a structured date type to handle historical dates better
   CREATE TYPE historical_date AS (
     display_text TEXT,
     year INTEGER,
     month INTEGER,
     day INTEGER,
     is_approximate BOOLEAN
   );

   -- Add columns for structured dates (keeping original text for compatibility)
   ALTER TABLE individual_events ADD COLUMN parsed_date historical_date;
   ALTER TABLE family_events ADD COLUMN parsed_date historical_date;

   -- Create a function to parse text dates into structured format
   CREATE OR REPLACE FUNCTION parse_historical_date(date_text TEXT)
   RETURNS historical_date AS $$
   DECLARE
     result historical_date;
   BEGIN
     -- Basic implementation - would need more sophisticated parsing for real data
     -- This is just a placeholder for the concept
     result.display_text := date_text;
     result.is_approximate := date_text LIKE '%about%' OR date_text LIKE '%circa%' OR date_text LIKE '%ca.%';

     -- Extract year, month, day with regex (simplified)
     -- In a real implementation, this would handle more date formats

     RETURN result;
   END;
   $$ LANGUAGE plpgsql IMMUTABLE;
   ```

2. Improve geospatial data:

   ```sql
   -- Add constraints to latitude and longitude
   ALTER TABLE places ADD CONSTRAINT check_latitude CHECK (latitude >= -90 AND latitude <= 90);
   ALTER TABLE places ADD CONSTRAINT check_longitude CHECK (longitude >= -180 AND longitude <= 180);

   -- Consider using PostGIS for geospatial features if needed
   -- This would be a more advanced enhancement but very powerful
   -- CREATE EXTENSION postgis;
   -- ALTER TABLE places ADD COLUMN geom geometry(Point, 4326);
   ```

3. Expand gender options:
   ```sql
   -- Drop and recreate the gender enum with more options
   ALTER TYPE gender ADD VALUE 'unknown' AFTER 'female';
   ALTER TYPE gender ADD VALUE 'other' AFTER 'unknown';
   ```

## 4. Add Utility Functions

### What?

Create utility functions for common operations used throughout the application.

### Why?

The application currently implements certain operations in application code that would be more efficient in the database:

- Name formatting and display
- Hierarchical place formatting
- Date parsing and formatting
- Family relationship determination

### How?

Create SQL functions that can be used in queries to perform these operations.

### Actionable Tasks

1. Create name formatting function:

   ```sql
   CREATE OR REPLACE FUNCTION format_name(
     first_name TEXT,
     last_name TEXT,
     format TEXT DEFAULT 'full'
   ) RETURNS TEXT AS $$
   BEGIN
     IF format = 'full' THEN
       RETURN COALESCE(first_name, '') || ' ' || COALESCE(last_name, '');
     ELSIF format = 'last_first' THEN
       RETURN COALESCE(last_name, '') || ', ' || COALESCE(first_name, '');
     ELSIF format = 'initial' THEN
       RETURN SUBSTRING(COALESCE(first_name, ' '), 1, 1) || '. ' || COALESCE(last_name, '');
     ELSE
       RETURN COALESCE(first_name, '') || ' ' || COALESCE(last_name, '');
     END IF;
   END;
   $$ LANGUAGE plpgsql IMMUTABLE;
   ```

2. Create place hierarchy function:

   ```sql
   CREATE OR REPLACE FUNCTION get_place_hierarchy(place_id UUID)
   RETURNS TEXT AS $$
   DECLARE
     result TEXT := '';
     current_id UUID := place_id;
     current_name TEXT;
   BEGIN
     WHILE current_id IS NOT NULL LOOP
       SELECT name, parent_id
       INTO current_name, current_id
       FROM places
       WHERE id = current_id;

       IF result = '' THEN
         result := current_name;
       ELSE
         result := current_name || ', ' || result;
       END IF;
     END LOOP;

     RETURN result;
   END;
   $$ LANGUAGE plpgsql STABLE;
   ```

3. Create relationship determination function:

   ```sql
   CREATE OR REPLACE FUNCTION get_relationship(person1_id UUID, person2_id UUID)
   RETURNS TEXT AS $$
   DECLARE
     relationship TEXT := 'unknown';
   BEGIN
     -- Check if direct parent/child
     IF EXISTS (
       SELECT 1 FROM families f
       JOIN family_children fc ON f.id = fc.family_id
       WHERE (f.husband_id = person1_id OR f.wife_id = person1_id)
       AND fc.individual_id = person2_id
     ) THEN
       RETURN 'parent';
     END IF;

     IF EXISTS (
       SELECT 1 FROM families f
       JOIN family_children fc ON f.id = fc.family_id
       WHERE (f.husband_id = person2_id OR f.wife_id = person2_id)
       AND fc.individual_id = person1_id
     ) THEN
       RETURN 'child';
     END IF;

     -- Check if siblings
     IF EXISTS (
       SELECT 1 FROM family_children fc1
       JOIN family_children fc2 ON fc1.family_id = fc2.family_id
       WHERE fc1.individual_id = person1_id
       AND fc2.individual_id = person2_id
       AND fc1.individual_id != fc2.individual_id
     ) THEN
       RETURN 'sibling';
     END IF;

     -- Check if spouses
     IF EXISTS (
       SELECT 1 FROM families
       WHERE (husband_id = person1_id AND wife_id = person2_id)
       OR (husband_id = person2_id AND wife_id = person1_id)
     ) THEN
       RETURN 'spouse';
     END IF;

     -- More relationship checks could be added

     RETURN relationship;
   END;
   $$ LANGUAGE plpgsql STABLE;
   ```

## 5. Implement Record Tracking and Soft Delete

### What?

Implement automatic tracking of record modifications with `updated_at` timestamps and soft delete functionality with `deleted_at` timestamps.

### Why?

The current schema doesn't track when records were last modified or deleted:

- Without `updated_at`, it's difficult to determine which records have changed recently
- Without `deleted_at`, deleted data is permanently lost and can't be recovered
- Tracking these timestamps enables data auditing, sync operations, and recovery from mistakes

### How?

Add timestamp columns and triggers to automatically update these columns when records are modified or deleted.

### Actionable Tasks

1. Add tracking columns to tables:

   ```sql
   -- Add updated_at and deleted_at columns to main tables
   ALTER TABLE individuals ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE, ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
   ALTER TABLE families ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE, ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
   ALTER TABLE places ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE, ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
   ALTER TABLE names ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE, ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
   ALTER TABLE individual_events ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE, ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
   ALTER TABLE family_events ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE, ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
   ALTER TABLE family_children ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE, ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
   ```

2. Create filtered indexes for active records:

   ```sql
   -- Create indexes that only include active records
   CREATE INDEX idx_individuals_active ON individuals (id) WHERE deleted_at IS NULL;
   CREATE INDEX idx_families_active ON families (id) WHERE deleted_at IS NULL;
   CREATE INDEX idx_places_active ON places (id) WHERE deleted_at IS NULL;

   -- Create indexes for recently updated records (useful for sync operations)
   CREATE INDEX idx_individuals_updated ON individuals (updated_at) WHERE deleted_at IS NULL;
   CREATE INDEX idx_families_updated ON families (updated_at) WHERE deleted_at IS NULL;
   CREATE INDEX idx_places_updated ON places (updated_at) WHERE deleted_at IS NULL;
   ```

3. Update views to filter out deleted records:

   ```sql
   -- Update views to only include active records
   CREATE OR REPLACE VIEW individuals_with_names AS
   SELECT /* same columns as before */
   FROM individuals i
   LEFT JOIN names n ON i.id = n.individual_id AND n.is_primary = true
   WHERE i.deleted_at IS NULL AND n.deleted_at IS NULL;

   -- Similarly update other views
   ```

4. Create automatic timestamp update triggers:

   ```sql
   -- Create a function for updating timestamps
   CREATE OR REPLACE FUNCTION update_timestamp() RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   -- Create a function for soft deletes
   CREATE OR REPLACE FUNCTION soft_delete() RETURNS TRIGGER AS $$
   BEGIN
     NEW.deleted_at = NOW();
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   -- Create triggers for each table

   -- Individuals table triggers
   CREATE TRIGGER individuals_update_timestamp
   BEFORE UPDATE ON individuals
   FOR EACH ROW
   WHEN (OLD IS DISTINCT FROM NEW AND OLD.deleted_at IS NULL)
   EXECUTE FUNCTION update_timestamp();

   CREATE TRIGGER individuals_soft_delete
   BEFORE DELETE ON individuals
   FOR EACH ROW
   EXECUTE FUNCTION soft_delete();

   -- Similarly create triggers for other tables
   ```

5. Create a function to restore deleted records:
   ```sql
   -- Function to restore a soft-deleted record
   CREATE OR REPLACE FUNCTION restore_record(table_name TEXT, record_id UUID)
   RETURNS BOOLEAN AS $$
   DECLARE
     success BOOLEAN := FALSE;
     query TEXT;
   BEGIN
     query := 'UPDATE ' || table_name ||
              ' SET deleted_at = NULL, updated_at = NOW()' ||
              ' WHERE id = ''' || record_id || '''' ||
              ' AND deleted_at IS NOT NULL';

     EXECUTE query;

     GET DIAGNOSTICS success = ROW_COUNT;
     RETURN success > 0;
   END;
   $$ LANGUAGE plpgsql;
   ```

## Conclusion

These database schema improvements will enhance performance, data integrity, and maintainability. The suggested changes range from simple improvements like adding indexes to more complex enhancements like implementing record tracking, soft deletes, and structured date handling.

For implementation, it's recommended to start with the simpler changes like adding indexes and creating views, which provide immediate benefits with minimal risk. More complex changes like modifying data types or implementing record tracking should be planned carefully, especially if the system already contains production data.
