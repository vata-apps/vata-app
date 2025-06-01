CREATE OR REPLACE FUNCTION get_event_role_id(key text) RETURNS uuid AS $$
BEGIN
    RETURN CASE key
        /* *************************************************************************
         * HARRY POTTER
         * ************************************************************************* */
        WHEN 'subject'           THEN '00000001-0004-0001-0000-000000000001'::uuid
        WHEN 'husband'           THEN '00000001-0004-0001-0000-000000000002'::uuid
        WHEN 'wife'              THEN '00000001-0004-0001-0000-000000000003'::uuid
        WHEN 'deceased'          THEN '00000001-0004-0001-0000-000000000004'::uuid
        WHEN 'mother'            THEN '00000001-0004-0001-0000-000000000005'::uuid
        WHEN 'father'            THEN '00000001-0004-0001-0000-000000000006'::uuid
        WHEN 'witness'           THEN '00000001-0004-0001-0000-000000000007'::uuid
        WHEN 'godfather'         THEN '00000001-0004-0001-0000-000000000008'::uuid
        WHEN 'godmother'         THEN '00000001-0004-0001-0000-000000000009'::uuid
        WHEN 'officiant'         THEN '00000001-0004-0001-0000-000000000010'::uuid
        WHEN 'doctor'            THEN '00000001-0004-0001-0000-000000000011'::uuid
        WHEN 'father_of_husband' THEN '00000001-0004-0001-0000-000000000012'::uuid
        WHEN 'mother_of_husband' THEN '00000001-0004-0001-0000-000000000013'::uuid
        WHEN 'father_of_wife'    THEN '00000001-0004-0001-0000-000000000014'::uuid
        WHEN 'mother_of_wife'    THEN '00000001-0004-0001-0000-000000000015'::uuid
        WHEN 'other'             THEN '00000001-0004-0001-0000-000000000016'::uuid

        /* *************************************************************************
         * GAME OF THRONES
         * ************************************************************************* */
        -- TODO: Add Game of Thrones event roles

        /* *************************************************************************
         * NOS ÉTÉS
         * ************************************************************************* */
        -- TODO: Add Nos Étés event roles

        ELSE NULL
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

