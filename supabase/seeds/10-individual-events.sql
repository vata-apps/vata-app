INSERT INTO individual_events (id, individual_id, type_id, date, place_id, description)
VALUES
    /* Generation 4 - Birth and Death Events */
    (get_individual_event_id('fleamont_potter_birth'), get_individual_id('fleamont_potter'), get_individual_event_type_id('birth'), '1909-03-17', get_place_id('london'), 'Birth of Fleamont Potter'),
    (get_individual_event_id('fleamont_potter_death'), get_individual_id('fleamont_potter'), get_individual_event_type_id('death'), '1979-11-05', get_place_id('godrics_hollow'), 'Death of Fleamont Potter from Dragon Pox'),
    (get_individual_event_id('euphemia_potter_birth'), get_individual_id('euphemia_potter'), get_individual_event_type_id('birth'), '1910-06-28', get_place_id('london'), 'Birth of Euphemia Potter'),
    (get_individual_event_id('euphemia_potter_death'), get_individual_id('euphemia_potter'), get_individual_event_type_id('death'), '1979-12-15', get_place_id('godrics_hollow'), 'Death of Euphemia Potter from Dragon Pox'),
    (get_individual_event_id('john_evans_birth'), get_individual_id('john_evans'), get_individual_event_type_id('birth'), '1925-09-10', get_place_id('london'), 'Birth of John Evans'),
    (get_individual_event_id('john_evans_death'), get_individual_id('john_evans'), get_individual_event_type_id('death'), '1985-04-21', get_place_id('london'), 'Death of John Evans'),
    (get_individual_event_id('mary_evans_birth'), get_individual_id('mary_evans'), get_individual_event_type_id('birth'), '1927-02-14', get_place_id('london'), 'Birth of Mary Evans'),
    (get_individual_event_id('mary_evans_death'), get_individual_id('mary_evans'), get_individual_event_type_id('death'), '1985-04-21', get_place_id('london'), 'Death of Mary Evans'),
    (get_individual_event_id('septimus_weasley_birth'), get_individual_id('septimus_weasley'), get_individual_event_type_id('birth'), '1915-08-03', get_place_id('ottery_st_catchpole'), 'Birth of Septimus Weasley'),
    (get_individual_event_id('septimus_weasley_death'), get_individual_id('septimus_weasley'), get_individual_event_type_id('death'), '1990-01-12', get_place_id('the_burrow'), 'Death of Septimus Weasley'),
    (get_individual_event_id('cedrella_black_birth'), get_individual_id('cedrella_black'), get_individual_event_type_id('birth'), '1917-11-22', get_place_id('london'), 'Birth of Cedrella Black'),
    (get_individual_event_id('cedrella_black_death'), get_individual_id('cedrella_black'), get_individual_event_type_id('death'), '1992-07-30', get_place_id('the_burrow'), 'Death of Cedrella Black'),
    (get_individual_event_id('ignatius_prewett_birth'), get_individual_id('ignatius_prewett'), get_individual_event_type_id('birth'), '1918-05-15', get_place_id('london'), 'Birth of Ignatius Prewett'),
    (get_individual_event_id('ignatius_prewett_death'), get_individual_id('ignatius_prewett'), get_individual_event_type_id('death'), '1989-03-27', get_place_id('london'), 'Death of Ignatius Prewett'),
    (get_individual_event_id('lucretia_prewett_birth'), get_individual_id('lucretia_prewett'), get_individual_event_type_id('birth'), '1919-12-05', get_place_id('london'), 'Birth of Lucretia Prewett'),
    (get_individual_event_id('lucretia_prewett_death'), get_individual_id('lucretia_prewett'), get_individual_event_type_id('death'), '1989-06-18', get_place_id('london'), 'Death of Lucretia Prewett'),

    /* Generation 3 - Birth and Death Events */
    (get_individual_event_id('james_potter_birth'), get_individual_id('james_potter'), get_individual_event_type_id('birth'), '1960-03-27', get_place_id('godrics_hollow'), 'Birth of James Potter'),
    (get_individual_event_id('james_potter_death'), get_individual_id('james_potter'), get_individual_event_type_id('death'), '1981-10-31', get_place_id('godrics_hollow'), 'Death of James Potter by Lord Voldemort'),
    (get_individual_event_id('lily_evans_birth'), get_individual_id('lily_evans'), get_individual_event_type_id('birth'), '1960-01-30', get_place_id('london'), 'Birth of Lily Evans'),
    (get_individual_event_id('lily_evans_death'), get_individual_id('lily_evans'), get_individual_event_type_id('death'), '1981-10-31', get_place_id('godrics_hollow'), 'Death of Lily Evans by Lord Voldemort'),
    (get_individual_event_id('arthur_weasley_birth'), get_individual_id('arthur_weasley'), get_individual_event_type_id('birth'), '1950-02-06', get_place_id('the_burrow'), 'Birth of Arthur Weasley'),
    (get_individual_event_id('molly_prewett_birth'), get_individual_id('molly_prewett'), get_individual_event_type_id('birth'), '1950-10-30', get_place_id('london'), 'Birth of Molly Prewett'),
    (get_individual_event_id('william_granger_birth'), get_individual_id('william_granger'), get_individual_event_type_id('birth'), '1955-04-12', get_place_id('london'), 'Birth of William Granger'),
    (get_individual_event_id('helen_granger_birth'), get_individual_id('helen_granger'), get_individual_event_type_id('birth'), '1956-09-19', get_place_id('london'), 'Birth of Helen Granger'),

    /* Generation 2 - Birth and Death Events */
    (get_individual_event_id('bill_weasley_birth'), get_individual_id('bill_weasley'), get_individual_event_type_id('birth'), '1970-11-29', get_place_id('the_burrow'), 'Birth of William "Bill" Weasley'),
    (get_individual_event_id('charlie_weasley_birth'), get_individual_id('charlie_weasley'), get_individual_event_type_id('birth'), '1972-12-12', get_place_id('the_burrow'), 'Birth of Charles "Charlie" Weasley'),
    (get_individual_event_id('percy_weasley_birth'), get_individual_id('percy_weasley'), get_individual_event_type_id('birth'), '1976-08-22', get_place_id('the_burrow'), 'Birth of Percival "Percy" Weasley'),
    (get_individual_event_id('fred_weasley_birth'), get_individual_id('fred_weasley'), get_individual_event_type_id('birth'), '1978-04-01', get_place_id('the_burrow'), 'Birth of Fred Weasley'),
    (get_individual_event_id('fred_weasley_death'), get_individual_id('fred_weasley'), get_individual_event_type_id('death'), '1998-05-02', get_place_id('hogwarts'), 'Death of Fred Weasley during the Battle of Hogwarts'),
    (get_individual_event_id('george_weasley_birth'), get_individual_id('george_weasley'), get_individual_event_type_id('birth'), '1978-04-01', get_place_id('the_burrow'), 'Birth of George Weasley'),
    (get_individual_event_id('ron_weasley_birth'), get_individual_id('ron_weasley'), get_individual_event_type_id('birth'), '1980-03-01', get_place_id('the_burrow'), 'Birth of Ronald "Ron" Weasley'),
    (get_individual_event_id('ginny_weasley_birth'), get_individual_id('ginny_weasley'), get_individual_event_type_id('birth'), '1981-08-11', get_place_id('the_burrow'), 'Birth of Ginevra "Ginny" Weasley'),
    (get_individual_event_id('harry_potter_birth'), get_individual_id('harry_potter'), get_individual_event_type_id('birth'), '1980-07-31', get_place_id('godrics_hollow'), 'Birth of Harry Potter'),
    (get_individual_event_id('hermione_granger_birth'), get_individual_id('hermione_granger'), get_individual_event_type_id('birth'), '1979-09-19', get_place_id('london'), 'Birth of Hermione Granger'),

    /* Generation 1 - Birth Events */
    (get_individual_event_id('james_sirius_potter_birth'), get_individual_id('james_sirius_potter'), get_individual_event_type_id('birth'), '2004-03-14', get_place_id('st_mungos'), 'Birth of James Sirius Potter'),
    (get_individual_event_id('albus_potter_birth'), get_individual_id('albus_potter'), get_individual_event_type_id('birth'), '2006-01-25', get_place_id('st_mungos'), 'Birth of Albus Severus Potter'),
    (get_individual_event_id('lily_luna_potter_birth'), get_individual_id('lily_luna_potter'), get_individual_event_type_id('birth'), '2008-07-03', get_place_id('st_mungos'), 'Birth of Lily Luna Potter'),
    (get_individual_event_id('rose_weasley_birth'), get_individual_id('rose_weasley'), get_individual_event_type_id('birth'), '2005-11-21', get_place_id('st_mungos'), 'Birth of Rose Weasley'),
    (get_individual_event_id('hugo_weasley_birth'), get_individual_id('hugo_weasley'), get_individual_event_type_id('birth'), '2008-05-09', get_place_id('st_mungos'), 'Birth of Hugo Weasley');
