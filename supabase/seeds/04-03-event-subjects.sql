-- Insert event subjects (who the events are about)
INSERT INTO event_subjects (tree_id, event_id, individual_id)
VALUES
    /* *************************************************************************
     * HARRY POTTER
     * ************************************************************************* */

    -- Generation 4 Birth Event Subjects
    (get_tree_id('hp'), get_event_id('fleamont_potter_birth'),      get_individual_id('fleamont_potter')),
    (get_tree_id('hp'), get_event_id('euphemia_potter_birth'),      get_individual_id('euphemia_potter')),
    (get_tree_id('hp'), get_event_id('john_evans_birth'),           get_individual_id('john_evans')),
    (get_tree_id('hp'), get_event_id('mary_evans_birth'),           get_individual_id('mary_evans')),
    (get_tree_id('hp'), get_event_id('septimus_weasley_birth'),     get_individual_id('septimus_weasley')),
    (get_tree_id('hp'), get_event_id('cedrella_black_birth'),       get_individual_id('cedrella_black')),
    (get_tree_id('hp'), get_event_id('ignatius_prewett_birth'),     get_individual_id('ignatius_prewett')),
    (get_tree_id('hp'), get_event_id('lucretia_prewett_birth'),     get_individual_id('lucretia_prewett')),

    -- Generation 4 Death Event Subjects
    (get_tree_id('hp'), get_event_id('fleamont_potter_death'),      get_individual_id('fleamont_potter')),
    (get_tree_id('hp'), get_event_id('euphemia_potter_death'),      get_individual_id('euphemia_potter')),

    -- Generation 4 Marriage Event Subjects (both spouses are subjects)
    (get_tree_id('hp'), get_event_id('fleamont_euphemia_marriage'), get_individual_id('fleamont_potter')),
    (get_tree_id('hp'), get_event_id('fleamont_euphemia_marriage'), get_individual_id('euphemia_potter')),
    (get_tree_id('hp'), get_event_id('john_mary_marriage'),         get_individual_id('john_evans')),
    (get_tree_id('hp'), get_event_id('john_mary_marriage'),         get_individual_id('mary_evans')),
    (get_tree_id('hp'), get_event_id('septimus_cedrella_marriage'), get_individual_id('septimus_weasley')),
    (get_tree_id('hp'), get_event_id('septimus_cedrella_marriage'), get_individual_id('cedrella_black')),
    (get_tree_id('hp'), get_event_id('ignatius_lucretia_marriage'), get_individual_id('ignatius_prewett')),
    (get_tree_id('hp'), get_event_id('ignatius_lucretia_marriage'), get_individual_id('lucretia_prewett')),

    -- Generation 3 Birth Event Subjects
    (get_tree_id('hp'), get_event_id('james_potter_birth'),         get_individual_id('james_potter')),
    (get_tree_id('hp'), get_event_id('lily_evans_birth'),           get_individual_id('lily_evans')),
    (get_tree_id('hp'), get_event_id('arthur_weasley_birth'),       get_individual_id('arthur_weasley')),
    (get_tree_id('hp'), get_event_id('molly_prewett_birth'),        get_individual_id('molly_prewett')),

    -- Generation 3 Death Event Subjects
    (get_tree_id('hp'), get_event_id('james_potter_death'),         get_individual_id('james_potter')),
    (get_tree_id('hp'), get_event_id('lily_evans_death'),           get_individual_id('lily_evans')),

    -- Generation 3 Marriage Event Subjects (both spouses are subjects)
    (get_tree_id('hp'), get_event_id('james_lily_marriage'),        get_individual_id('james_potter')),
    (get_tree_id('hp'), get_event_id('james_lily_marriage'),        get_individual_id('lily_evans')),
    (get_tree_id('hp'), get_event_id('arthur_molly_marriage'),      get_individual_id('arthur_weasley')),
    (get_tree_id('hp'), get_event_id('arthur_molly_marriage'),      get_individual_id('molly_prewett')),

    -- Generation 2 Birth Event Subjects
    (get_tree_id('hp'), get_event_id('bill_weasley_birth'),         get_individual_id('bill_weasley')),
    (get_tree_id('hp'), get_event_id('charlie_weasley_birth'),      get_individual_id('charlie_weasley')),
    (get_tree_id('hp'), get_event_id('percy_weasley_birth'),        get_individual_id('percy_weasley')),
    (get_tree_id('hp'), get_event_id('fred_weasley_birth'),         get_individual_id('fred_weasley')),
    (get_tree_id('hp'), get_event_id('george_weasley_birth'),       get_individual_id('george_weasley')),
    (get_tree_id('hp'), get_event_id('ron_weasley_birth'),          get_individual_id('ron_weasley')),
    (get_tree_id('hp'), get_event_id('ginny_weasley_birth'),        get_individual_id('ginny_weasley')),
    (get_tree_id('hp'), get_event_id('harry_potter_birth'),         get_individual_id('harry_potter')),
    (get_tree_id('hp'), get_event_id('hermione_granger_birth'),     get_individual_id('hermione_granger')),
    (get_tree_id('hp'), get_event_id('fleur_delacour_birth'),       get_individual_id('fleur_delacour')),
    (get_tree_id('hp'), get_event_id('angelina_johnson_birth'),     get_individual_id('angelina_johnson')),

    -- Generation 2 Death Event Subjects
    (get_tree_id('hp'), get_event_id('fred_weasley_death'),         get_individual_id('fred_weasley')),

    -- Generation 2 Marriage Event Subjects (both spouses are subjects)
    (get_tree_id('hp'), get_event_id('harry_ginny_marriage'),       get_individual_id('harry_potter')),
    (get_tree_id('hp'), get_event_id('harry_ginny_marriage'),       get_individual_id('ginny_weasley')),
    (get_tree_id('hp'), get_event_id('ron_hermione_marriage'),      get_individual_id('ron_weasley')),
    (get_tree_id('hp'), get_event_id('ron_hermione_marriage'),      get_individual_id('hermione_granger')),
    (get_tree_id('hp'), get_event_id('bill_fleur_marriage'),        get_individual_id('bill_weasley')),
    (get_tree_id('hp'), get_event_id('bill_fleur_marriage'),        get_individual_id('fleur_delacour')),
    (get_tree_id('hp'), get_event_id('percy_audrey_marriage'),      get_individual_id('percy_weasley')),
    (get_tree_id('hp'), get_event_id('percy_audrey_marriage'),      get_individual_id('audrey_unknown')),
    (get_tree_id('hp'), get_event_id('george_angelina_marriage'),   get_individual_id('george_weasley')),
    (get_tree_id('hp'), get_event_id('george_angelina_marriage'),   get_individual_id('angelina_johnson')),

    -- Generation 1 Birth Event Subjects
    (get_tree_id('hp'), get_event_id('james_sirius_potter_birth'),  get_individual_id('james_sirius_potter')),
    (get_tree_id('hp'), get_event_id('albus_potter_birth'),         get_individual_id('albus_potter')),
    (get_tree_id('hp'), get_event_id('lily_luna_potter_birth'),     get_individual_id('lily_luna_potter')),
    (get_tree_id('hp'), get_event_id('rose_weasley_birth'),         get_individual_id('rose_weasley')),
    (get_tree_id('hp'), get_event_id('hugo_weasley_birth'),         get_individual_id('hugo_weasley')),
    (get_tree_id('hp'), get_event_id('victoire_weasley_birth'),     get_individual_id('victoire_weasley')),
    (get_tree_id('hp'), get_event_id('louis_weasley_birth'),        get_individual_id('louis_weasley')),
    (get_tree_id('hp'), get_event_id('dominique_weasley_birth'),    get_individual_id('dominique_weasley')),
    (get_tree_id('hp'), get_event_id('molly_weasley_birth'),        get_individual_id('molly_ii_weasley')),
    (get_tree_id('hp'), get_event_id('lucy_weasley_birth'),         get_individual_id('lucy_weasley')),
    (get_tree_id('hp'), get_event_id('fred_2_weasley_birth'),       get_individual_id('fred_ii_weasley')),
    (get_tree_id('hp'), get_event_id('roxanne_weasley_birth'),      get_individual_id('roxanne_weasley'));

    /* *************************************************************************
     * GAME OF THRONES
     * ************************************************************************* */
    -- TODO: Add Game of Thrones event subjects

    /* *************************************************************************
     * NOS ÉTÉS
     * ************************************************************************* */
    -- TODO: Add Nos Étés event subjects 
