INSERT INTO names (tree_id, id, individual_id, first_name, last_name, type, is_primary)
VALUES
    /* *************************************************************************
     * HARRY POTTER
     * ************************************************************************* */

    -- Generation 4
    (get_tree_id('hp'), get_name_id('fleamont_potter_birth'),          get_individual_id('fleamont_potter'),       'Fleamont',       'Potter',   'birth',    true),
    (get_tree_id('hp'), get_name_id('euphemia_potter_birth'),          get_individual_id('euphemia_potter'),       'Euphemia',       'Potter',   'birth',    true),
    (get_tree_id('hp'), get_name_id('john_evans_birth'),               get_individual_id('john_evans'),            'John',           'Evans',    'birth',    true),
    (get_tree_id('hp'), get_name_id('mary_evans_birth'),               get_individual_id('mary_evans'),            'Mary',           'Evans',    'birth',    true),
    (get_tree_id('hp'), get_name_id('septimus_weasley_birth'),         get_individual_id('septimus_weasley'),      'Septimus',       'Weasley',  'birth',    true),
    (get_tree_id('hp'), get_name_id('cedrella_black_birth'),           get_individual_id('cedrella_black'),        'Cedrella',       'Black',    'birth',    true),
    (get_tree_id('hp'), get_name_id('cedrella_weasley_marriage'),      get_individual_id('cedrella_black'),        'Cedrella',       'Weasley',  'marriage', false),
    (get_tree_id('hp'), get_name_id('ignatius_prewett_birth'),         get_individual_id('ignatius_prewett'),      'Ignatius',       'Prewett',  'birth',    true),
    (get_tree_id('hp'), get_name_id('lucretia_prewett_birth'),         get_individual_id('lucretia_prewett'),      'Lucretia',       'Prewett',  'birth',    true),

    -- Generation 3
    (get_tree_id('hp'), get_name_id('james_potter_birth'),             get_individual_id('james_potter'),          'James',          'Potter',   'birth',    true),
    (get_tree_id('hp'), get_name_id('lily_evans_birth'),               get_individual_id('lily_evans'),            'Lily',           'Evans',    'birth',    true),
    (get_tree_id('hp'), get_name_id('lily_potter_marriage'),           get_individual_id('lily_evans'),            'Lily',           'Potter',   'marriage', false),
    (get_tree_id('hp'), get_name_id('arthur_weasley_birth'),           get_individual_id('arthur_weasley'),        'Arthur',         'Weasley',  'birth',    true),
    (get_tree_id('hp'), get_name_id('molly_prewett_birth'),            get_individual_id('molly_prewett'),         'Molly',          'Prewett',  'birth',    true),
    (get_tree_id('hp'), get_name_id('molly_weasley_marriage'),         get_individual_id('molly_prewett'),         'Molly',          'Weasley',  'marriage', false),
    (get_tree_id('hp'), get_name_id('father_granger_birth'),           get_individual_id('father_granger'),        '',               'Granger',  'birth',    true),
    (get_tree_id('hp'), get_name_id('mother_granger_birth'),           get_individual_id('mother_granger'),        '',               'Granger',  'birth',    true),
    (get_tree_id('hp'), get_name_id('father_delacour_birth'),          get_individual_id('father_delacour'),       '',               'Delacour', 'birth',    true),
    (get_tree_id('hp'), get_name_id('mother_delacour_birth'),          get_individual_id('mother_delacour'),       '',               'Delacour', 'birth',    true),

    -- Generation 2
    (get_tree_id('hp'), get_name_id('bill_weasley_birth'),             get_individual_id('bill_weasley'),          'William',        'Weasley',  'birth',    true),
    (get_tree_id('hp'), get_name_id('bill_weasley_nickname'),          get_individual_id('bill_weasley'),          'Bill',           'Weasley',  'nickname', false),
    (get_tree_id('hp'), get_name_id('charlie_weasley_birth'),          get_individual_id('charlie_weasley'),       'Charles',        'Weasley',  'birth',    true),
    (get_tree_id('hp'), get_name_id('charlie_weasley_nickname'),       get_individual_id('charlie_weasley'),       'Charlie',        'Weasley',  'nickname', false),
    (get_tree_id('hp'), get_name_id('percy_weasley_birth'),            get_individual_id('percy_weasley'),         'Percival',       'Weasley',  'birth',    true),
    (get_tree_id('hp'), get_name_id('percival_weasley_nickname'),      get_individual_id('percy_weasley'),         'Percy',          'Weasley',  'nickname', false),
    (get_tree_id('hp'), get_name_id('fred_weasley_birth'),             get_individual_id('fred_weasley'),          'Fred',           'Weasley',  'birth',    true),
    (get_tree_id('hp'), get_name_id('george_weasley_birth'),           get_individual_id('george_weasley'),        'George',         'Weasley',  'birth',    true),
    (get_tree_id('hp'), get_name_id('ronald_weasley_birth'),           get_individual_id('ron_weasley'),           'Ronald',         'Weasley',  'birth',    true),
    (get_tree_id('hp'), get_name_id('ron_weasley_nickname'),           get_individual_id('ron_weasley'),           'Ron',            'Weasley',  'nickname', false),
    (get_tree_id('hp'), get_name_id('ginny_weasley_birth'),            get_individual_id('ginny_weasley'),         'Ginevra',        'Weasley',  'birth',    true),
    (get_tree_id('hp'), get_name_id('ginny_weasley_nickname'),         get_individual_id('ginny_weasley'),         'Ginny',          'Weasley',  'nickname', false),
    (get_tree_id('hp'), get_name_id('ginny_potter_marriage'),          get_individual_id('ginny_weasley'),         'Ginny',          'Potter',   'marriage', false),
    (get_tree_id('hp'), get_name_id('harry_potter_birth'),             get_individual_id('harry_potter'),          'Harry',          'Potter',   'birth',    true),
    (get_tree_id('hp'), get_name_id('hermione_granger_birth'),         get_individual_id('hermione_granger'),      'Hermione',       'Granger',  'birth',    true),
    (get_tree_id('hp'), get_name_id('hermione_weasley_marriage'),      get_individual_id('hermione_granger'),      'Hermione',       'Weasley',  'marriage', false),
    (get_tree_id('hp'), get_name_id('fleur_delacour_birth'),           get_individual_id('fleur_delacour'),        'Fleur',          'Delacour', 'birth',    true),
    (get_tree_id('hp'), get_name_id('fleur_weasley_marriage'),         get_individual_id('fleur_delacour'),        'Fleur',          'Weasley',  'marriage', false),
    (get_tree_id('hp'), get_name_id('audrey_unknown_birth'),           get_individual_id('audrey_unknown'),        'Audrey',         '',         'birth',    true),
    (get_tree_id('hp'), get_name_id('audrey_weasley_marriage'),        get_individual_id('audrey_unknown'),        'Audrey',         'Weasley',  'marriage', false),
    (get_tree_id('hp'), get_name_id('angelina_johnson_birth'),         get_individual_id('angelina_johnson'),      'Angelina',       'Johnson',  'birth',    true),
    (get_tree_id('hp'), get_name_id('angelina_weasley_marriage'),      get_individual_id('angelina_johnson'),      'Angelina',       'Weasley',  'marriage', false),

    -- Generation 1
    (get_tree_id('hp'), get_name_id('james_sirius_potter_birth'),      get_individual_id('james_sirius_potter'),   'James',          'Potter',   'birth',    true),
    (get_tree_id('hp'), get_name_id('james_sirius_potter_nickname'),   get_individual_id('james_sirius_potter'),   'James Sirius',   'Potter',   'nickname', false),
    (get_tree_id('hp'), get_name_id('albus_potter_birth'),             get_individual_id('albus_potter'),          'Albus',          'Potter',   'birth',    true),
    (get_tree_id('hp'), get_name_id('albus_severus_potter_nickname'),  get_individual_id('albus_potter'),          'Albus Severus',  'Potter',   'nickname', false),
    (get_tree_id('hp'), get_name_id('lily_luna_potter_birth'),         get_individual_id('lily_luna_potter'),      'Lily',           'Potter',   'birth',    true),
    (get_tree_id('hp'), get_name_id('lily_luna_potter_nickname'),      get_individual_id('lily_luna_potter'),      'Lily Luna',      'Potter',   'nickname', false),
    (get_tree_id('hp'), get_name_id('rose_weasley_birth'),             get_individual_id('rose_weasley'),          'Rose',           'Weasley',  'birth',    true),
    (get_tree_id('hp'), get_name_id('hugo_weasley_birth'),             get_individual_id('hugo_weasley'),          'Hugo',           'Weasley',  'birth',    true),
    (get_tree_id('hp'), get_name_id('victoire_weasley_birth'),         get_individual_id('victoire_weasley'),      'Victoire',       'Weasley',  'birth',    true),
    (get_tree_id('hp'), get_name_id('louis_weasley_birth'),            get_individual_id('louis_weasley'),         'Louis',          'Weasley',  'birth',    true),
    (get_tree_id('hp'), get_name_id('dominique_weasley_birth'),        get_individual_id('dominique_weasley'),     'Dominique',      'Weasley',  'birth',    true),
    (get_tree_id('hp'), get_name_id('molly_ii_weasley_birth'),         get_individual_id('molly_ii_weasley'),      'Molly',          'Weasley',  'birth',    true),
    (get_tree_id('hp'), get_name_id('lucy_weasley_birth'),             get_individual_id('lucy_weasley'),          'Lucy',           'Weasley',  'birth',    true),
    (get_tree_id('hp'), get_name_id('fred_ii_weasley_birth'),          get_individual_id('fred_ii_weasley'),       'Fred',           'Weasley',  'birth',    true),
    (get_tree_id('hp'), get_name_id('roxanne_weasley_birth'),          get_individual_id('roxanne_weasley'),       'Roxanne',        'Weasley',  'birth',    true);

    /* *************************************************************************
     * GAME OF THRONES
     * ************************************************************************* */
    -- TODO: Add Game of Thrones names

    /* *************************************************************************
        * NOS ÉTÉS
        * ************************************************************************* */
    -- TODO: Add Nos Étés names
