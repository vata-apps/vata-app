INSERT INTO places (tree_id, id, name, type_id, parent_id, latitude, longitude)
VALUES
    /* *************************************************************************
     * HARRY POTTER
     * ************************************************************************* */

    -- Countries
    (get_tree_id('hp'), get_place_id('united_kingdom'),        'United Kingdom',                                          get_place_type_id('country'),  NULL,                                55.3781,  -3.4360),
    
    -- States
    (get_tree_id('hp'), get_place_id('england'),               'England',                                                 get_place_type_id('state'),    get_place_id('united_kingdom'),      52.3555,  -1.1743),
    (get_tree_id('hp'), get_place_id('scotland'),              'Scotland',                                                get_place_type_id('state'),    get_place_id('united_kingdom'),      56.4907,  -4.2026),
    (get_tree_id('hp'), get_place_id('west_country'),          'West Country',                                            get_place_type_id('state'),    get_place_id('united_kingdom'),      51.0000,  -3.1000),
    (get_tree_id('hp'), get_place_id('devon'),                 'Devon',                                                   get_place_type_id('state'),    get_place_id('england'),             50.7452,  -3.2850),
    
    -- Cities
    (get_tree_id('hp'), get_place_id('london'),                'London',                                                  get_place_type_id('city'),     get_place_id('england'),             51.5074,  -0.1278),
    
    -- Villages
    (get_tree_id('hp'), get_place_id('godrics_hollow'),        'Godric''s Hollow',                                        get_place_type_id('village'),  get_place_id('west_country'),        51.2365,  -2.3185),
    (get_tree_id('hp'), get_place_id('hogsmeade'),             'Hogsmeade Village',                                       get_place_type_id('village'),  get_place_id('scotland'),            57.5394,  -5.4889),
    (get_tree_id('hp'), get_place_id('ottery_st_catchpole'),   'Ottery St. Catchpole',                                    get_place_type_id('village'),  get_place_id('devon'),               50.7452,  -3.2850),
    
    -- Addresses
    (get_tree_id('hp'), get_place_id('diagon_alley'),          'Diagon Alley',                                            get_place_type_id('address'),  get_place_id('london'),              51.5074,  -0.1278),
    (get_tree_id('hp'), get_place_id('the_burrow'),            'The Burrow',                                              get_place_type_id('address'),  get_place_id('ottery_st_catchpole'), 50.7452,  -3.2850),
    (get_tree_id('hp'), get_place_id('grimmauld_place'),       '12 Grimmauld Place',                                      get_place_type_id('address'),  get_place_id('london'),              51.5074,  -0.1278),
    
    -- Hospitals
    (get_tree_id('hp'), get_place_id('st_mungos'),             'St. Mungo''s Hospital for Magical Maladies and Injuries', get_place_type_id('hospital'), get_place_id('london'),              51.5074,  -0.1278),
    
    -- Other
    (get_tree_id('hp'), get_place_id('ministry_of_magic'),     'Ministry of Magic',                                       get_place_type_id('other'),    get_place_id('london'),              51.5074,  -0.1278),
    (get_tree_id('hp'), get_place_id('hogwarts'),              'Hogwarts School of Witchcraft and Wizardry',              get_place_type_id('other'),    get_place_id('scotland'),            57.5394,  -5.4889);

    /* *************************************************************************
     * GAME OF THRONES
     * ************************************************************************* */
    -- TODO: Add Game of Thrones places

    /* *************************************************************************
     * NOS ÉTÉS
     * ************************************************************************* */
    -- TODO: Add Nos Étés places
