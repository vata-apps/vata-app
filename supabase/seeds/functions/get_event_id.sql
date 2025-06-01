CREATE OR REPLACE FUNCTION get_event_id(key text) RETURNS uuid AS $$
BEGIN
    RETURN CASE key
        /* *************************************************************************
         * HARRY POTTER
         * ************************************************************************* */

        -- Generation 4
        WHEN 'fleamont_potter_birth'      THEN '00000001-0004-0000-0004-000000000001'::uuid
        WHEN 'euphemia_potter_birth'      THEN '00000001-0004-0000-0004-000000000002'::uuid
        WHEN 'john_evans_birth'           THEN '00000001-0004-0000-0004-000000000003'::uuid
        WHEN 'mary_evans_birth'           THEN '00000001-0004-0000-0004-000000000004'::uuid
        WHEN 'septimus_weasley_birth'     THEN '00000001-0004-0000-0004-000000000005'::uuid
        WHEN 'cedrella_black_birth'       THEN '00000001-0004-0000-0004-000000000006'::uuid
        WHEN 'ignatius_prewett_birth'     THEN '00000001-0004-0000-0004-000000000007'::uuid
        WHEN 'lucretia_prewett_birth'     THEN '00000001-0004-0000-0004-000000000008'::uuid
        WHEN 'fleamont_potter_death'      THEN '00000001-0004-0000-0004-000000000009'::uuid
        WHEN 'euphemia_potter_death'      THEN '00000001-0004-0000-0004-000000000010'::uuid
        WHEN 'fleamont_euphemia_marriage' THEN '00000001-0004-0000-0004-000000000011'::uuid
        WHEN 'john_mary_marriage'         THEN '00000001-0004-0000-0004-000000000012'::uuid
        WHEN 'septimus_cedrella_marriage' THEN '00000001-0004-0000-0004-000000000013'::uuid
        WHEN 'ignatius_lucretia_marriage' THEN '00000001-0004-0000-0004-000000000014'::uuid

        -- Generation 3
        WHEN 'james_potter_birth'         THEN '00000001-0004-0000-0003-000000000001'::uuid
        WHEN 'lily_evans_birth'           THEN '00000001-0004-0000-0003-000000000002'::uuid
        WHEN 'arthur_weasley_birth'       THEN '00000001-0004-0000-0003-000000000003'::uuid
        WHEN 'molly_prewett_birth'        THEN '00000001-0004-0000-0003-000000000004'::uuid
        WHEN 'william_granger_birth'      THEN '00000001-0004-0000-0003-000000000005'::uuid
        WHEN 'helen_granger_birth'        THEN '00000001-0004-0000-0003-000000000006'::uuid
        WHEN 'unknown_delacour_birth'     THEN '00000001-0004-0000-0003-000000000007'::uuid
        WHEN 'apoline_delacour_birth'     THEN '00000001-0004-0000-0003-000000000008'::uuid
        WHEN 'james_potter_death'         THEN '00000001-0004-0000-0003-000000000009'::uuid
        WHEN 'lily_evans_death'           THEN '00000001-0004-0000-0003-000000000010'::uuid
        WHEN 'james_lily_marriage'        THEN '00000001-0004-0000-0003-000000000011'::uuid
        WHEN 'arthur_molly_marriage'      THEN '00000001-0004-0000-0003-000000000012'::uuid
        WHEN 'william_helen_marriage'     THEN '00000001-0004-0000-0003-000000000013'::uuid

        -- Generation 2
        WHEN 'bill_weasley_birth'         THEN '00000001-0004-0000-0002-000000000001'::uuid
        WHEN 'charlie_weasley_birth'      THEN '00000001-0004-0000-0002-000000000002'::uuid
        WHEN 'percy_weasley_birth'        THEN '00000001-0004-0000-0002-000000000003'::uuid
        WHEN 'fred_weasley_birth'         THEN '00000001-0004-0000-0002-000000000004'::uuid
        WHEN 'george_weasley_birth'       THEN '00000001-0004-0000-0002-000000000005'::uuid
        WHEN 'ron_weasley_birth'          THEN '00000001-0004-0000-0002-000000000006'::uuid
        WHEN 'ginny_weasley_birth'        THEN '00000001-0004-0000-0002-000000000007'::uuid
        WHEN 'harry_potter_birth'         THEN '00000001-0004-0000-0002-000000000008'::uuid
        WHEN 'hermione_granger_birth'     THEN '00000001-0004-0000-0002-000000000009'::uuid
        WHEN 'fleur_delacour_birth'       THEN '00000001-0004-0000-0002-000000000010'::uuid
        WHEN 'audrey_unknown_birth'       THEN '00000001-0004-0000-0002-000000000011'::uuid
        WHEN 'angelina_johnson_birth'     THEN '00000001-0004-0000-0002-000000000012'::uuid
        WHEN 'fred_weasley_death'         THEN '00000001-0004-0000-0002-000000000013'::uuid
        WHEN 'harry_ginny_marriage'       THEN '00000001-0004-0000-0002-000000000014'::uuid
        WHEN 'ron_hermione_marriage'      THEN '00000001-0004-0000-0002-000000000015'::uuid
        WHEN 'bill_fleur_marriage'        THEN '00000001-0004-0000-0002-000000000016'::uuid
        WHEN 'percy_audrey_marriage'      THEN '00000001-0004-0000-0002-000000000017'::uuid
        WHEN 'george_angelina_marriage'   THEN '00000001-0004-0000-0002-000000000018'::uuid

        -- Generation 1
        WHEN 'james_sirius_potter_birth'  THEN '00000001-0004-0000-0001-000000000001'::uuid
        WHEN 'albus_potter_birth'         THEN '00000001-0004-0000-0001-000000000002'::uuid
        WHEN 'lily_luna_potter_birth'     THEN '00000001-0004-0000-0001-000000000003'::uuid
        WHEN 'rose_weasley_birth'         THEN '00000001-0004-0000-0001-000000000004'::uuid
        WHEN 'hugo_weasley_birth'         THEN '00000001-0004-0000-0001-000000000005'::uuid
        WHEN 'victoire_weasley_birth'     THEN '00000001-0004-0000-0001-000000000006'::uuid
        WHEN 'louis_weasley_birth'        THEN '00000001-0004-0000-0001-000000000007'::uuid
        WHEN 'dominique_weasley_birth'    THEN '00000001-0004-0000-0001-000000000008'::uuid
        WHEN 'molly_weasley_birth'        THEN '00000001-0004-0000-0001-000000000009'::uuid
        WHEN 'lucy_weasley_birth'         THEN '00000001-0004-0000-0001-000000000010'::uuid
        WHEN 'fred_2_weasley_birth'       THEN '00000001-0004-0000-0001-000000000011'::uuid
        WHEN 'roxanne_weasley_birth'      THEN '00000001-0004-0000-0001-000000000012'::uuid

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
