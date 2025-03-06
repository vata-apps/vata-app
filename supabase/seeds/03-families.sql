INSERT INTO families (id, husband_id, wife_id, type)
VALUES
    /* Generation 5 - Unknown parent families */
    (get_family_id('unknown_fleamont'), NULL, NULL, 'unknown'),
    (get_family_id('unknown_euphemia'), NULL, NULL, 'unknown'),
    (get_family_id('unknown_john'), NULL, NULL, 'unknown'),
    (get_family_id('unknown_mary'), NULL, NULL, 'unknown'),
    (get_family_id('unknown_septimus'), NULL, NULL, 'unknown'),
    (get_family_id('unknown_cedrella'), NULL, NULL, 'unknown'),
    (get_family_id('unknown_ignatius'), NULL, NULL, 'unknown'),
    (get_family_id('unknown_lucretia'), NULL, NULL, 'unknown'),
    
    /* Generation 4 */
    (get_family_id('fleamont_euphemia'), get_individual_id('fleamont_potter'), get_individual_id('euphemia_potter'), 'married'),
    (get_family_id('john_mary'), get_individual_id('john_evans'), get_individual_id('mary_evans'), 'married'),
    (get_family_id('septimus_cedrella'), get_individual_id('septimus_weasley'), get_individual_id('cedrella_black'), 'married'),
    (get_family_id('ignatius_lucretia'), get_individual_id('ignatius_prewett'), get_individual_id('lucretia_prewett'), 'married'),

    /* Generation 3 */
    (get_family_id('james_lily'), get_individual_id('james_potter'), get_individual_id('lily_evans'), 'married'),
    (get_family_id('arthur_molly'), get_individual_id('arthur_weasley'), get_individual_id('molly_prewett'), 'married'),
    (get_family_id('william_helen'), get_individual_id('william_granger'), get_individual_id('helen_granger'), 'civil union'),

    /* Generation 2 */
    (get_family_id('harry_ginny'), get_individual_id('harry_potter'), get_individual_id('ginny_weasley'), 'married'),
    (get_family_id('ron_hermione'), get_individual_id('ron_weasley'), get_individual_id('hermione_granger'), 'married'); 
