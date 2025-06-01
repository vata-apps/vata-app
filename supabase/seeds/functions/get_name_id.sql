CREATE OR REPLACE FUNCTION get_name_id(key text) RETURNS uuid AS $$
BEGIN
    RETURN CASE key
        /* *************************************************************************
         * HARRY POTTER
         * ************************************************************************* */

        -- Generation 4
        WHEN 'fleamont_potter_birth'        THEN '00000001-0001-0001-0004-000000000001'::uuid
        WHEN 'euphemia_potter_birth'        THEN '00000001-0001-0001-0004-000000000002'::uuid
        WHEN 'john_evans_birth'             THEN '00000001-0001-0001-0004-000000000003'::uuid
        WHEN 'mary_evans_birth'             THEN '00000001-0001-0001-0004-000000000004'::uuid
        WHEN 'septimus_weasley_birth'       THEN '00000001-0001-0001-0004-000000000005'::uuid
        WHEN 'cedrella_black_birth'         THEN '00000001-0001-0001-0004-000000000006'::uuid
        WHEN 'cedrella_weasley_marriage'    THEN '00000001-0001-0001-0004-000000000007'::uuid
        WHEN 'ignatius_prewett_birth'       THEN '00000001-0001-0001-0004-000000000008'::uuid
        WHEN 'lucretia_prewett_birth'       THEN '00000001-0001-0001-0004-000000000009'::uuid

        -- Generation 3
        WHEN 'james_potter_birth'           THEN '00000001-0001-0001-0003-000000000001'::uuid
        WHEN 'lily_evans_birth'             THEN '00000001-0001-0001-0003-000000000002'::uuid
        WHEN 'lily_potter_marriage'         THEN '00000001-0001-0001-0003-000000000003'::uuid
        WHEN 'arthur_weasley_birth'         THEN '00000001-0001-0001-0003-000000000004'::uuid
        WHEN 'molly_prewett_birth'          THEN '00000001-0001-0001-0003-000000000005'::uuid
        WHEN 'molly_weasley_marriage'       THEN '00000001-0001-0001-0003-000000000006'::uuid
        WHEN 'father_granger_birth'         THEN '00000001-0001-0001-0003-000000000007'::uuid
        WHEN 'mother_granger_birth'         THEN '00000001-0001-0001-0003-000000000008'::uuid

        -- Generation 2
        WHEN 'bill_weasley_birth'           THEN '00000001-0001-0001-0002-000000000001'::uuid
        WHEN 'charlie_weasley_birth'        THEN '00000001-0001-0001-0002-000000000002'::uuid
        WHEN 'percy_weasley_birth'          THEN '00000001-0001-0001-0002-000000000003'::uuid
        WHEN 'percival_weasley_nickname'    THEN '00000001-0001-0001-0002-000000000004'::uuid
        WHEN 'fred_weasley_birth'           THEN '00000001-0001-0001-0002-000000000005'::uuid
        WHEN 'george_weasley_birth'         THEN '00000001-0001-0001-0002-000000000006'::uuid
        WHEN 'ronald_weasley_birth'         THEN '00000001-0001-0001-0002-000000000007'::uuid
        WHEN 'ron_weasley_nickname'         THEN '00000001-0001-0001-0002-000000000008'::uuid
        WHEN 'ginny_weasley_birth'          THEN '00000001-0001-0001-0002-000000000009'::uuid
        WHEN 'ginny_weasley_nickname'       THEN '00000001-0001-0001-0002-000000000010'::uuid
        WHEN 'ginny_potter_marriage'        THEN '00000001-0001-0001-0002-000000000011'::uuid
        WHEN 'harry_potter_birth'           THEN '00000001-0001-0001-0002-000000000012'::uuid
        WHEN 'hermione_granger_birth'       THEN '00000001-0001-0001-0002-000000000013'::uuid
        WHEN 'hermione_weasley_marriage'    THEN '00000001-0001-0001-0002-000000000014'::uuid

        -- Generation 1
        WHEN 'james_sirius_potter_birth'    THEN '00000001-0001-0001-0001-000000000001'::uuid
        WHEN 'james_sirius_potter_nickname' THEN '00000001-0001-0001-0001-000000000002'::uuid
        WHEN 'albus_potter_birth'           THEN '00000001-0001-0001-0001-000000000003'::uuid
        WHEN 'albus_severus_potter_nickname' THEN '00000001-0001-0001-0001-000000000004'::uuid
        WHEN 'lily_luna_potter_birth'       THEN '00000001-0001-0001-0001-000000000005'::uuid
        WHEN 'lily_luna_potter_nickname'    THEN '00000001-0001-0001-0001-000000000006'::uuid
        WHEN 'rose_weasley_birth'           THEN '00000001-0001-0001-0001-000000000007'::uuid
        WHEN 'hugo_weasley_birth'           THEN '00000001-0001-0001-0001-000000000008'::uuid

        /* *************************************************************************
         * GAME OF THRONES
         * ************************************************************************* */
        -- TODO: Add Game of Thrones names

        /* *************************************************************************
         * NOS ÉTÉS
         * ************************************************************************* */
        -- TODO: Add Nos Étés names

        ELSE NULL
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
