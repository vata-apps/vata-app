INSERT INTO families (tree_id, id, husband_id, wife_id, type)
VALUES
    /* *************************************************************************
     * HARRY POTTER
     * ************************************************************************* */

    -- Generation 5 - Unknown parent families
    (get_tree_id('hp'), get_family_id('unknown_fleamont'),       NULL,                                    NULL,                                    'unknown'),
    (get_tree_id('hp'), get_family_id('unknown_euphemia'),       NULL,                                    NULL,                                    'unknown'),
    (get_tree_id('hp'), get_family_id('unknown_john'),           NULL,                                    NULL,                                    'unknown'),
    (get_tree_id('hp'), get_family_id('unknown_mary'),           NULL,                                    NULL,                                    'unknown'),
    (get_tree_id('hp'), get_family_id('unknown_septimus'),       NULL,                                    NULL,                                    'unknown'),
    (get_tree_id('hp'), get_family_id('unknown_cedrella'),       NULL,                                    NULL,                                    'unknown'),
    (get_tree_id('hp'), get_family_id('unknown_ignatius'),       NULL,                                    NULL,                                    'unknown'),
    (get_tree_id('hp'), get_family_id('unknown_lucretia'),       NULL,                                    NULL,                                    'unknown'),
    
    -- Generation 4
    (get_tree_id('hp'), get_family_id('fleamont_euphemia'),      get_individual_id('fleamont_potter'),    get_individual_id('euphemia_potter'),    'married'),
    (get_tree_id('hp'), get_family_id('john_mary'),              get_individual_id('john_evans'),         get_individual_id('mary_evans'),         'married'),
    (get_tree_id('hp'), get_family_id('septimus_cedrella'),      get_individual_id('septimus_weasley'),   get_individual_id('cedrella_black'),     'married'),
    (get_tree_id('hp'), get_family_id('ignatius_lucretia'),      get_individual_id('ignatius_prewett'),   get_individual_id('lucretia_prewett'),   'married'),

    -- Generation 3
    (get_tree_id('hp'), get_family_id('james_lily'),             get_individual_id('james_potter'),       get_individual_id('lily_evans'),         'married'),
    (get_tree_id('hp'), get_family_id('arthur_molly'),           get_individual_id('arthur_weasley'),     get_individual_id('molly_prewett'),      'married'),
    (get_tree_id('hp'), get_family_id('father_mother_granger'),  get_individual_id('father_granger'),     get_individual_id('mother_granger'),     'civil union'),
    (get_tree_id('hp'), get_family_id('father_mother_delacour'), get_individual_id('father_delacour'),    get_individual_id('mother_delacour'),    'civil union'),

    -- Generation 2
    (get_tree_id('hp'), get_family_id('harry_ginny'),            get_individual_id('harry_potter'),       get_individual_id('ginny_weasley'),      'married'),
    (get_tree_id('hp'), get_family_id('ron_hermione'),           get_individual_id('ron_weasley'),        get_individual_id('hermione_granger'),   'married'),
    (get_tree_id('hp'), get_family_id('bill_fleur'),             get_individual_id('bill_weasley'),       get_individual_id('fleur_delacour'),     'married'),
    (get_tree_id('hp'), get_family_id('percy_audrey'),           get_individual_id('percy_weasley'),      get_individual_id('audrey_unknown'),     'married'),
    (get_tree_id('hp'), get_family_id('george_angelina'),        get_individual_id('george_weasley'),     get_individual_id('angelina_johnson'),   'married');

    /* *************************************************************************
     * GAME OF THRONES
     * ************************************************************************* */
    -- TODO: Add Game of Thrones families

    /* *************************************************************************
     * NOS ÉTÉS
     * ************************************************************************* */
    -- TODO: Add Nos Étés families
