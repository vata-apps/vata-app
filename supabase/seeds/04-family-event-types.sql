-- First, delete any existing family event types
DELETE FROM family_event_types;

-- Then insert our custom family event types with specific IDs
INSERT INTO family_event_types (id, name)
VALUES
    (get_family_event_type_id('marriage'), 'marriage'),
    (get_family_event_type_id('divorce'), 'divorce'),
    (get_family_event_type_id('engagement'), 'engagement'),
    (get_family_event_type_id('annulment'), 'annulment'),
    (get_family_event_type_id('separation'), 'separation'),
    (get_family_event_type_id('civil union'), 'civil union'),
    (get_family_event_type_id('other'), 'other'); 
