-- Insert event participants with their roles
INSERT INTO event_participants (event_id, individual_id, role_id)
VALUES
    /* Birth Event Participants */
    -- Fleamont Potter's birth
    (get_event_id('fleamont_potter_birth'), get_individual_id('fleamont_potter'), get_event_role_id('subject')),

    -- Euphemia Potter's birth
    (get_event_id('euphemia_potter_birth'), get_individual_id('euphemia_potter'), get_event_role_id('subject')),

    -- James Potter's birth
    (get_event_id('james_potter_birth'), get_individual_id('james_potter'), get_event_role_id('subject')),
    (get_event_id('james_potter_birth'), get_individual_id('fleamont_potter'), get_event_role_id('father')),
    (get_event_id('james_potter_birth'), get_individual_id('euphemia_potter'), get_event_role_id('mother')),

    -- Lily Evans' birth
    (get_event_id('lily_evans_birth'), get_individual_id('lily_evans'), get_event_role_id('subject')),

    -- Harry Potter's birth
    (get_event_id('harry_potter_birth'), get_individual_id('harry_potter'), get_event_role_id('subject')),
    (get_event_id('harry_potter_birth'), get_individual_id('james_potter'), get_event_role_id('father')),
    (get_event_id('harry_potter_birth'), get_individual_id('lily_evans'), get_event_role_id('mother')),

    -- Hermione Granger's birth
    (get_event_id('hermione_granger_birth'), get_individual_id('hermione_granger'), get_event_role_id('subject')),

    -- Ron Weasley's birth
    (get_event_id('ron_weasley_birth'), get_individual_id('ron_weasley'), get_event_role_id('subject')),

    -- Ginny Weasley's birth
    (get_event_id('ginny_weasley_birth'), get_individual_id('ginny_weasley'), get_event_role_id('subject')),

    /* Marriage Event Participants */
    -- James and Lily's marriage
    (get_event_id('james_lily_marriage'), get_individual_id('james_potter'), get_event_role_id('groom')),
    (get_event_id('james_lily_marriage'), get_individual_id('lily_evans'), get_event_role_id('bride')),

    -- Harry and Ginny's marriage
    (get_event_id('harry_ginny_marriage'), get_individual_id('harry_potter'), get_event_role_id('groom')),
    (get_event_id('harry_ginny_marriage'), get_individual_id('ginny_weasley'), get_event_role_id('bride')),
    (get_event_id('harry_ginny_marriage'), get_individual_id('ron_weasley'), get_event_role_id('witness')),
    (get_event_id('harry_ginny_marriage'), get_individual_id('hermione_granger'), get_event_role_id('witness')),

    -- Ron and Hermione's marriage
    (get_event_id('ron_hermione_marriage'), get_individual_id('ron_weasley'), get_event_role_id('groom')),
    (get_event_id('ron_hermione_marriage'), get_individual_id('hermione_granger'), get_event_role_id('bride')),
    (get_event_id('ron_hermione_marriage'), get_individual_id('harry_potter'), get_event_role_id('witness')),
    (get_event_id('ron_hermione_marriage'), get_individual_id('ginny_weasley'), get_event_role_id('witness')),

    /* Death Event Participants */
    -- Fleamont Potter's death
    (get_event_id('fleamont_potter_death'), get_individual_id('fleamont_potter'), get_event_role_id('deceased')),

    -- Euphemia Potter's death
    (get_event_id('euphemia_potter_death'), get_individual_id('euphemia_potter'), get_event_role_id('deceased')),

    -- James Potter's death
    (get_event_id('james_potter_death'), get_individual_id('james_potter'), get_event_role_id('deceased')),

    -- Lily Evans' death
    (get_event_id('lily_evans_death'), get_individual_id('lily_evans'), get_event_role_id('deceased')); 
