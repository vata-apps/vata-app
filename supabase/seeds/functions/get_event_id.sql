CREATE OR REPLACE FUNCTION get_event_id(event_name TEXT)
RETURNS UUID AS $$
DECLARE
    event_uuid UUID;
BEGIN
    -- Generate a deterministic UUID based on the event name
    -- This ensures consistent IDs across database resets
    event_uuid := uuid_generate_v5(
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, -- namespace UUID
        event_name
    );
    
    RETURN event_uuid;
END;
$$ LANGUAGE plpgsql; 
