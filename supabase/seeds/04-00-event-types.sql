INSERT INTO event_types (tree_id, id, name, key, is_system)
VALUES
    /* *************************************************************************
     * HARRY POTTER
     * ************************************************************************* */
    
    (get_tree_id('hp'), get_event_type_id('birth'),         'Birth',       'birth',       true),
    (get_tree_id('hp'), get_event_type_id('death'),         'Death',       'death',       true),
    (get_tree_id('hp'), get_event_type_id('marriage'),      'Marriage',    'marriage',    true),
    (get_tree_id('hp'), get_event_type_id('baptism'),       'Baptism',     'baptism',     true),
    (get_tree_id('hp'), get_event_type_id('burial'),        'Burial',      'burial',      true),
    (get_tree_id('hp'), get_event_type_id('immigration'),   'Immigration', 'immigration', true),
    (get_tree_id('hp'), get_event_type_id('census'),        'Census',      'census',      true),
    (get_tree_id('hp'), get_event_type_id('engagement'),    'Engagement',  'engagement',  true),
    (get_tree_id('hp'), get_event_type_id('separation'),    'Separation',  'separation',  true),
    (get_tree_id('hp'), get_event_type_id('retirement'),    'Retirement',  'retirement',  true),
    (get_tree_id('hp'), get_event_type_id('other'),         'Other',       'other',       true);

    /* *************************************************************************
     * GAME OF THRONES
     * ************************************************************************* */
    -- TODO: Add Game of Thrones event types

    /* *************************************************************************
     * NOS ÉTÉS
     * ************************************************************************* */
    -- TODO: Add Nos Étés event types 
