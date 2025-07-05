-- Migration: Complete Tree-Specific GEDCOM ID System
-- This migration implements a comprehensive tree-specific sequence system for gedcom_id columns
-- across individuals, families, events, and places tables

-- Create a function to get the next gedcom_id for a specific tree and table
CREATE OR REPLACE FUNCTION get_next_gedcom_id(table_name text, tree_id uuid)
RETURNS bigint AS $$
DECLARE
    sequence_name text;
    next_id bigint;
BEGIN
    -- Create sequence name based on table and tree
    sequence_name := table_name || '_gedcom_id_' || tree_id;
    
    -- Create sequence if it doesn't exist
    EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I', sequence_name);
    
    -- Get next value
    EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_id;
    
    RETURN next_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for individuals table
CREATE OR REPLACE FUNCTION set_individual_gedcom_id()
RETURNS trigger AS $$
BEGIN
    IF NEW.gedcom_id IS NULL THEN
        NEW.gedcom_id := get_next_gedcom_id('individuals', NEW.tree_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for families table
CREATE OR REPLACE FUNCTION set_family_gedcom_id()
RETURNS trigger AS $$
BEGIN
    IF NEW.gedcom_id IS NULL THEN
        NEW.gedcom_id := get_next_gedcom_id('families', NEW.tree_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for events table
CREATE OR REPLACE FUNCTION set_event_gedcom_id()
RETURNS trigger AS $$
BEGIN
    IF NEW.gedcom_id IS NULL THEN
        NEW.gedcom_id := get_next_gedcom_id('events', NEW.tree_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for places table
CREATE OR REPLACE FUNCTION set_place_gedcom_id()
RETURNS trigger AS $$
BEGIN
    IF NEW.gedcom_id IS NULL THEN
        NEW.gedcom_id := get_next_gedcom_id('places', NEW.tree_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



-- Drop existing identity columns and recreate as regular bigint columns
-- First, drop the triggers if they exist
DROP TRIGGER IF EXISTS trigger_set_individual_gedcom_id ON individuals;
DROP TRIGGER IF EXISTS trigger_set_family_gedcom_id ON families;

-- Drop the identity columns and recreate as regular bigint columns
ALTER TABLE individuals ALTER COLUMN gedcom_id DROP IDENTITY IF EXISTS;
ALTER TABLE individuals ALTER COLUMN gedcom_id SET DATA TYPE bigint;
ALTER TABLE individuals ALTER COLUMN gedcom_id SET DEFAULT NULL;

ALTER TABLE families ALTER COLUMN gedcom_id DROP IDENTITY IF EXISTS;
ALTER TABLE families ALTER COLUMN gedcom_id SET DATA TYPE bigint;
ALTER TABLE families ALTER COLUMN gedcom_id SET DEFAULT NULL;

-- Add gedcom_id column to events table
ALTER TABLE events ADD COLUMN gedcom_id bigint;

-- Add gedcom_id column to places table
ALTER TABLE places ADD COLUMN gedcom_id bigint;

-- Create triggers to automatically populate gedcom_id
CREATE TRIGGER trigger_set_individual_gedcom_id
    BEFORE INSERT ON individuals
    FOR EACH ROW
    EXECUTE FUNCTION set_individual_gedcom_id();

CREATE TRIGGER trigger_set_family_gedcom_id
    BEFORE INSERT ON families
    FOR EACH ROW
    EXECUTE FUNCTION set_family_gedcom_id();

CREATE TRIGGER trigger_set_event_gedcom_id
    BEFORE INSERT ON events
    FOR EACH ROW
    EXECUTE FUNCTION set_event_gedcom_id();

CREATE TRIGGER trigger_set_place_gedcom_id
    BEFORE INSERT ON places
    FOR EACH ROW
    EXECUTE FUNCTION set_place_gedcom_id();

-- Add unique constraints to ensure gedcom_id is unique within each tree
CREATE UNIQUE INDEX events_gedcom_id_tree_key ON public.events USING btree (gedcom_id, tree_id);
CREATE UNIQUE INDEX places_gedcom_id_tree_key ON public.places USING btree (gedcom_id, tree_id);

-- Add the unique constraints
ALTER TABLE events ADD CONSTRAINT events_gedcom_id_tree_key UNIQUE using index events_gedcom_id_tree_key;
ALTER TABLE places ADD CONSTRAINT places_gedcom_id_tree_key UNIQUE using index places_gedcom_id_tree_key;

-- Function to initialize sequences for existing data
CREATE OR REPLACE FUNCTION initialize_all_gedcom_sequences()
RETURNS void AS $$
DECLARE
    tree_record RECORD;
    max_individual_id bigint;
    max_family_id bigint;
    max_event_id bigint;
    max_place_id bigint;
    sequence_name text;
BEGIN
    -- Loop through all trees
    FOR tree_record IN SELECT id FROM trees LOOP
        -- Initialize individuals sequence
        sequence_name := 'individuals_gedcom_id_' || tree_record.id;
        
        -- Get the maximum gedcom_id for this tree
        SELECT COALESCE(MAX(gedcom_id), 0) INTO max_individual_id
        FROM individuals
        WHERE tree_id = tree_record.id;
        
        -- Create sequence and set it to the next value
        EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I', sequence_name);
        IF max_individual_id > 0 THEN
            EXECUTE format('SELECT setval(%L, %s, true)', sequence_name, max_individual_id);
        END IF;
        
        -- Initialize families sequence
        sequence_name := 'families_gedcom_id_' || tree_record.id;
        
        -- Get the maximum gedcom_id for this tree
        SELECT COALESCE(MAX(gedcom_id), 0) INTO max_family_id
        FROM families
        WHERE tree_id = tree_record.id;
        
        -- Create sequence and set it to the next value
        EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I', sequence_name);
        IF max_family_id > 0 THEN
            EXECUTE format('SELECT setval(%L, %s, true)', sequence_name, max_family_id);
        END IF;
        
        -- Initialize events sequence
        sequence_name := 'events_gedcom_id_' || tree_record.id;
        
        -- Get the maximum gedcom_id for this tree
        SELECT COALESCE(MAX(gedcom_id), 0) INTO max_event_id
        FROM events
        WHERE tree_id = tree_record.id;
        
        -- Create sequence and set it to the next value
        EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I', sequence_name);
        IF max_event_id > 0 THEN
            EXECUTE format('SELECT setval(%L, %s, true)', sequence_name, max_event_id);
        END IF;
        
        -- Initialize places sequence
        sequence_name := 'places_gedcom_id_' || tree_record.id;
        
        -- Get the maximum gedcom_id for this tree
        SELECT COALESCE(MAX(gedcom_id), 0) INTO max_place_id
        FROM places
        WHERE tree_id = tree_record.id;
        
        -- Create sequence and set it to the next value
        EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I', sequence_name);
        IF max_place_id > 0 THEN
            EXECUTE format('SELECT setval(%L, %s, true)', sequence_name, max_place_id);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Initialize sequences for existing data
SELECT initialize_all_gedcom_sequences();

-- Clean up the initialization function
DROP FUNCTION initialize_all_gedcom_sequences();

-- Function to clean up sequences when a tree is deleted
CREATE OR REPLACE FUNCTION cleanup_tree_sequences()
RETURNS trigger AS $$
DECLARE
    sequence_name text;
BEGIN
    -- Clean up individuals sequences
    sequence_name := 'individuals_gedcom_id_' || OLD.id;
    EXECUTE format('DROP SEQUENCE IF EXISTS %I', sequence_name);
    
    -- Clean up families sequences
    sequence_name := 'families_gedcom_id_' || OLD.id;
    EXECUTE format('DROP SEQUENCE IF EXISTS %I', sequence_name);
    
    -- Clean up events sequences
    sequence_name := 'events_gedcom_id_' || OLD.id;
    EXECUTE format('DROP SEQUENCE IF EXISTS %I', sequence_name);
    
    -- Clean up places sequences
    sequence_name := 'places_gedcom_id_' || OLD.id;
    EXECUTE format('DROP SEQUENCE IF EXISTS %I', sequence_name);
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to clean up sequences when a tree is deleted
CREATE TRIGGER trigger_cleanup_tree_sequences
    AFTER DELETE ON trees
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_tree_sequences();

-- Function to get the current gedcom_id for a tree (useful for debugging)
CREATE OR REPLACE FUNCTION get_current_gedcom_id(table_name text, tree_id uuid)
RETURNS bigint AS $$
DECLARE
    sequence_name text;
    current_id bigint;
BEGIN
    sequence_name := table_name || '_gedcom_id_' || tree_id;
    
    -- Check if sequence exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_sequences 
        WHERE schemaname = 'public' 
        AND sequencename = sequence_name
    ) THEN
        RETURN 0;
    END IF;
    
    -- Get current value
    EXECUTE format('SELECT last_value FROM %I', sequence_name) INTO current_id;
    
    RETURN current_id;
END;
$$ LANGUAGE plpgsql;



-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_next_gedcom_id(text, uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION set_individual_gedcom_id() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION set_family_gedcom_id() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION set_event_gedcom_id() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION set_place_gedcom_id() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION cleanup_tree_sequences() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_current_gedcom_id(text, uuid) TO anon, authenticated, service_role; 
