INSERT INTO family_children (tree_id, id, family_id, individual_id)
VALUES
    /* *************************************************************************
     * HARRY POTTER
     * ************************************************************************* */
    
    -- Generation 4 individuals with unknown parents
    (get_tree_id('hp'), get_family_children_id('father_mother_fleamont'),     get_family_id('unknown_fleamont'),       get_individual_id('fleamont_potter')),
    (get_tree_id('hp'), get_family_children_id('father_mother_euphemia'),     get_family_id('unknown_euphemia'),       get_individual_id('euphemia_potter')),
    (get_tree_id('hp'), get_family_children_id('father_mother_john'),         get_family_id('unknown_john'),           get_individual_id('john_evans')),
    (get_tree_id('hp'), get_family_children_id('father_mother_mary'),         get_family_id('unknown_mary'),           get_individual_id('mary_evans')),
    (get_tree_id('hp'), get_family_children_id('father_mother_septimus'),     get_family_id('unknown_septimus'),       get_individual_id('septimus_weasley')),
    (get_tree_id('hp'), get_family_children_id('father_mother_cedrella'),     get_family_id('unknown_cedrella'),       get_individual_id('cedrella_black')),
    (get_tree_id('hp'), get_family_children_id('father_mother_ignatius'),     get_family_id('unknown_ignatius'),       get_individual_id('ignatius_prewett')),
    (get_tree_id('hp'), get_family_children_id('father_mother_lucretia'),     get_family_id('unknown_lucretia'),       get_individual_id('lucretia_prewett')),

    -- Generation 3 - Children of Generation 4
    (get_tree_id('hp'), get_family_children_id('fleamont_euphemia_james'),    get_family_id('fleamont_euphemia'),      get_individual_id('james_potter')),
    (get_tree_id('hp'), get_family_children_id('john_mary_lily'),             get_family_id('john_mary'),              get_individual_id('lily_evans')),
    (get_tree_id('hp'), get_family_children_id('septimus_cedrella_arthur'),   get_family_id('septimus_cedrella'),      get_individual_id('arthur_weasley')),
    (get_tree_id('hp'), get_family_children_id('ignatius_lucretia_molly'),    get_family_id('ignatius_lucretia'),      get_individual_id('molly_prewett')),

    -- Generation 2 - Children of Generation 3
    (get_tree_id('hp'), get_family_children_id('james_lily_harry'),           get_family_id('james_lily'),             get_individual_id('harry_potter')),
    (get_tree_id('hp'), get_family_children_id('arthur_molly_bill'),          get_family_id('arthur_molly'),           get_individual_id('bill_weasley')),
    (get_tree_id('hp'), get_family_children_id('arthur_molly_charlie'),       get_family_id('arthur_molly'),           get_individual_id('charlie_weasley')),
    (get_tree_id('hp'), get_family_children_id('arthur_molly_percy'),         get_family_id('arthur_molly'),           get_individual_id('percy_weasley')),
    (get_tree_id('hp'), get_family_children_id('arthur_molly_fred'),          get_family_id('arthur_molly'),           get_individual_id('fred_weasley')),
    (get_tree_id('hp'), get_family_children_id('arthur_molly_george'),        get_family_id('arthur_molly'),           get_individual_id('george_weasley')),
    (get_tree_id('hp'), get_family_children_id('arthur_molly_ron'),           get_family_id('arthur_molly'),           get_individual_id('ron_weasley')),
    (get_tree_id('hp'), get_family_children_id('arthur_molly_ginny'),         get_family_id('arthur_molly'),           get_individual_id('ginny_weasley')),
    (get_tree_id('hp'), get_family_children_id('father_mother_hermione'),     get_family_id('father_mother_granger'),  get_individual_id('hermione_granger')),
    (get_tree_id('hp'), get_family_children_id('father_apoline_fleur'),       get_family_id('father_mother_delacour'), get_individual_id('fleur_delacour')),

    -- Generation 1 - Children of Generation 2
    (get_tree_id('hp'), get_family_children_id('harry_ginny_james'),          get_family_id('harry_ginny'),            get_individual_id('james_sirius_potter')),
    (get_tree_id('hp'), get_family_children_id('harry_ginny_albus'),          get_family_id('harry_ginny'),            get_individual_id('albus_potter')),
    (get_tree_id('hp'), get_family_children_id('harry_ginny_lily'),           get_family_id('harry_ginny'),            get_individual_id('lily_luna_potter')),
    (get_tree_id('hp'), get_family_children_id('ron_hermione_rose'),          get_family_id('ron_hermione'),           get_individual_id('rose_weasley')),
    (get_tree_id('hp'), get_family_children_id('ron_hermione_hugo'),          get_family_id('ron_hermione'),           get_individual_id('hugo_weasley')),
    (get_tree_id('hp'), get_family_children_id('bill_fleur_victoire'),        get_family_id('bill_fleur'),             get_individual_id('victoire_weasley')),
    (get_tree_id('hp'), get_family_children_id('bill_fleur_louis'),           get_family_id('bill_fleur'),             get_individual_id('louis_weasley')),
    (get_tree_id('hp'), get_family_children_id('bill_fleur_dominique'),       get_family_id('bill_fleur'),             get_individual_id('dominique_weasley')),
    (get_tree_id('hp'), get_family_children_id('percy_audrey_molly_ii'),      get_family_id('percy_audrey'),           get_individual_id('molly_ii_weasley')),
    (get_tree_id('hp'), get_family_children_id('percy_audrey_lucy'),          get_family_id('percy_audrey'),           get_individual_id('lucy_weasley')),
    (get_tree_id('hp'), get_family_children_id('george_angelina_fred_ii'),    get_family_id('george_angelina'),        get_individual_id('fred_ii_weasley')),
    (get_tree_id('hp'), get_family_children_id('george_angelina_roxanne'),    get_family_id('george_angelina'),        get_individual_id('roxanne_weasley'));

    /* *************************************************************************
     * GAME OF THRONES
     * ************************************************************************* */
    -- TODO: Add Game of Thrones families

    /* *************************************************************************
     * NOS ÉTÉS
     * ************************************************************************* */
    -- TODO: Add Nos Étés families
