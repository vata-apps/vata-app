CREATE OR REPLACE FUNCTION get_event_id(key text) RETURNS uuid AS $$
BEGIN
    RETURN CASE key
        /* *************************************************************************
         * HARRY POTTER
         * ************************************************************************* */
        WHEN 'fleamont_potter_birth'      THEN '00000001-0004-0000-0000-000000000001'::uuid
        WHEN 'euphemia_potter_birth'      THEN '00000001-0004-0000-0000-000000000002'::uuid
        WHEN 'james_potter_birth'         THEN '00000001-0004-0000-0000-000000000003'::uuid
        WHEN 'lily_evans_birth'           THEN '00000001-0004-0000-0000-000000000004'::uuid
        WHEN 'harry_potter_birth'         THEN '00000001-0004-0000-0000-000000000005'::uuid
        WHEN 'hermione_granger_birth'     THEN '00000001-0004-0000-0000-000000000006'::uuid
        WHEN 'ron_weasley_birth'          THEN '00000001-0004-0000-0000-000000000007'::uuid
        WHEN 'ginny_weasley_birth'        THEN '00000001-0004-0000-0000-000000000008'::uuid
        WHEN 'fleamont_potter_death'      THEN '00000001-0004-0000-0000-000000000009'::uuid
        WHEN 'euphemia_potter_death'      THEN '00000001-0004-0000-0000-000000000010'::uuid
        WHEN 'james_potter_death'         THEN '00000001-0004-0000-0000-000000000011'::uuid
        WHEN 'lily_evans_death'           THEN '00000001-0004-0000-0000-000000000012'::uuid
        WHEN 'fred_weasley_death'         THEN '00000001-0004-0000-0000-000000000013'::uuid
        WHEN 'fleamont_euphemia_marriage' THEN '00000001-0004-0000-0000-000000000014'::uuid
        WHEN 'john_mary_marriage'         THEN '00000001-0004-0000-0000-000000000015'::uuid
        WHEN 'james_lily_marriage'        THEN '00000001-0004-0000-0000-000000000016'::uuid
        WHEN 'harry_ginny_marriage'       THEN '00000001-0004-0000-0000-000000000017'::uuid
        WHEN 'ron_hermione_marriage'      THEN '00000001-0004-0000-0000-000000000018'::uuid
        WHEN 'bill_weasley_marriage'      THEN '00000001-0004-0000-0000-000000000019'::uuid
        WHEN 'percy_weasley_marriage'     THEN '00000001-0004-0000-0000-000000000020'::uuid
        WHEN 'george_weasley_marriage'    THEN '00000001-0004-0000-0000-000000000021'::uuid

        /* *************************************************************************
         * GAME OF THRONES
         * ************************************************************************* */
        -- TODO: Add Game of Thrones events

        /* *************************************************************************
         * NOS ÉTÉS
         * ************************************************************************* */
        -- TODO: Add Nos Étés events

        ELSE NULL
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
