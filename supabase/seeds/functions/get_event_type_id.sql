CREATE OR REPLACE FUNCTION get_event_type_id(event_type_name TEXT)
RETURNS UUID AS $$
DECLARE
    event_type_id UUID;
BEGIN
    SELECT id INTO event_type_id
    FROM event_types
    WHERE name = event_type_name;
    
    IF event_type_id IS NULL THEN
        RAISE EXCEPTION 'Event type % not found', event_type_name;
    END IF;
    
    RETURN event_type_id;
END;
$$ LANGUAGE plpgsql; 
