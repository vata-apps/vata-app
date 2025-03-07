-- First, delete any existing individual event types
DELETE FROM individual_event_types;

-- Then insert our custom individual event types with specific IDs
INSERT INTO individual_event_types (id, name)
VALUES
    (get_individual_event_type_id('birth'), 'birth'),
    (get_individual_event_type_id('death'), 'death'),
    (get_individual_event_type_id('baptism'), 'baptism'),
    (get_individual_event_type_id('burial'), 'burial'),
    (get_individual_event_type_id('graduation'), 'graduation'),
    (get_individual_event_type_id('retirement'), 'retirement'),
    (get_individual_event_type_id('immigration'), 'immigration'),
    (get_individual_event_type_id('emigration'), 'emigration'),
    (get_individual_event_type_id('naturalization'), 'naturalization'),
    (get_individual_event_type_id('census'), 'census'),
    (get_individual_event_type_id('will'), 'will'),
    (get_individual_event_type_id('probate'), 'probate'),
    (get_individual_event_type_id('other'), 'other'); 
