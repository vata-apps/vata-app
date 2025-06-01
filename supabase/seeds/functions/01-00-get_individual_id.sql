CREATE OR REPLACE FUNCTION get_individual_id(key text) RETURNS uuid AS $$
BEGIN
    /* *************************************************************************
     * HARRY POTTER
     * ************************************************************************* */

    -- Generation 4
    IF    key = 'fleamont_potter'     THEN RETURN '00000001-0001-0000-0004-000000000001'::uuid;
    ELSIF key = 'euphemia_potter'     THEN RETURN '00000001-0001-0000-0004-000000000002'::uuid;
    ELSIF key = 'john_evans'          THEN RETURN '00000001-0001-0000-0004-000000000003'::uuid;
    ELSIF key = 'mary_evans'          THEN RETURN '00000001-0001-0000-0004-000000000004'::uuid;
    ELSIF key = 'septimus_weasley'    THEN RETURN '00000001-0001-0000-0004-000000000005'::uuid;
    ELSIF key = 'cedrella_black'      THEN RETURN '00000001-0001-0000-0004-000000000006'::uuid;
    ELSIF key = 'ignatius_prewett'    THEN RETURN '00000001-0001-0000-0004-000000000007'::uuid;
    ELSIF key = 'lucretia_prewett'    THEN RETURN '00000001-0001-0000-0004-000000000008'::uuid;

    -- Generation 3
    ELSIF key = 'james_potter'        THEN RETURN '00000001-0001-0000-0003-000000000001'::uuid;
    ELSIF key = 'lily_evans'          THEN RETURN '00000001-0001-0000-0003-000000000002'::uuid;
    ELSIF key = 'arthur_weasley'      THEN RETURN '00000001-0001-0000-0003-000000000003'::uuid;
    ELSIF key = 'molly_prewett'       THEN RETURN '00000001-0001-0000-0003-000000000004'::uuid;
    ELSIF key = 'father_granger'      THEN RETURN '00000001-0001-0000-0003-000000000005'::uuid;
    ELSIF key = 'mother_granger'      THEN RETURN '00000001-0001-0000-0003-000000000006'::uuid;
    ELSIF key = 'father_delacour'     THEN RETURN '00000001-0001-0000-0003-000000000007'::uuid;
    ELSIF key = 'mother_delacour'     THEN RETURN '00000001-0001-0000-0003-000000000008'::uuid;

    -- Generation 2
    ELSIF key = 'bill_weasley'        THEN RETURN '00000001-0001-0000-0002-000000000001'::uuid;
    ELSIF key = 'charlie_weasley'     THEN RETURN '00000001-0001-0000-0002-000000000002'::uuid;
    ELSIF key = 'percy_weasley'       THEN RETURN '00000001-0001-0000-0002-000000000003'::uuid;
    ELSIF key = 'fred_weasley'        THEN RETURN '00000001-0001-0000-0002-000000000004'::uuid;
    ELSIF key = 'george_weasley'      THEN RETURN '00000001-0001-0000-0002-000000000005'::uuid;
    ELSIF key = 'ron_weasley'         THEN RETURN '00000001-0001-0000-0002-000000000006'::uuid;
    ELSIF key = 'ginny_weasley'       THEN RETURN '00000001-0001-0000-0002-000000000007'::uuid;
    ELSIF key = 'harry_potter'        THEN RETURN '00000001-0001-0000-0002-000000000008'::uuid;
    ELSIF key = 'hermione_granger'    THEN RETURN '00000001-0001-0000-0002-000000000009'::uuid;
    ELSIF key = 'fleur_delacour'      THEN RETURN '00000001-0001-0000-0002-000000000010'::uuid;
    ELSIF key = 'audrey_unknown'      THEN RETURN '00000001-0001-0000-0002-000000000011'::uuid;
    ELSIF key = 'angelina_johnson'    THEN RETURN '00000001-0001-0000-0002-000000000012'::uuid;

    -- Generation 1
    ELSIF key = 'james_sirius_potter' THEN RETURN '00000001-0001-0000-0001-000000000001'::uuid;
    ELSIF key = 'albus_potter'        THEN RETURN '00000001-0001-0000-0001-000000000002'::uuid;
    ELSIF key = 'lily_luna_potter'    THEN RETURN '00000001-0001-0000-0001-000000000003'::uuid;
    ELSIF key = 'rose_weasley'        THEN RETURN '00000001-0001-0000-0001-000000000004'::uuid;
    ELSIF key = 'hugo_weasley'        THEN RETURN '00000001-0001-0000-0001-000000000005'::uuid;
    ELSIF key = 'victoire_weasley'    THEN RETURN '00000001-0001-0000-0001-000000000006'::uuid;
    ELSIF key = 'louis_weasley'       THEN RETURN '00000001-0001-0000-0001-000000000007'::uuid;
    ELSIF key = 'dominique_weasley'   THEN RETURN '00000001-0001-0000-0001-000000000008'::uuid;
    ELSIF key = 'molly_ii_weasley'    THEN RETURN '00000001-0001-0000-0001-000000000009'::uuid;
    ELSIF key = 'lucy_weasley'        THEN RETURN '00000001-0001-0000-0001-000000000010'::uuid;
    ELSIF key = 'fred_ii_weasley'     THEN RETURN '00000001-0001-0000-0001-000000000011'::uuid;
    ELSIF key = 'roxanne_weasley'     THEN RETURN '00000001-0001-0000-0001-000000000012'::uuid;

    /* *************************************************************************
     * GAME OF THRONES
     * ************************************************************************* */
    -- TODO: Add Game of Thrones individuals

    /* *************************************************************************
     * NOS ÉTÉS
     * ************************************************************************* */
    -- TODO: Add Nos Étés individuals

    ELSE
        RAISE EXCEPTION 'Individual key not found: %', key;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
