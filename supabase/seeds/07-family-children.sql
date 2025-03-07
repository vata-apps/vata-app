INSERT INTO family_children (id, family_id, individual_id)
VALUES
    /* Generation 4 individuals with unknown parents */
    (get_family_children_id('unknown_fleamont'), get_family_id('unknown_fleamont'), get_individual_id('fleamont_potter')),
    (get_family_children_id('unknown_euphemia'), get_family_id('unknown_euphemia'), get_individual_id('euphemia_potter')),
    (get_family_children_id('unknown_john'), get_family_id('unknown_john'), get_individual_id('john_evans')),
    (get_family_children_id('unknown_mary'), get_family_id('unknown_mary'), get_individual_id('mary_evans')),
    (get_family_children_id('unknown_septimus'), get_family_id('unknown_septimus'), get_individual_id('septimus_weasley')),
    (get_family_children_id('unknown_cedrella'), get_family_id('unknown_cedrella'), get_individual_id('cedrella_black')),
    (get_family_children_id('unknown_ignatius'), get_family_id('unknown_ignatius'), get_individual_id('ignatius_prewett')),
    (get_family_children_id('unknown_lucretia'), get_family_id('unknown_lucretia'), get_individual_id('lucretia_prewett')),

    /* Generation 3 - Children of Generation 4 */
    (get_family_children_id('fleamont_euphemia_james'), get_family_id('fleamont_euphemia'), get_individual_id('james_potter')),
    (get_family_children_id('john_mary_lily'), get_family_id('john_mary'), get_individual_id('lily_evans')),
    (get_family_children_id('septimus_cedrella_arthur'), get_family_id('septimus_cedrella'), get_individual_id('arthur_weasley')),
    (get_family_children_id('ignatius_lucretia_molly'), get_family_id('ignatius_lucretia'), get_individual_id('molly_prewett')),

    /* Generation 2 - Children of Generation 3 */
    (get_family_children_id('james_lily_harry'), get_family_id('james_lily'), get_individual_id('harry_potter')),
    (get_family_children_id('arthur_molly_bill'), get_family_id('arthur_molly'), get_individual_id('bill_weasley')),
    (get_family_children_id('arthur_molly_charlie'), get_family_id('arthur_molly'), get_individual_id('charlie_weasley')),
    (get_family_children_id('arthur_molly_percy'), get_family_id('arthur_molly'), get_individual_id('percy_weasley')),
    (get_family_children_id('arthur_molly_fred'), get_family_id('arthur_molly'), get_individual_id('fred_weasley')),
    (get_family_children_id('arthur_molly_george'), get_family_id('arthur_molly'), get_individual_id('george_weasley')),
    (get_family_children_id('arthur_molly_ron'), get_family_id('arthur_molly'), get_individual_id('ron_weasley')),
    (get_family_children_id('arthur_molly_ginny'), get_family_id('arthur_molly'), get_individual_id('ginny_weasley')),
    (get_family_children_id('william_helen_hermione'), get_family_id('william_helen'), get_individual_id('hermione_granger')),

    /* Generation 1 - Children of Generation 2 */
    (get_family_children_id('harry_ginny_james'), get_family_id('harry_ginny'), get_individual_id('james_sirius_potter')),
    (get_family_children_id('harry_ginny_albus'), get_family_id('harry_ginny'), get_individual_id('albus_potter')),
    (get_family_children_id('harry_ginny_lily'), get_family_id('harry_ginny'), get_individual_id('lily_luna_potter')),
    (get_family_children_id('ron_hermione_rose'), get_family_id('ron_hermione'), get_individual_id('rose_weasley')),
    (get_family_children_id('ron_hermione_hugo'), get_family_id('ron_hermione'), get_individual_id('hugo_weasley'));
