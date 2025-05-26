-- Insert event subjects (who the events are about)
INSERT INTO event_subjects (event_id, individual_id)
VALUES
    /* Birth Event Subjects */
    (get_event_id('fleamont_potter_birth'), get_individual_id('fleamont_potter')),
    (get_event_id('euphemia_potter_birth'), get_individual_id('euphemia_potter')),
    (get_event_id('james_potter_birth'), get_individual_id('james_potter')),
    (get_event_id('lily_evans_birth'), get_individual_id('lily_evans')),
    (get_event_id('harry_potter_birth'), get_individual_id('harry_potter')),
    (get_event_id('hermione_granger_birth'), get_individual_id('hermione_granger')),
    (get_event_id('ron_weasley_birth'), get_individual_id('ron_weasley')),
    (get_event_id('ginny_weasley_birth'), get_individual_id('ginny_weasley')),

    /* Death Event Subjects */
    (get_event_id('fleamont_potter_death'), get_individual_id('fleamont_potter')),
    (get_event_id('euphemia_potter_death'), get_individual_id('euphemia_potter')),
    (get_event_id('james_potter_death'), get_individual_id('james_potter')),
    (get_event_id('lily_evans_death'), get_individual_id('lily_evans')),
    (get_event_id('fred_weasley_death'), get_individual_id('fred_weasley')),

    /* Marriage Event Subjects (both spouses are subjects) */
    (get_event_id('fleamont_euphemia_marriage'), get_individual_id('fleamont_potter')),
    (get_event_id('fleamont_euphemia_marriage'), get_individual_id('euphemia_potter')),
    (get_event_id('james_lily_marriage'), get_individual_id('james_potter')),
    (get_event_id('james_lily_marriage'), get_individual_id('lily_evans')),
    (get_event_id('harry_ginny_marriage'), get_individual_id('harry_potter')),
    (get_event_id('harry_ginny_marriage'), get_individual_id('ginny_weasley')),
    (get_event_id('ron_hermione_marriage'), get_individual_id('ron_weasley')),
    (get_event_id('ron_hermione_marriage'), get_individual_id('hermione_granger')),

    /* Incomplete Genealogical Events - Without date and without location */
    (get_event_id('tom_riddle_birth'), get_individual_id('tom_riddle')),
    (get_event_id('godric_gryffindor_death'), get_individual_id('godric_gryffindor')),

    /* Incomplete Genealogical Events - With date but without location */
    (get_event_id('tom_riddle_graduation'), get_individual_id('tom_riddle')),
    (get_event_id('lily_evans_graduation'), get_individual_id('lily_evans')),

    /* Incomplete Genealogical Events - Without date but with location */
    (get_event_id('salazar_slytherin_burial'), get_individual_id('salazar_slytherin')),
    (get_event_id('helga_hufflepuff_burial'), get_individual_id('helga_hufflepuff')),

    /* Incomplete Marriage Events for Weasley Children */
    (get_event_id('bill_weasley_marriage'), get_individual_id('bill_weasley')),
    (get_event_id('percy_weasley_marriage'), get_individual_id('percy_weasley')),
    (get_event_id('george_weasley_marriage'), get_individual_id('george_weasley')); 
