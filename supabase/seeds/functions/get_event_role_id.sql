CREATE OR REPLACE FUNCTION get_event_role_id(role_name TEXT)
RETURNS UUID AS $$
DECLARE
    role_id UUID;
BEGIN
    SELECT id INTO role_id
    FROM event_roles
    WHERE name = role_name;
    
    IF role_id IS NULL THEN
        RAISE EXCEPTION 'Event role % not found', role_name;
    END IF;
    
    RETURN role_id;
END;
$$ LANGUAGE plpgsql; 
