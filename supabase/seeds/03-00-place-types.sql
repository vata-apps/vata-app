INSERT INTO place_types (tree_id, id, name)
VALUES
    /* *************************************************************************
     * HARRY POTTER
     * ************************************************************************* */
    
    (get_tree_id('hp'), get_place_type_id('country'),  'Country'),
    (get_tree_id('hp'), get_place_type_id('state'),    'State'),
    (get_tree_id('hp'), get_place_type_id('province'), 'Province'),
    (get_tree_id('hp'), get_place_type_id('city'),     'City'),
    (get_tree_id('hp'), get_place_type_id('town'),     'Town'),
    (get_tree_id('hp'), get_place_type_id('village'),  'Village'),
    (get_tree_id('hp'), get_place_type_id('address'),  'Address'),
    (get_tree_id('hp'), get_place_type_id('cemetery'), 'Cemetery'),
    (get_tree_id('hp'), get_place_type_id('church'),   'Church'),
    (get_tree_id('hp'), get_place_type_id('hospital'), 'Hospital'),
    (get_tree_id('hp'), get_place_type_id('other'),    'Other');

    /* *************************************************************************
     * GAME OF THRONES
     * ************************************************************************* */
    -- TODO: Add Game of Thrones place types

    /* *************************************************************************
     * NOS ÉTÉS
     * ************************************************************************* */
    -- TODO: Add Nos Étés place types 
