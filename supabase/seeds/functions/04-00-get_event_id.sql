CREATE OR REPLACE FUNCTION get_event_id(key text) RETURNS uuid AS $$
BEGIN
    /* *************************************************************************
     * HARRY POTTER
     * ************************************************************************* */

    -- Generation 4 Birth Events
    IF    key = 'fleamont_potter_birth'      THEN RETURN '00000001-0004-0000-0004-000000000001'::uuid;
    ELSIF key = 'euphemia_potter_birth'      THEN RETURN '00000001-0004-0000-0004-000000000002'::uuid;
    ELSIF key = 'john_evans_birth'           THEN RETURN '00000001-0004-0000-0004-000000000003'::uuid;
    ELSIF key = 'mary_evans_birth'           THEN RETURN '00000001-0004-0000-0004-000000000004'::uuid;
    ELSIF key = 'septimus_weasley_birth'     THEN RETURN '00000001-0004-0000-0004-000000000005'::uuid;
    ELSIF key = 'cedrella_black_birth'       THEN RETURN '00000001-0004-0000-0004-000000000006'::uuid;
    ELSIF key = 'ignatius_prewett_birth'     THEN RETURN '00000001-0004-0000-0004-000000000007'::uuid;
    ELSIF key = 'lucretia_prewett_birth'     THEN RETURN '00000001-0004-0000-0004-000000000008'::uuid;

    -- Generation 4 Death Events
    ELSIF key = 'fleamont_potter_death'      THEN RETURN '00000001-0004-0000-0004-000000000009'::uuid;
    ELSIF key = 'euphemia_potter_death'      THEN RETURN '00000001-0004-0000-0004-000000000010'::uuid;

    -- Generation 4 Marriage Events
    ELSIF key = 'fleamont_euphemia_marriage' THEN RETURN '00000001-0004-0000-0004-000000000011'::uuid;
    ELSIF key = 'john_mary_marriage'         THEN RETURN '00000001-0004-0000-0004-000000000012'::uuid;
    ELSIF key = 'septimus_cedrella_marriage' THEN RETURN '00000001-0004-0000-0004-000000000013'::uuid;
    ELSIF key = 'ignatius_lucretia_marriage' THEN RETURN '00000001-0004-0000-0004-000000000014'::uuid;

    -- Generation 3 Birth Events
    ELSIF key = 'james_potter_birth'         THEN RETURN '00000001-0004-0000-0003-000000000001'::uuid;
    ELSIF key = 'lily_evans_birth'           THEN RETURN '00000001-0004-0000-0003-000000000002'::uuid;
    ELSIF key = 'arthur_weasley_birth'       THEN RETURN '00000001-0004-0000-0003-000000000003'::uuid;
    ELSIF key = 'molly_prewett_birth'        THEN RETURN '00000001-0004-0000-0003-000000000004'::uuid;

    -- Generation 3 Death Events
    ELSIF key = 'james_potter_death'         THEN RETURN '00000001-0004-0000-0003-000000000005'::uuid;
    ELSIF key = 'lily_evans_death'           THEN RETURN '00000001-0004-0000-0003-000000000006'::uuid;

    -- Generation 3 Marriage Events
    ELSIF key = 'james_lily_marriage'        THEN RETURN '00000001-0004-0000-0003-000000000007'::uuid;
    ELSIF key = 'arthur_molly_marriage'      THEN RETURN '00000001-0004-0000-0003-000000000008'::uuid;

    -- Generation 2 Birth Events
    ELSIF key = 'bill_weasley_birth'         THEN RETURN '00000001-0004-0000-0002-000000000001'::uuid;
    ELSIF key = 'charlie_weasley_birth'      THEN RETURN '00000001-0004-0000-0002-000000000002'::uuid;
    ELSIF key = 'percy_weasley_birth'        THEN RETURN '00000001-0004-0000-0002-000000000003'::uuid;
    ELSIF key = 'fred_weasley_birth'         THEN RETURN '00000001-0004-0000-0002-000000000004'::uuid;
    ELSIF key = 'george_weasley_birth'       THEN RETURN '00000001-0004-0000-0002-000000000005'::uuid;
    ELSIF key = 'ron_weasley_birth'          THEN RETURN '00000001-0004-0000-0002-000000000006'::uuid;
    ELSIF key = 'ginny_weasley_birth'        THEN RETURN '00000001-0004-0000-0002-000000000007'::uuid;
    ELSIF key = 'harry_potter_birth'         THEN RETURN '00000001-0004-0000-0002-000000000008'::uuid;
    ELSIF key = 'hermione_granger_birth'     THEN RETURN '00000001-0004-0000-0002-000000000009'::uuid;
    ELSIF key = 'fleur_delacour_birth'       THEN RETURN '00000001-0004-0000-0002-000000000010'::uuid;
    ELSIF key = 'angelina_johnson_birth'     THEN RETURN '00000001-0004-0000-0002-000000000011'::uuid;

    -- Generation 2 Death Events
    ELSIF key = 'fred_weasley_death'         THEN RETURN '00000001-0004-0000-0002-000000000012'::uuid;

    -- Generation 2 Marriage Events
    ELSIF key = 'harry_ginny_marriage'       THEN RETURN '00000001-0004-0000-0002-000000000013'::uuid;
    ELSIF key = 'ron_hermione_marriage'      THEN RETURN '00000001-0004-0000-0002-000000000014'::uuid;
    ELSIF key = 'bill_fleur_marriage'        THEN RETURN '00000001-0004-0000-0002-000000000015'::uuid;
    ELSIF key = 'percy_audrey_marriage'      THEN RETURN '00000001-0004-0000-0002-000000000016'::uuid;
    ELSIF key = 'george_angelina_marriage'   THEN RETURN '00000001-0004-0000-0002-000000000017'::uuid;

    -- Generation 1 Birth Events
    ELSIF key = 'james_sirius_potter_birth'  THEN RETURN '00000001-0004-0000-0001-000000000001'::uuid;
    ELSIF key = 'albus_potter_birth'         THEN RETURN '00000001-0004-0000-0001-000000000002'::uuid;
    ELSIF key = 'lily_luna_potter_birth'     THEN RETURN '00000001-0004-0000-0001-000000000003'::uuid;
    ELSIF key = 'rose_weasley_birth'         THEN RETURN '00000001-0004-0000-0001-000000000004'::uuid;
    ELSIF key = 'hugo_weasley_birth'         THEN RETURN '00000001-0004-0000-0001-000000000005'::uuid;
    ELSIF key = 'victoire_weasley_birth'     THEN RETURN '00000001-0004-0000-0001-000000000006'::uuid;
    ELSIF key = 'louis_weasley_birth'        THEN RETURN '00000001-0004-0000-0001-000000000007'::uuid;
    ELSIF key = 'dominique_weasley_birth'    THEN RETURN '00000001-0004-0000-0001-000000000008'::uuid;
    ELSIF key = 'molly_weasley_birth'        THEN RETURN '00000001-0004-0000-0001-000000000009'::uuid;
    ELSIF key = 'lucy_weasley_birth'         THEN RETURN '00000001-0004-0000-0001-000000000010'::uuid;
    ELSIF key = 'fred_2_weasley_birth'       THEN RETURN '00000001-0004-0000-0001-000000000011'::uuid;
    ELSIF key = 'roxanne_weasley_birth'      THEN RETURN '00000001-0004-0000-0001-000000000012'::uuid;

    /* *************************************************************************
     * GAME OF THRONES
     * ************************************************************************* */
    -- TODO: Add Game of Thrones events

    /* *************************************************************************
     * NOS ÉTÉS
     * ************************************************************************* */
    -- TODO: Add Nos Étés events

    ELSE
        RAISE EXCEPTION 'Event key not found: %', key;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
