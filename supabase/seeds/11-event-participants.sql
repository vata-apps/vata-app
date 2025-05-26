-- Insert event participants with their roles
INSERT INTO event_participants (event_id, individual_id, role_id)
VALUES
    /* Birth Event Participants */
    -- Fleamont Potter's birth
    (get_event_id('fleamont_potter_birth'), get_individual_id('fleamont_potter'), get_event_role_id('Subject')),

    -- Euphemia Potter's birth
    (get_event_id('euphemia_potter_birth'), get_individual_id('euphemia_potter'), get_event_role_id('Subject')),

    -- James Potter's birth
    (get_event_id('james_potter_birth'), get_individual_id('james_potter'), get_event_role_id('Subject')),
    (get_event_id('james_potter_birth'), get_individual_id('fleamont_potter'), get_event_role_id('Father')),
    (get_event_id('james_potter_birth'), get_individual_id('euphemia_potter'), get_event_role_id('Mother')),

    -- Lily Evans' birth
    (get_event_id('lily_evans_birth'), get_individual_id('lily_evans'), get_event_role_id('Subject')),
    (get_event_id('lily_evans_birth'), get_individual_id('john_evans'), get_event_role_id('Father')),
    (get_event_id('lily_evans_birth'), get_individual_id('mary_evans'), get_event_role_id('Mother')),

    -- Harry Potter's birth
    (get_event_id('harry_potter_birth'), get_individual_id('harry_potter'), get_event_role_id('Subject')),
    (get_event_id('harry_potter_birth'), get_individual_id('james_potter'), get_event_role_id('Father')),
    (get_event_id('harry_potter_birth'), get_individual_id('lily_evans'), get_event_role_id('Mother')),

    -- Hermione Granger's birth
    (get_event_id('hermione_granger_birth'), get_individual_id('hermione_granger'), get_event_role_id('Subject')),
    (get_event_id('hermione_granger_birth'), get_individual_id('william_granger'), get_event_role_id('Father')),
    (get_event_id('hermione_granger_birth'), get_individual_id('helen_granger'), get_event_role_id('Mother')),

    -- Ron Weasley's birth
    (get_event_id('ron_weasley_birth'), get_individual_id('ron_weasley'), get_event_role_id('Subject')),
    (get_event_id('ron_weasley_birth'), get_individual_id('arthur_weasley'), get_event_role_id('Father')),
    (get_event_id('ron_weasley_birth'), get_individual_id('molly_prewett'), get_event_role_id('Mother')),

    -- Ginny Weasley's birth
    (get_event_id('ginny_weasley_birth'), get_individual_id('ginny_weasley'), get_event_role_id('Subject')),
    (get_event_id('ginny_weasley_birth'), get_individual_id('arthur_weasley'), get_event_role_id('Father')),
    (get_event_id('ginny_weasley_birth'), get_individual_id('molly_prewett'), get_event_role_id('Mother')),

    /* Marriage Event Participants */
    -- Fleamont and Euphemia's marriage
    (get_event_id('fleamont_euphemia_marriage'), get_individual_id('fleamont_potter'), get_event_role_id('Husband')),
    (get_event_id('fleamont_euphemia_marriage'), get_individual_id('euphemia_potter'), get_event_role_id('Wife')),

    -- James and Lily's marriage
    (get_event_id('james_lily_marriage'), get_individual_id('james_potter'), get_event_role_id('Husband')),
    (get_event_id('james_lily_marriage'), get_individual_id('lily_evans'), get_event_role_id('Wife')),
    -- James's parents
    (get_event_id('james_lily_marriage'), get_individual_id('fleamont_potter'), get_event_role_id('Father of Husband')),
    (get_event_id('james_lily_marriage'), get_individual_id('euphemia_potter'), get_event_role_id('Mother of Husband')),
    -- Lily's parents
    (get_event_id('james_lily_marriage'), get_individual_id('john_evans'), get_event_role_id('Father of Wife')),
    (get_event_id('james_lily_marriage'), get_individual_id('mary_evans'), get_event_role_id('Mother of Wife')),

    -- Harry and Ginny's marriage
    (get_event_id('harry_ginny_marriage'), get_individual_id('harry_potter'), get_event_role_id('Husband')),
    (get_event_id('harry_ginny_marriage'), get_individual_id('ginny_weasley'), get_event_role_id('Wife')),
    -- Harry's parents
    (get_event_id('harry_ginny_marriage'), get_individual_id('james_potter'), get_event_role_id('Father of Husband')),
    (get_event_id('harry_ginny_marriage'), get_individual_id('lily_evans'), get_event_role_id('Mother of Husband')),
    -- Ginny's parents
    (get_event_id('harry_ginny_marriage'), get_individual_id('arthur_weasley'), get_event_role_id('Father of Wife')),
    (get_event_id('harry_ginny_marriage'), get_individual_id('molly_prewett'), get_event_role_id('Mother of Wife')),
    (get_event_id('harry_ginny_marriage'), get_individual_id('ron_weasley'), get_event_role_id('Witness')),
    (get_event_id('harry_ginny_marriage'), get_individual_id('hermione_granger'), get_event_role_id('Witness')),

    -- Ron and Hermione's marriage
    (get_event_id('ron_hermione_marriage'), get_individual_id('ron_weasley'), get_event_role_id('Husband')),
    (get_event_id('ron_hermione_marriage'), get_individual_id('hermione_granger'), get_event_role_id('Wife')),
    -- Ron's parents
    (get_event_id('ron_hermione_marriage'), get_individual_id('arthur_weasley'), get_event_role_id('Father of Husband')),
    (get_event_id('ron_hermione_marriage'), get_individual_id('molly_prewett'), get_event_role_id('Mother of Husband')),
    -- Hermione's parents
    (get_event_id('ron_hermione_marriage'), get_individual_id('william_granger'), get_event_role_id('Father of Wife')),
    (get_event_id('ron_hermione_marriage'), get_individual_id('helen_granger'), get_event_role_id('Mother of Wife')),
    (get_event_id('ron_hermione_marriage'), get_individual_id('harry_potter'), get_event_role_id('Witness')),
    (get_event_id('ron_hermione_marriage'), get_individual_id('ginny_weasley'), get_event_role_id('Witness')),

    /* Death Event Participants */
    -- Fleamont Potter's death
    (get_event_id('fleamont_potter_death'), get_individual_id('fleamont_potter'), get_event_role_id('Deceased')),

    -- Euphemia Potter's death
    (get_event_id('euphemia_potter_death'), get_individual_id('euphemia_potter'), get_event_role_id('Deceased')),

    -- James Potter's death
    (get_event_id('james_potter_death'), get_individual_id('james_potter'), get_event_role_id('Deceased')),

    -- Lily Evans' death
    (get_event_id('lily_evans_death'), get_individual_id('lily_evans'), get_event_role_id('Deceased')),

    -- Fred Weasley's death
    (get_event_id('fred_weasley_death'), get_individual_id('fred_weasley'), get_event_role_id('Deceased')),

    /* Incomplete Genealogical Events Participants */
    -- Tom Riddle's birth (without date and location)
    (get_event_id('tom_riddle_birth'), get_individual_id('tom_riddle'), get_event_role_id('Subject')),

    -- Godric Gryffindor's death (without date and location)
    (get_event_id('godric_gryffindor_death'), get_individual_id('godric_gryffindor'), get_event_role_id('Deceased')),

    -- Tom Riddle's graduation (with date but without location)
    (get_event_id('tom_riddle_graduation'), get_individual_id('tom_riddle'), get_event_role_id('Subject')),

    -- Lily Evans' graduation (with date but without location)
    (get_event_id('lily_evans_graduation'), get_individual_id('lily_evans'), get_event_role_id('Subject')),

    -- Salazar Slytherin's burial (without date but with location)
    (get_event_id('salazar_slytherin_burial'), get_individual_id('salazar_slytherin'), get_event_role_id('Deceased')),

    -- Helga Hufflepuff's burial (without date but with location)
    (get_event_id('helga_hufflepuff_burial'), get_individual_id('helga_hufflepuff'), get_event_role_id('Deceased')),

    /* Incomplete Marriage Events for Weasley Children */
    -- Bill Weasley's marriage (spouse, date and location unknown)
    (get_event_id('bill_weasley_marriage'), get_individual_id('bill_weasley'), get_event_role_id('Husband')),
    (get_event_id('bill_weasley_marriage'), get_individual_id('arthur_weasley'), get_event_role_id('Father of Husband')),
    (get_event_id('bill_weasley_marriage'), get_individual_id('molly_prewett'), get_event_role_id('Mother of Husband')),

    -- Percy Weasley's marriage (spouse and location unknown)
    (get_event_id('percy_weasley_marriage'), get_individual_id('percy_weasley'), get_event_role_id('Husband')),
    (get_event_id('percy_weasley_marriage'), get_individual_id('arthur_weasley'), get_event_role_id('Father of Husband')),
    (get_event_id('percy_weasley_marriage'), get_individual_id('molly_prewett'), get_event_role_id('Mother of Husband')),

    -- George Weasley's marriage (spouse and location unknown)
    (get_event_id('george_weasley_marriage'), get_individual_id('george_weasley'), get_event_role_id('Husband')),
    (get_event_id('george_weasley_marriage'), get_individual_id('arthur_weasley'), get_event_role_id('Father of Husband')),
    (get_event_id('george_weasley_marriage'), get_individual_id('molly_prewett'), get_event_role_id('Mother of Husband')); 
