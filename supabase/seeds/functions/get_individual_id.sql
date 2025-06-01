CREATE OR REPLACE FUNCTION get_individual_id(key text) RETURNS uuid AS $$
BEGIN
    RETURN CASE key
        /* *************************************************************************
         * HARRY POTTER
         * ************************************************************************* */

        -- Generation 4
        WHEN 'fleamont_potter'   THEN '00000001-0001-0000-0004-000000000001'::uuid
        WHEN 'euphemia_potter'   THEN '00000001-0001-0000-0004-000000000002'::uuid
        WHEN 'john_evans'        THEN '00000001-0001-0000-0004-000000000003'::uuid
        WHEN 'mary_evans'        THEN '00000001-0001-0000-0004-000000000004'::uuid
        WHEN 'septimus_weasley'  THEN '00000001-0001-0000-0004-000000000005'::uuid
        WHEN 'cedrella_black'    THEN '00000001-0001-0000-0004-000000000006'::uuid
        WHEN 'ignatius_prewett'  THEN '00000001-0001-0000-0004-000000000007'::uuid
        WHEN 'lucretia_prewett'  THEN '00000001-0001-0000-0004-000000000008'::uuid

        -- Generation 3
        WHEN 'james_potter'      THEN '00000001-0001-0000-0003-000000000001'::uuid
        WHEN 'lily_evans'        THEN '00000001-0001-0000-0003-000000000002'::uuid
        WHEN 'arthur_weasley'    THEN '00000001-0001-0000-0003-000000000003'::uuid
        WHEN 'molly_prewett'     THEN '00000001-0001-0000-0003-000000000004'::uuid
        WHEN 'william_granger'   THEN '00000001-0001-0000-0003-000000000005'::uuid
        WHEN 'helen_granger'     THEN '00000001-0001-0000-0003-000000000006'::uuid
        WHEN 'unknown_delacour'  THEN '00000001-0001-0000-0003-000000000007'::uuid
        WHEN 'apoline_delacour'  THEN '00000001-0001-0000-0003-000000000008'::uuid

        -- Generation 2
        WHEN 'bill_weasley'      THEN '00000001-0001-0000-0002-000000000001'::uuid
        WHEN 'charlie_weasley'   THEN '00000001-0001-0000-0002-000000000002'::uuid
        WHEN 'percy_weasley'     THEN '00000001-0001-0000-0002-000000000003'::uuid
        WHEN 'fred_weasley'      THEN '00000001-0001-0000-0002-000000000004'::uuid
        WHEN 'george_weasley'    THEN '00000001-0001-0000-0002-000000000005'::uuid
        WHEN 'ron_weasley'       THEN '00000001-0001-0000-0002-000000000006'::uuid
        WHEN 'ginny_weasley'     THEN '00000001-0001-0000-0002-000000000007'::uuid
        WHEN 'harry_potter'      THEN '00000001-0001-0000-0002-000000000008'::uuid
        WHEN 'hermione_granger'  THEN '00000001-0001-0000-0002-000000000009'::uuid
        WHEN 'fleur_delacour'    THEN '00000001-0001-0000-0002-000000000010'::uuid
        WHEN 'audrey_unknown'    THEN '00000001-0001-0000-0002-000000000011'::uuid
        WHEN 'angelina_johnson'  THEN '00000001-0001-0000-0002-000000000012'::uuid

        -- Generation 1
        WHEN 'james_sirius_potter' THEN '00000001-0001-0000-0001-000000000001'::uuid
        WHEN 'albus_potter'        THEN '00000001-0001-0000-0001-000000000002'::uuid
        WHEN 'lily_luna_potter'    THEN '00000001-0001-0000-0001-000000000003'::uuid
        WHEN 'rose_weasley'        THEN '00000001-0001-0000-0001-000000000004'::uuid
        WHEN 'hugo_weasley'        THEN '00000001-0001-0000-0001-000000000005'::uuid
        WHEN 'victoire_weasley'    THEN '00000001-0001-0000-0001-000000000006'::uuid
        WHEN 'louis_weasley'       THEN '00000001-0001-0000-0001-000000000007'::uuid
        WHEN 'dominique_weasley'   THEN '00000001-0001-0000-0001-000000000008'::uuid
        WHEN 'molly_weasley'       THEN '00000001-0001-0000-0001-000000000009'::uuid
        WHEN 'lucy_weasley'        THEN '00000001-0001-0000-0001-000000000010'::uuid
        WHEN 'fred_2_weasley'      THEN '00000001-0001-0000-0001-000000000011'::uuid
        WHEN 'roxanne_weasley'     THEN '00000001-0001-0000-0001-000000000012'::uuid

        /* *************************************************************************
         * GAME OF THRONES
         * ************************************************************************* */
        -- TODO: Add Game of Thrones individuals

        /* *************************************************************************
         * NOS ÉTÉS
         * ************************************************************************* */
        -- TODO: Add Nos Étés individuals

        ELSE NULL
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
