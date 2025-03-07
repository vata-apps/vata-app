-- First, delete any existing place types
DELETE FROM place_types;

-- Then insert our custom place types with specific IDs
INSERT INTO place_types (id, name)
VALUES
    (get_place_type_id('country'), 'country'),
    (get_place_type_id('state'), 'state'),
    (get_place_type_id('province'), 'province'),
    (get_place_type_id('city'), 'city'),
    (get_place_type_id('town'), 'town'),
    (get_place_type_id('village'), 'village'),
    (get_place_type_id('address'), 'address'),
    (get_place_type_id('cemetery'), 'cemetery'),
    (get_place_type_id('church'), 'church'),
    (get_place_type_id('hospital'), 'hospital'),
    (get_place_type_id('other'), 'other'); 
