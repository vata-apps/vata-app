-- Insert events into the unified events table
INSERT INTO events (tree_id, id, type_id, date, place_id, description)
VALUES
    /* *************************************************************************
     * HARRY POTTER
     * ************************************************************************* */

    -- Generation 4 Birth Events
    (get_tree_id('hp'), get_event_id('fleamont_potter_birth'),      get_event_type_id('birth'),    '1909-03-17', get_place_id('london'),              'Birth of Fleamont Potter'),
    (get_tree_id('hp'), get_event_id('euphemia_potter_birth'),      get_event_type_id('birth'),    '1910-06-28', get_place_id('london'),              'Birth of Euphemia Potter'),
    (get_tree_id('hp'), get_event_id('john_evans_birth'),           get_event_type_id('birth'),    '1930-04-12', get_place_id('london'),              'Birth of John Evans'),
    (get_tree_id('hp'), get_event_id('mary_evans_birth'),           get_event_type_id('birth'),    '1932-08-05', get_place_id('london'),              'Birth of Mary Evans'),
    (get_tree_id('hp'), get_event_id('septimus_weasley_birth'),     get_event_type_id('birth'),    '1925-11-23', get_place_id('ottery_st_catchpole'), 'Birth of Septimus Weasley'),
    (get_tree_id('hp'), get_event_id('cedrella_black_birth'),       get_event_type_id('birth'),    '1928-02-14', get_place_id('london'),              'Birth of Cedrella Black'),
    (get_tree_id('hp'), get_event_id('ignatius_prewett_birth'),     get_event_type_id('birth'),    '1920-07-09', get_place_id('ottery_st_catchpole'), 'Birth of Ignatius Prewett'),
    (get_tree_id('hp'), get_event_id('lucretia_prewett_birth'),     get_event_type_id('birth'),    '1923-12-03', get_place_id('ottery_st_catchpole'), 'Birth of Lucretia Prewett'),

    -- Generation 4 Death Events
    (get_tree_id('hp'), get_event_id('fleamont_potter_death'),      get_event_type_id('death'),    '1979-11-05', get_place_id('godrics_hollow'),      'Death of Fleamont Potter from Dragon Pox'),
    (get_tree_id('hp'), get_event_id('euphemia_potter_death'),      get_event_type_id('death'),    '1979-12-15', get_place_id('godrics_hollow'),      'Death of Euphemia Potter from Dragon Pox'),

    -- Generation 4 Marriage Events
    (get_tree_id('hp'), get_event_id('fleamont_euphemia_marriage'), get_event_type_id('marriage'), '1940-06-15', get_place_id('london'),              'Marriage of Fleamont Potter and Euphemia Potter'),
    (get_tree_id('hp'), get_event_id('john_mary_marriage'),         get_event_type_id('marriage'), '1955-09-12', get_place_id('london'),              'Marriage of John Evans and Mary Evans'),
    (get_tree_id('hp'), get_event_id('septimus_cedrella_marriage'), get_event_type_id('marriage'), '1950-04-18', get_place_id('ottery_st_catchpole'), 'Marriage of Septimus Weasley and Cedrella Black'),
    (get_tree_id('hp'), get_event_id('ignatius_lucretia_marriage'), get_event_type_id('marriage'), '1945-06-22', get_place_id('ottery_st_catchpole'), 'Marriage of Ignatius Prewett and Lucretia Prewett'),

    -- Generation 3 Birth Events
    (get_tree_id('hp'), get_event_id('james_potter_birth'),         get_event_type_id('birth'),    '1960-03-27', get_place_id('godrics_hollow'),      'Birth of James Potter'),
    (get_tree_id('hp'), get_event_id('lily_evans_birth'),           get_event_type_id('birth'),    '1960-01-30', get_place_id('london'),              'Birth of Lily Evans'),
    (get_tree_id('hp'), get_event_id('arthur_weasley_birth'),       get_event_type_id('birth'),    '1950-02-06', get_place_id('ottery_st_catchpole'), 'Birth of Arthur Weasley'),
    (get_tree_id('hp'), get_event_id('molly_prewett_birth'),        get_event_type_id('birth'),    '1949-10-30', get_place_id('ottery_st_catchpole'), 'Birth of Molly Prewett'),

    -- Generation 3 Death Events
    (get_tree_id('hp'), get_event_id('james_potter_death'),         get_event_type_id('death'),    '1981-10-31', get_place_id('godrics_hollow'),      'Death of James Potter by Lord Voldemort'),
    (get_tree_id('hp'), get_event_id('lily_evans_death'),           get_event_type_id('death'),    '1981-10-31', get_place_id('godrics_hollow'),      'Death of Lily Evans by Lord Voldemort'),

    -- Generation 3 Marriage Events
    (get_tree_id('hp'), get_event_id('james_lily_marriage'),        get_event_type_id('marriage'), '1978-10-17', get_place_id('godrics_hollow'),      'Marriage of James Potter and Lily Evans'),
    (get_tree_id('hp'), get_event_id('arthur_molly_marriage'),      get_event_type_id('marriage'), '1968-08-14', get_place_id('ottery_st_catchpole'), 'Marriage of Arthur Weasley and Molly Prewett'),

    -- Generation 2 Birth Events
    (get_tree_id('hp'), get_event_id('bill_weasley_birth'),         get_event_type_id('birth'),    '1970-11-29', get_place_id('the_burrow'),          'Birth of William "Bill" Weasley'),
    (get_tree_id('hp'), get_event_id('charlie_weasley_birth'),      get_event_type_id('birth'),    '1972-12-12', get_place_id('the_burrow'),          'Birth of Charles "Charlie" Weasley'),
    (get_tree_id('hp'), get_event_id('percy_weasley_birth'),        get_event_type_id('birth'),    '1976-08-22', get_place_id('the_burrow'),          'Birth of Percival "Percy" Weasley'),
    (get_tree_id('hp'), get_event_id('fred_weasley_birth'),         get_event_type_id('birth'),    '1978-04-01', get_place_id('the_burrow'),          'Birth of Fred Weasley'),
    (get_tree_id('hp'), get_event_id('george_weasley_birth'),       get_event_type_id('birth'),    '1978-04-01', get_place_id('the_burrow'),          'Birth of George Weasley'),
    (get_tree_id('hp'), get_event_id('ron_weasley_birth'),          get_event_type_id('birth'),    '1980-03-01', get_place_id('the_burrow'),          'Birth of Ronald "Ron" Weasley'),
    (get_tree_id('hp'), get_event_id('ginny_weasley_birth'),        get_event_type_id('birth'),    '1981-08-11', get_place_id('the_burrow'),          'Birth of Ginevra "Ginny" Weasley'),
    (get_tree_id('hp'), get_event_id('harry_potter_birth'),         get_event_type_id('birth'),    '1980-07-31', get_place_id('godrics_hollow'),      'Birth of Harry Potter'),
    (get_tree_id('hp'), get_event_id('hermione_granger_birth'),     get_event_type_id('birth'),    '1979-09-19', get_place_id('london'),              'Birth of Hermione Granger'),
    (get_tree_id('hp'), get_event_id('fleur_delacour_birth'),       get_event_type_id('birth'),    '1976-10-30', NULL,                                'Birth of Fleur Delacour'),
    (get_tree_id('hp'), get_event_id('angelina_johnson_birth'),     get_event_type_id('birth'),    '1977-10-24', get_place_id('london'),              'Birth of Angelina Johnson'),

    -- Generation 2 Death Events
    (get_tree_id('hp'), get_event_id('fred_weasley_death'),         get_event_type_id('death'),    '1998-05-02', get_place_id('hogwarts'),            'Death of Fred Weasley during the Battle of Hogwarts'),

    -- Generation 2 Marriage Events
    (get_tree_id('hp'), get_event_id('harry_ginny_marriage'),       get_event_type_id('marriage'), '2000-05-02', get_place_id('the_burrow'),          'Marriage of Harry Potter and Ginny Weasley'),
    (get_tree_id('hp'), get_event_id('ron_hermione_marriage'),      get_event_type_id('marriage'), '2000-09-01', get_place_id('the_burrow'),          'Marriage of Ron Weasley and Hermione Granger'),
    (get_tree_id('hp'), get_event_id('bill_fleur_marriage'),        get_event_type_id('marriage'), '1997-08-01', get_place_id('the_burrow'),          'Marriage of Bill Weasley and Fleur Delacour'),
    (get_tree_id('hp'), get_event_id('percy_audrey_marriage'),      get_event_type_id('marriage'), '2001-08-15', get_place_id('london'),              'Marriage of Percy Weasley and Audrey'),
    (get_tree_id('hp'), get_event_id('george_angelina_marriage'),   get_event_type_id('marriage'), '2002-04-20', get_place_id('the_burrow'),          'Marriage of George Weasley and Angelina Johnson'),

    -- Generation 1 Birth Events
    (get_tree_id('hp'), get_event_id('james_sirius_potter_birth'),  get_event_type_id('birth'),    '2004-07-16', get_place_id('london'),              'Birth of James Sirius Potter'),
    (get_tree_id('hp'), get_event_id('albus_potter_birth'),         get_event_type_id('birth'),    '2006-08-27', get_place_id('london'),              'Birth of Albus Severus Potter'),
    (get_tree_id('hp'), get_event_id('lily_luna_potter_birth'),     get_event_type_id('birth'),    '2008-09-01', get_place_id('london'),              'Birth of Lily Luna Potter'),
    (get_tree_id('hp'), get_event_id('rose_weasley_birth'),         get_event_type_id('birth'),    '2006-02-14', get_place_id('london'),              'Birth of Rose Weasley'),
    (get_tree_id('hp'), get_event_id('hugo_weasley_birth'),         get_event_type_id('birth'),    '2008-11-23', get_place_id('london'),              'Birth of Hugo Weasley'),
    (get_tree_id('hp'), get_event_id('victoire_weasley_birth'),     get_event_type_id('birth'),    '2000-05-02', get_place_id('london'),              'Birth of Victoire Weasley'),
    (get_tree_id('hp'), get_event_id('louis_weasley_birth'),        get_event_type_id('birth'),    '2004-12-08', get_place_id('london'),              'Birth of Louis Weasley'),
    (get_tree_id('hp'), get_event_id('dominique_weasley_birth'),    get_event_type_id('birth'),    '2002-03-17', get_place_id('london'),              'Birth of Dominique Weasley'),
    (get_tree_id('hp'), get_event_id('molly_weasley_birth'),        get_event_type_id('birth'),    '2005-08-11', get_place_id('london'),              'Birth of Molly Weasley II'),
    (get_tree_id('hp'), get_event_id('lucy_weasley_birth'),         get_event_type_id('birth'),    '2007-06-28', get_place_id('london'),              'Birth of Lucy Weasley'),
    (get_tree_id('hp'), get_event_id('fred_2_weasley_birth'),       get_event_type_id('birth'),    '2006-04-01', get_place_id('london'),              'Birth of Fred Weasley II'),
    (get_tree_id('hp'), get_event_id('roxanne_weasley_birth'),      get_event_type_id('birth'),    '2008-10-15', get_place_id('london'),              'Birth of Roxanne Weasley');

    /* *************************************************************************
     * GAME OF THRONES
     * ************************************************************************* */
    -- TODO: Add Game of Thrones events

    /* *************************************************************************
     * NOS ÉTÉS
     * ************************************************************************* */
    -- TODO: Add Nos Étés events 
