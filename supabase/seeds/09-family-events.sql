INSERT INTO family_events (id, family_id, type_id, date, place_id, description)
VALUES
    /* Generation 4 Marriages */
    (get_family_event_id('fleamont_euphemia_marriage'), get_family_id('fleamont_euphemia'), get_family_event_type_id('marriage'), '1940-06-15', get_place_id('london'), 'Marriage of Fleamont Potter and Euphemia Potter'),
    (get_family_event_id('john_mary_marriage'), get_family_id('john_mary'), get_family_event_type_id('marriage'), '1950-04-22', get_place_id('london'), 'Marriage of John Evans and Mary Evans'),
    (get_family_event_id('septimus_cedrella_marriage'), get_family_id('septimus_cedrella'), get_family_event_type_id('marriage'), '1945-12-08', get_place_id('london'), 'Marriage of Septimus Weasley and Cedrella Black'),
    (get_family_event_id('ignatius_lucretia_marriage'), get_family_id('ignatius_lucretia'), get_family_event_type_id('marriage'), '1948-09-30', get_place_id('london'), 'Marriage of Ignatius Prewett and Lucretia Prewett'),

    /* Generation 3 Marriages */
    (get_family_event_id('james_lily_marriage'), get_family_id('james_lily'), get_family_event_type_id('marriage'), '1978-10-17', get_place_id('godrics_hollow'), 'Marriage of James Potter and Lily Evans'),
    (get_family_event_id('arthur_molly_marriage'), get_family_id('arthur_molly'), get_family_event_type_id('marriage'), '1970-02-14', get_place_id('the_burrow'), 'Marriage of Arthur Weasley and Molly Prewett'),
    (get_family_event_id('william_helen_union'), get_family_id('william_helen'), get_family_event_type_id('civil union'), '1975-08-23', get_place_id('london'), 'Civil union of William Granger and Helen Granger'),

    /* Generation 2 Marriages */
    (get_family_event_id('harry_ginny_marriage'), get_family_id('harry_ginny'), get_family_event_type_id('marriage'), '2000-05-02', get_place_id('the_burrow'), 'Marriage of Harry Potter and Ginny Weasley'),
    (get_family_event_id('ron_hermione_marriage'), get_family_id('ron_hermione'), get_family_event_type_id('marriage'), '2000-09-01', get_place_id('the_burrow'), 'Marriage of Ron Weasley and Hermione Granger'); 
