-- Insert events into the unified events table
INSERT INTO events (id, type_id, date, place_id, description)
VALUES
    /* Birth Events */
    (get_event_id('fleamont_potter_birth'), get_event_type_id('birth'), '1909-03-17', get_place_id('london'), 'Birth of Fleamont Potter'),
    (get_event_id('euphemia_potter_birth'), get_event_type_id('birth'), '1910-06-28', get_place_id('london'), 'Birth of Euphemia Potter'),
    (get_event_id('james_potter_birth'), get_event_type_id('birth'), '1960-03-27', get_place_id('godrics_hollow'), 'Birth of James Potter'),
    (get_event_id('lily_evans_birth'), get_event_type_id('birth'), '1960-01-30', get_place_id('london'), 'Birth of Lily Evans'),
    (get_event_id('harry_potter_birth'), get_event_type_id('birth'), '1980-07-31', get_place_id('godrics_hollow'), 'Birth of Harry Potter'),
    (get_event_id('hermione_granger_birth'), get_event_type_id('birth'), '1979-09-19', get_place_id('london'), 'Birth of Hermione Granger'),
    (get_event_id('ron_weasley_birth'), get_event_type_id('birth'), '1980-03-01', get_place_id('the_burrow'), 'Birth of Ronald "Ron" Weasley'),
    (get_event_id('ginny_weasley_birth'), get_event_type_id('birth'), '1981-08-11', get_place_id('the_burrow'), 'Birth of Ginevra "Ginny" Weasley'),

    /* Death Events */
    (get_event_id('fleamont_potter_death'), get_event_type_id('death'), '1979-11-05', get_place_id('godrics_hollow'), 'Death of Fleamont Potter from Dragon Pox'),
    (get_event_id('euphemia_potter_death'), get_event_type_id('death'), '1979-12-15', get_place_id('godrics_hollow'), 'Death of Euphemia Potter from Dragon Pox'),
    (get_event_id('james_potter_death'), get_event_type_id('death'), '1981-10-31', get_place_id('godrics_hollow'), 'Death of James Potter by Lord Voldemort'),
    (get_event_id('lily_evans_death'), get_event_type_id('death'), '1981-10-31', get_place_id('godrics_hollow'), 'Death of Lily Evans by Lord Voldemort'),
    (get_event_id('fred_weasley_death'), get_event_type_id('death'), '1998-05-02', get_place_id('hogwarts'), 'Death of Fred Weasley during the Battle of Hogwarts'),

    /* Marriage Events */
    (get_event_id('fleamont_euphemia_marriage'), get_event_type_id('marriage'), '1940-06-15', get_place_id('london'), 'Marriage of Fleamont Potter and Euphemia Potter'),
    (get_event_id('james_lily_marriage'), get_event_type_id('marriage'), '1978-10-17', get_place_id('godrics_hollow'), 'Marriage of James Potter and Lily Evans'),
    (get_event_id('harry_ginny_marriage'), get_event_type_id('marriage'), '2000-05-02', get_place_id('the_burrow'), 'Marriage of Harry Potter and Ginny Weasley'),
    (get_event_id('ron_hermione_marriage'), get_event_type_id('marriage'), '2000-09-01', get_place_id('the_burrow'), 'Marriage of Ron Weasley and Hermione Granger'),

    /* Incomplete Genealogical Events - Without date and without location */
    (get_event_id('tom_riddle_birth'), get_event_type_id('birth'), NULL, NULL, 'Birth of Tom Riddle - date and location unknown'),
    (get_event_id('godric_gryffindor_death'), get_event_type_id('death'), NULL, NULL, 'Death of Godric Gryffindor - circumstances unknown'),

    /* Incomplete Genealogical Events - With date but without location */
    (get_event_id('tom_riddle_graduation'), get_event_type_id('graduation'), '1945-06-01', NULL, 'Tom Riddle graduates from Hogwarts - exact ceremony location unknown'),
    (get_event_id('lily_evans_graduation'), get_event_type_id('graduation'), '1978-06-01', NULL, 'Lily Evans graduates from Hogwarts - exact ceremony location unknown'),

    /* Incomplete Genealogical Events - Without date but with location */
    (get_event_id('salazar_slytherin_burial'), get_event_type_id('burial'), NULL, get_place_id('hogwarts'), 'Burial of Salazar Slytherin somewhere at Hogwarts - date unknown'),
    (get_event_id('helga_hufflepuff_burial'), get_event_type_id('burial'), NULL, get_place_id('godrics_hollow'), 'Burial of Helga Hufflepuff at Godric''s Hollow - date unknown'),

    /* Incomplete Marriage Events for Weasley Children */
    (get_event_id('bill_weasley_marriage'), get_event_type_id('marriage'), NULL, NULL, 'Marriage of Bill Weasley - spouse, date and location unknown'),
    (get_event_id('percy_weasley_marriage'), get_event_type_id('marriage'), '2001-08-15', NULL, 'Marriage of Percy Weasley - spouse and location unknown'),
    (get_event_id('george_weasley_marriage'), get_event_type_id('marriage'), '2002-04-20', NULL, 'Marriage of George Weasley - spouse and location unknown'); 
