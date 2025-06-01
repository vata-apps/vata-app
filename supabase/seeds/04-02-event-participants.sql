-- Insert event participants with their roles
INSERT INTO event_participants (tree_id, event_id, individual_id, role_id)
VALUES
    /* *************************************************************************
     * HARRY POTTER
     * ************************************************************************* */

    -- Generation 4 Birth Event Participants
    -- Fleamont Potter's birth
    (get_tree_id('hp'), get_event_id('fleamont_potter_birth'),      get_individual_id('fleamont_potter'),     get_event_role_id('subject')),

    -- Euphemia Potter's birth
    (get_tree_id('hp'), get_event_id('euphemia_potter_birth'),      get_individual_id('euphemia_potter'),     get_event_role_id('subject')),

    -- John Evans' birth
    (get_tree_id('hp'), get_event_id('john_evans_birth'),           get_individual_id('john_evans'),          get_event_role_id('subject')),

    -- Mary Evans' birth
    (get_tree_id('hp'), get_event_id('mary_evans_birth'),           get_individual_id('mary_evans'),          get_event_role_id('subject')),

    -- Septimus Weasley's birth
    (get_tree_id('hp'), get_event_id('septimus_weasley_birth'),     get_individual_id('septimus_weasley'),    get_event_role_id('subject')),

    -- Cedrella Black's birth
    (get_tree_id('hp'), get_event_id('cedrella_black_birth'),       get_individual_id('cedrella_black'),      get_event_role_id('subject')),

    -- Ignatius Prewett's birth
    (get_tree_id('hp'), get_event_id('ignatius_prewett_birth'),     get_individual_id('ignatius_prewett'),    get_event_role_id('subject')),

    -- Lucretia Prewett's birth
    (get_tree_id('hp'), get_event_id('lucretia_prewett_birth'),     get_individual_id('lucretia_prewett'),    get_event_role_id('subject')),

    -- Generation 4 Death Event Participants
    -- Fleamont Potter's death
    (get_tree_id('hp'), get_event_id('fleamont_potter_death'),      get_individual_id('fleamont_potter'),     get_event_role_id('deceased')),

    -- Euphemia Potter's death
    (get_tree_id('hp'), get_event_id('euphemia_potter_death'),      get_individual_id('euphemia_potter'),     get_event_role_id('deceased')),

    -- Generation 4 Marriage Event Participants
    -- Fleamont and Euphemia's marriage
    (get_tree_id('hp'), get_event_id('fleamont_euphemia_marriage'), get_individual_id('fleamont_potter'),     get_event_role_id('husband')),
    (get_tree_id('hp'), get_event_id('fleamont_euphemia_marriage'), get_individual_id('euphemia_potter'),     get_event_role_id('wife')),

    -- John and Mary's marriage
    (get_tree_id('hp'), get_event_id('john_mary_marriage'),         get_individual_id('john_evans'),          get_event_role_id('husband')),
    (get_tree_id('hp'), get_event_id('john_mary_marriage'),         get_individual_id('mary_evans'),          get_event_role_id('wife')),

    -- Septimus and Cedrella's marriage
    (get_tree_id('hp'), get_event_id('septimus_cedrella_marriage'), get_individual_id('septimus_weasley'),    get_event_role_id('husband')),
    (get_tree_id('hp'), get_event_id('septimus_cedrella_marriage'), get_individual_id('cedrella_black'),      get_event_role_id('wife')),

    -- Ignatius and Lucretia's marriage
    (get_tree_id('hp'), get_event_id('ignatius_lucretia_marriage'), get_individual_id('ignatius_prewett'),    get_event_role_id('husband')),
    (get_tree_id('hp'), get_event_id('ignatius_lucretia_marriage'), get_individual_id('lucretia_prewett'),    get_event_role_id('wife')),

    -- Generation 3 Birth Event Participants
    -- James Potter's birth
    (get_tree_id('hp'), get_event_id('james_potter_birth'),         get_individual_id('james_potter'),        get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('james_potter_birth'),         get_individual_id('fleamont_potter'),     get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('james_potter_birth'),         get_individual_id('euphemia_potter'),     get_event_role_id('mother')),

    -- Lily Evans' birth
    (get_tree_id('hp'), get_event_id('lily_evans_birth'),           get_individual_id('lily_evans'),          get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('lily_evans_birth'),           get_individual_id('john_evans'),          get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('lily_evans_birth'),           get_individual_id('mary_evans'),          get_event_role_id('mother')),

    -- Arthur Weasley's birth
    (get_tree_id('hp'), get_event_id('arthur_weasley_birth'),       get_individual_id('arthur_weasley'),      get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('arthur_weasley_birth'),       get_individual_id('septimus_weasley'),    get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('arthur_weasley_birth'),       get_individual_id('cedrella_black'),      get_event_role_id('mother')),

    -- Molly Prewett's birth
    (get_tree_id('hp'), get_event_id('molly_prewett_birth'),        get_individual_id('molly_prewett'),       get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('molly_prewett_birth'),        get_individual_id('ignatius_prewett'),    get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('molly_prewett_birth'),        get_individual_id('lucretia_prewett'),    get_event_role_id('mother')),

    -- Generation 3 Death Event Participants
    -- James Potter's death
    (get_tree_id('hp'), get_event_id('james_potter_death'),         get_individual_id('james_potter'),        get_event_role_id('deceased')),

    -- Lily Evans' death
    (get_tree_id('hp'), get_event_id('lily_evans_death'),           get_individual_id('lily_evans'),          get_event_role_id('deceased')),

    -- Generation 3 Marriage Event Participants
    -- James and Lily's marriage
    (get_tree_id('hp'), get_event_id('james_lily_marriage'),        get_individual_id('james_potter'),        get_event_role_id('husband')),
    (get_tree_id('hp'), get_event_id('james_lily_marriage'),        get_individual_id('lily_evans'),          get_event_role_id('wife')),
    (get_tree_id('hp'), get_event_id('james_lily_marriage'),        get_individual_id('fleamont_potter'),     get_event_role_id('father_of_husband')),
    (get_tree_id('hp'), get_event_id('james_lily_marriage'),        get_individual_id('euphemia_potter'),     get_event_role_id('mother_of_husband')),
    (get_tree_id('hp'), get_event_id('james_lily_marriage'),        get_individual_id('john_evans'),          get_event_role_id('father_of_wife')),
    (get_tree_id('hp'), get_event_id('james_lily_marriage'),        get_individual_id('mary_evans'),          get_event_role_id('mother_of_wife')),

    -- Arthur and Molly's marriage
    (get_tree_id('hp'), get_event_id('arthur_molly_marriage'),      get_individual_id('arthur_weasley'),      get_event_role_id('husband')),
    (get_tree_id('hp'), get_event_id('arthur_molly_marriage'),      get_individual_id('molly_prewett'),       get_event_role_id('wife')),
    (get_tree_id('hp'), get_event_id('arthur_molly_marriage'),      get_individual_id('septimus_weasley'),    get_event_role_id('father_of_husband')),
    (get_tree_id('hp'), get_event_id('arthur_molly_marriage'),      get_individual_id('cedrella_black'),      get_event_role_id('mother_of_husband')),
    (get_tree_id('hp'), get_event_id('arthur_molly_marriage'),      get_individual_id('ignatius_prewett'),    get_event_role_id('father_of_wife')),
    (get_tree_id('hp'), get_event_id('arthur_molly_marriage'),      get_individual_id('lucretia_prewett'),    get_event_role_id('mother_of_wife')),

    -- Generation 2 Birth Event Participants
    -- Bill Weasley's birth
    (get_tree_id('hp'), get_event_id('bill_weasley_birth'),         get_individual_id('bill_weasley'),        get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('bill_weasley_birth'),         get_individual_id('arthur_weasley'),      get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('bill_weasley_birth'),         get_individual_id('molly_prewett'),       get_event_role_id('mother')),

    -- Charlie Weasley's birth
    (get_tree_id('hp'), get_event_id('charlie_weasley_birth'),      get_individual_id('charlie_weasley'),     get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('charlie_weasley_birth'),      get_individual_id('arthur_weasley'),      get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('charlie_weasley_birth'),      get_individual_id('molly_prewett'),       get_event_role_id('mother')),

    -- Percy Weasley's birth
    (get_tree_id('hp'), get_event_id('percy_weasley_birth'),        get_individual_id('percy_weasley'),       get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('percy_weasley_birth'),        get_individual_id('arthur_weasley'),      get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('percy_weasley_birth'),        get_individual_id('molly_prewett'),       get_event_role_id('mother')),

    -- Fred Weasley's birth
    (get_tree_id('hp'), get_event_id('fred_weasley_birth'),         get_individual_id('fred_weasley'),        get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('fred_weasley_birth'),         get_individual_id('arthur_weasley'),      get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('fred_weasley_birth'),         get_individual_id('molly_prewett'),       get_event_role_id('mother')),

    -- George Weasley's birth
    (get_tree_id('hp'), get_event_id('george_weasley_birth'),       get_individual_id('george_weasley'),      get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('george_weasley_birth'),       get_individual_id('arthur_weasley'),      get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('george_weasley_birth'),       get_individual_id('molly_prewett'),       get_event_role_id('mother')),

    -- Ron Weasley's birth
    (get_tree_id('hp'), get_event_id('ron_weasley_birth'),          get_individual_id('ron_weasley'),         get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('ron_weasley_birth'),          get_individual_id('arthur_weasley'),      get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('ron_weasley_birth'),          get_individual_id('molly_prewett'),       get_event_role_id('mother')),

    -- Ginny Weasley's birth
    (get_tree_id('hp'), get_event_id('ginny_weasley_birth'),        get_individual_id('ginny_weasley'),       get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('ginny_weasley_birth'),        get_individual_id('arthur_weasley'),      get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('ginny_weasley_birth'),        get_individual_id('molly_prewett'),       get_event_role_id('mother')),

    -- Harry Potter's birth
    (get_tree_id('hp'), get_event_id('harry_potter_birth'),         get_individual_id('harry_potter'),        get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('harry_potter_birth'),         get_individual_id('james_potter'),        get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('harry_potter_birth'),         get_individual_id('lily_evans'),          get_event_role_id('mother')),

    -- Hermione Granger's birth
    (get_tree_id('hp'), get_event_id('hermione_granger_birth'),     get_individual_id('hermione_granger'),    get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('hermione_granger_birth'),     get_individual_id('father_granger'),      get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('hermione_granger_birth'),     get_individual_id('mother_granger'),      get_event_role_id('mother')),

    -- Fleur Delacour's birth
    (get_tree_id('hp'), get_event_id('fleur_delacour_birth'),       get_individual_id('fleur_delacour'),      get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('fleur_delacour_birth'),       get_individual_id('father_delacour'),     get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('fleur_delacour_birth'),       get_individual_id('mother_delacour'),     get_event_role_id('mother')),

    -- Angelina Johnson's birth
    (get_tree_id('hp'), get_event_id('angelina_johnson_birth'),     get_individual_id('angelina_johnson'),    get_event_role_id('subject')),

    -- Generation 2 Death Event Participants
    -- Fred Weasley's death
    (get_tree_id('hp'), get_event_id('fred_weasley_death'),         get_individual_id('fred_weasley'),        get_event_role_id('deceased')),

    -- Generation 2 Marriage Event Participants
    -- Harry and Ginny's marriage
    (get_tree_id('hp'), get_event_id('harry_ginny_marriage'),       get_individual_id('harry_potter'),        get_event_role_id('husband')),
    (get_tree_id('hp'), get_event_id('harry_ginny_marriage'),       get_individual_id('ginny_weasley'),       get_event_role_id('wife')),
    (get_tree_id('hp'), get_event_id('harry_ginny_marriage'),       get_individual_id('james_potter'),        get_event_role_id('father_of_husband')),
    (get_tree_id('hp'), get_event_id('harry_ginny_marriage'),       get_individual_id('lily_evans'),          get_event_role_id('mother_of_husband')),
    (get_tree_id('hp'), get_event_id('harry_ginny_marriage'),       get_individual_id('arthur_weasley'),      get_event_role_id('father_of_wife')),
    (get_tree_id('hp'), get_event_id('harry_ginny_marriage'),       get_individual_id('molly_prewett'),       get_event_role_id('mother_of_wife')),
    (get_tree_id('hp'), get_event_id('harry_ginny_marriage'),       get_individual_id('ron_weasley'),         get_event_role_id('witness')),
    (get_tree_id('hp'), get_event_id('harry_ginny_marriage'),       get_individual_id('hermione_granger'),    get_event_role_id('witness')),

    -- Ron and Hermione's marriage
    (get_tree_id('hp'), get_event_id('ron_hermione_marriage'),      get_individual_id('ron_weasley'),         get_event_role_id('husband')),
    (get_tree_id('hp'), get_event_id('ron_hermione_marriage'),      get_individual_id('hermione_granger'),    get_event_role_id('wife')),
    (get_tree_id('hp'), get_event_id('ron_hermione_marriage'),      get_individual_id('arthur_weasley'),      get_event_role_id('father_of_husband')),
    (get_tree_id('hp'), get_event_id('ron_hermione_marriage'),      get_individual_id('molly_prewett'),       get_event_role_id('mother_of_husband')),
    (get_tree_id('hp'), get_event_id('ron_hermione_marriage'),      get_individual_id('father_granger'),      get_event_role_id('father_of_wife')),
    (get_tree_id('hp'), get_event_id('ron_hermione_marriage'),      get_individual_id('mother_granger'),      get_event_role_id('mother_of_wife')),
    (get_tree_id('hp'), get_event_id('ron_hermione_marriage'),      get_individual_id('harry_potter'),        get_event_role_id('witness')),
    (get_tree_id('hp'), get_event_id('ron_hermione_marriage'),      get_individual_id('ginny_weasley'),       get_event_role_id('witness')),

    -- Bill and Fleur's marriage
    (get_tree_id('hp'), get_event_id('bill_fleur_marriage'),        get_individual_id('bill_weasley'),        get_event_role_id('husband')),
    (get_tree_id('hp'), get_event_id('bill_fleur_marriage'),        get_individual_id('fleur_delacour'),      get_event_role_id('wife')),
    (get_tree_id('hp'), get_event_id('bill_fleur_marriage'),        get_individual_id('arthur_weasley'),      get_event_role_id('father_of_husband')),
    (get_tree_id('hp'), get_event_id('bill_fleur_marriage'),        get_individual_id('molly_prewett'),       get_event_role_id('mother_of_husband')),
    (get_tree_id('hp'), get_event_id('bill_fleur_marriage'),        get_individual_id('father_delacour'),     get_event_role_id('father_of_wife')),
    (get_tree_id('hp'), get_event_id('bill_fleur_marriage'),        get_individual_id('mother_delacour'),     get_event_role_id('mother_of_wife')),

    -- Percy and Audrey's marriage
    (get_tree_id('hp'), get_event_id('percy_audrey_marriage'),      get_individual_id('percy_weasley'),       get_event_role_id('husband')),
    (get_tree_id('hp'), get_event_id('percy_audrey_marriage'),      get_individual_id('audrey_unknown'),      get_event_role_id('wife')),
    (get_tree_id('hp'), get_event_id('percy_audrey_marriage'),      get_individual_id('arthur_weasley'),      get_event_role_id('father_of_husband')),
    (get_tree_id('hp'), get_event_id('percy_audrey_marriage'),      get_individual_id('molly_prewett'),       get_event_role_id('mother_of_husband')),

    -- George and Angelina's marriage
    (get_tree_id('hp'), get_event_id('george_angelina_marriage'),   get_individual_id('george_weasley'),      get_event_role_id('husband')),
    (get_tree_id('hp'), get_event_id('george_angelina_marriage'),   get_individual_id('angelina_johnson'),    get_event_role_id('wife')),
    (get_tree_id('hp'), get_event_id('george_angelina_marriage'),   get_individual_id('arthur_weasley'),      get_event_role_id('father_of_husband')),
    (get_tree_id('hp'), get_event_id('george_angelina_marriage'),   get_individual_id('molly_prewett'),       get_event_role_id('mother_of_husband')),

    -- Generation 1 Birth Event Participants
    -- James Sirius Potter's birth
    (get_tree_id('hp'), get_event_id('james_sirius_potter_birth'),  get_individual_id('james_sirius_potter'), get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('james_sirius_potter_birth'),  get_individual_id('harry_potter'),        get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('james_sirius_potter_birth'),  get_individual_id('ginny_weasley'),       get_event_role_id('mother')),

    -- Albus Potter's birth
    (get_tree_id('hp'), get_event_id('albus_potter_birth'),         get_individual_id('albus_potter'),        get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('albus_potter_birth'),         get_individual_id('harry_potter'),        get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('albus_potter_birth'),         get_individual_id('ginny_weasley'),       get_event_role_id('mother')),

    -- Lily Luna Potter's birth
    (get_tree_id('hp'), get_event_id('lily_luna_potter_birth'),     get_individual_id('lily_luna_potter'),    get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('lily_luna_potter_birth'),     get_individual_id('harry_potter'),        get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('lily_luna_potter_birth'),     get_individual_id('ginny_weasley'),       get_event_role_id('mother')),

    -- Rose Weasley's birth
    (get_tree_id('hp'), get_event_id('rose_weasley_birth'),         get_individual_id('rose_weasley'),        get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('rose_weasley_birth'),         get_individual_id('ron_weasley'),         get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('rose_weasley_birth'),         get_individual_id('hermione_granger'),    get_event_role_id('mother')),

    -- Hugo Weasley's birth
    (get_tree_id('hp'), get_event_id('hugo_weasley_birth'),         get_individual_id('hugo_weasley'),        get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('hugo_weasley_birth'),         get_individual_id('ron_weasley'),         get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('hugo_weasley_birth'),         get_individual_id('hermione_granger'),    get_event_role_id('mother')),

    -- Victoire Weasley's birth
    (get_tree_id('hp'), get_event_id('victoire_weasley_birth'),     get_individual_id('victoire_weasley'),    get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('victoire_weasley_birth'),     get_individual_id('bill_weasley'),        get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('victoire_weasley_birth'),     get_individual_id('fleur_delacour'),      get_event_role_id('mother')),

    -- Louis Weasley's birth
    (get_tree_id('hp'), get_event_id('louis_weasley_birth'),        get_individual_id('louis_weasley'),       get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('louis_weasley_birth'),        get_individual_id('bill_weasley'),        get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('louis_weasley_birth'),        get_individual_id('fleur_delacour'),      get_event_role_id('mother')),

    -- Dominique Weasley's birth
    (get_tree_id('hp'), get_event_id('dominique_weasley_birth'),    get_individual_id('dominique_weasley'),   get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('dominique_weasley_birth'),    get_individual_id('bill_weasley'),        get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('dominique_weasley_birth'),    get_individual_id('fleur_delacour'),      get_event_role_id('mother')),

    -- Molly Weasley II's birth
    (get_tree_id('hp'), get_event_id('molly_weasley_birth'),        get_individual_id('molly_ii_weasley'),    get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('molly_weasley_birth'),        get_individual_id('percy_weasley'),       get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('molly_weasley_birth'),        get_individual_id('audrey_unknown'),      get_event_role_id('mother')),

    -- Lucy Weasley's birth
    (get_tree_id('hp'), get_event_id('lucy_weasley_birth'),         get_individual_id('lucy_weasley'),        get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('lucy_weasley_birth'),         get_individual_id('percy_weasley'),       get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('lucy_weasley_birth'),         get_individual_id('audrey_unknown'),      get_event_role_id('mother')),

    -- Fred Weasley II's birth
    (get_tree_id('hp'), get_event_id('fred_2_weasley_birth'),       get_individual_id('fred_ii_weasley'),     get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('fred_2_weasley_birth'),       get_individual_id('george_weasley'),      get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('fred_2_weasley_birth'),       get_individual_id('angelina_johnson'),    get_event_role_id('mother')),

    -- Roxanne Weasley's birth
    (get_tree_id('hp'), get_event_id('roxanne_weasley_birth'),      get_individual_id('roxanne_weasley'),     get_event_role_id('subject')),
    (get_tree_id('hp'), get_event_id('roxanne_weasley_birth'),      get_individual_id('george_weasley'),      get_event_role_id('father')),
    (get_tree_id('hp'), get_event_id('roxanne_weasley_birth'),      get_individual_id('angelina_johnson'),    get_event_role_id('mother'));

    /* *************************************************************************
     * GAME OF THRONES
     * ************************************************************************* */
    -- TODO: Add Game of Thrones event participants

    /* *************************************************************************
     * NOS ÉTÉS
     * ************************************************************************* */
    -- TODO: Add Nos Étés event participants 
