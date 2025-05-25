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
    (get_event_id('lily_evans_birth'), get_individual_id('john_evans'), get_event_role_id('father')),
    (get_event_id('lily_evans_birth'), get_individual_id('mary_evans'), get_event_role_id('mother')),

    -- Harry Potter's birth
    (get_event_id('harry_potter_birth'), get_individual_id('harry_potter'), get_event_role_id('subject')),
    (get_event_id('harry_potter_birth'), get_individual_id('james_potter'), get_event_role_id('father')),
    (get_event_id('harry_potter_birth'), get_individual_id('lily_evans'), get_event_role_id('mother')),

    -- Hermione Granger's birth
    (get_event_id('hermione_granger_birth'), get_individual_id('hermione_granger'), get_event_role_id('subject')),
    (get_event_id('hermione_granger_birth'), get_individual_id('william_granger'), get_event_role_id('father')),
    (get_event_id('hermione_granger_birth'), get_individual_id('helen_granger'), get_event_role_id('mother')),

    -- Ron Weasley's birth
    (get_event_id('ron_weasley_birth'), get_individual_id('ron_weasley'), get_event_role_id('subject')),
    (get_event_id('ron_weasley_birth'), get_individual_id('arthur_weasley'), get_event_role_id('father')),
    (get_event_id('ron_weasley_birth'), get_individual_id('molly_prewett'), get_event_role_id('mother')),

    -- Ginny Weasley's birth
    (get_event_id('ginny_weasley_birth'), get_individual_id('ginny_weasley'), get_event_role_id('subject')),
    (get_event_id('ginny_weasley_birth'), get_individual_id('arthur_weasley'), get_event_role_id('father')),
    (get_event_id('ginny_weasley_birth'), get_individual_id('molly_prewett'), get_event_role_id('mother')),

    /* Marriage Event Participants */
    -- Fleamont and Euphemia's marriage
    (get_event_id('fleamont_euphemia_marriage'), get_individual_id('fleamont_potter'), get_event_role_id('groom')),
    (get_event_id('fleamont_euphemia_marriage'), get_individual_id('euphemia_potter'), get_event_role_id('bride')),

    -- James and Lily's marriage
    (get_event_id('james_lily_marriage'), get_individual_id('james_potter'), get_event_role_id('groom')),
    (get_event_id('james_lily_marriage'), get_individual_id('lily_evans'), get_event_role_id('bride')),
    -- James's parents
    (get_event_id('james_lily_marriage'), get_individual_id('fleamont_potter'), get_event_role_id('father')),
    (get_event_id('james_lily_marriage'), get_individual_id('euphemia_potter'), get_event_role_id('mother')),
    -- Lily's parents
    (get_event_id('james_lily_marriage'), get_individual_id('john_evans'), get_event_role_id('father')),
    (get_event_id('james_lily_marriage'), get_individual_id('mary_evans'), get_event_role_id('mother')),

    -- Harry and Ginny's marriage
    (get_event_id('harry_ginny_marriage'), get_individual_id('harry_potter'), get_event_role_id('groom')),
    (get_event_id('harry_ginny_marriage'), get_individual_id('ginny_weasley'), get_event_role_id('bride')),
    -- Harry's parents
    (get_event_id('harry_ginny_marriage'), get_individual_id('james_potter'), get_event_role_id('father')),
    (get_event_id('harry_ginny_marriage'), get_individual_id('lily_evans'), get_event_role_id('mother')),
    -- Ginny's parents
    (get_event_id('harry_ginny_marriage'), get_individual_id('arthur_weasley'), get_event_role_id('father')),
    (get_event_id('harry_ginny_marriage'), get_individual_id('molly_prewett'), get_event_role_id('mother')),
    (get_event_id('harry_ginny_marriage'), get_individual_id('ron_weasley'), get_event_role_id('witness')),
    (get_event_id('harry_ginny_marriage'), get_individual_id('hermione_granger'), get_event_role_id('witness')),

    -- Ron and Hermione's marriage
    (get_event_id('ron_hermione_marriage'), get_individual_id('ron_weasley'), get_event_role_id('groom')),
    (get_event_id('ron_hermione_marriage'), get_individual_id('hermione_granger'), get_event_role_id('bride')),
    -- Ron's parents
    (get_event_id('ron_hermione_marriage'), get_individual_id('arthur_weasley'), get_event_role_id('father')),
    (get_event_id('ron_hermione_marriage'), get_individual_id('molly_prewett'), get_event_role_id('mother')),
    -- Hermione's parents
    (get_event_id('ron_hermione_marriage'), get_individual_id('william_granger'), get_event_role_id('father')),
    (get_event_id('ron_hermione_marriage'), get_individual_id('helen_granger'), get_event_role_id('mother')),
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
