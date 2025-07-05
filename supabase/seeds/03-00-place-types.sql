INSERT INTO place_types (tree_id, id, name, key, is_system)
VALUES
    /* *************************************************************************
     * HARRY POTTER
     * ************************************************************************* */
    
    (get_tree_id('hp'), get_place_type_id('country'),  'Country',   'country',   true),
    (get_tree_id('hp'), get_place_type_id('state'),    'State',     'state',     true),
    (get_tree_id('hp'), get_place_type_id('province'), 'Province',  'province',  true),
    (get_tree_id('hp'), get_place_type_id('city'),     'City',      'city',      true),
    (get_tree_id('hp'), get_place_type_id('town'),     'Town',      'town',      true),
    (get_tree_id('hp'), get_place_type_id('village'),  'Village',   'village',   true),
    (get_tree_id('hp'), get_place_type_id('address'),  'Address',   'address',   true),
    (get_tree_id('hp'), get_place_type_id('cemetery'), 'Cemetery',  'cemetery',  true),
    (get_tree_id('hp'), get_place_type_id('church'),   'Church',    'church',    true),
    (get_tree_id('hp'), get_place_type_id('hospital'), 'Hospital',  'hospital',  true),
    (get_tree_id('hp'), get_place_type_id('other'),    'Other',     'other',     true);

    /* *************************************************************************
     * GAME OF THRONES
     * ************************************************************************* */
    -- TODO: Add Game of Thrones place types

    /* *************************************************************************
     * NOS ÉTÉS
     * ************************************************************************* */
    -- TODO: Add Nos Étés place types 
