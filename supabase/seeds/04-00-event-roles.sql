INSERT INTO event_roles (tree_id, id, name, key, is_system)
VALUES
    /* *************************************************************************
     * HARRY POTTER
     * ************************************************************************* */

    (get_tree_id('hp'), get_event_role_id('subject'),           'Subject',           'subject',           true),
    (get_tree_id('hp'), get_event_role_id('husband'),           'Husband',           'husband',           true),
    (get_tree_id('hp'), get_event_role_id('wife'),              'Wife',              'wife',              true),
    (get_tree_id('hp'), get_event_role_id('mother'),            'Mother',            'mother',            true),
    (get_tree_id('hp'), get_event_role_id('father'),            'Father',            'father',            true),
    (get_tree_id('hp'), get_event_role_id('witness'),           'Witness',           'witness',           true),
    (get_tree_id('hp'), get_event_role_id('godfather'),         'Godfather',         'godfather',         true),
    (get_tree_id('hp'), get_event_role_id('godmother'),         'Godmother',         'godmother',         true),
    (get_tree_id('hp'), get_event_role_id('officiant'),         'Officiant',         'officiant',         true),
    (get_tree_id('hp'), get_event_role_id('father_of_husband'), 'Father of Husband', 'father_of_husband', true),
    (get_tree_id('hp'), get_event_role_id('mother_of_husband'), 'Mother of Husband', 'mother_of_husband', true),
    (get_tree_id('hp'), get_event_role_id('father_of_wife'),    'Father of Wife',    'father_of_wife',    true),
    (get_tree_id('hp'), get_event_role_id('mother_of_wife'),    'Mother of Wife',    'mother_of_wife',    true),
    (get_tree_id('hp'), get_event_role_id('other'),             'Other',             'other',             true);

    /* *************************************************************************
     * GAME OF THRONES
     * ************************************************************************* */
    -- TODO: Add Game of Thrones event types

    /* *************************************************************************
     * NOS ÉTÉS
     * ************************************************************************* */
    -- TODO: Add Nos Étés event types 
