INSERT INTO families (id, husband_id, wife_id)
VALUES
    /* Generation 4 */
    (get_family_id('fleamont_euphemia'), get_individual_id('fleamont_potter'), get_individual_id('euphemia_potter')),
    (get_family_id('john_mary'), get_individual_id('john_evans'), get_individual_id('mary_evans')),
    (get_family_id('septimus_cedrella'), get_individual_id('septimus_weasley'), get_individual_id('cedrella_black')),
    (get_family_id('ignatius_lucretia'), get_individual_id('ignatius_prewett'), get_individual_id('lucretia_prewett')),

    /* Generation 3 */
    (get_family_id('james_lily'), get_individual_id('james_potter'), get_individual_id('lily_evans')),
    (get_family_id('arthur_molly'), get_individual_id('arthur_weasley'), get_individual_id('molly_prewett')),
    (get_family_id('william_helen'), get_individual_id('william_granger'), get_individual_id('helen_granger')),

    /* Generation 2 */
    (get_family_id('harry_ginny'), get_individual_id('harry_potter'), get_individual_id('ginny_weasley')),
    (get_family_id('ron_hermione'), get_individual_id('ron_weasley'), get_individual_id('hermione_granger')); 
