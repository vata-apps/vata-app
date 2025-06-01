CREATE OR REPLACE FUNCTION get_event_type_id(key text) RETURNS uuid AS $$
BEGIN
    RETURN CASE key
        /* *************************************************************************
         * HARRY POTTER
         * ************************************************************************* */
        WHEN 'birth'       THEN '00000001-0004-0002-0000-000000000001'::uuid
        WHEN 'death'       THEN '00000001-0004-0002-0000-000000000002'::uuid
        WHEN 'marriage'    THEN '00000001-0004-0002-0000-000000000003'::uuid
        WHEN 'baptism'     THEN '00000001-0004-0002-0000-000000000004'::uuid
        WHEN 'burial'      THEN '00000001-0004-0002-0000-000000000005'::uuid
        WHEN 'immigration' THEN '00000001-0004-0002-0000-000000000006'::uuid
        WHEN 'census'      THEN '00000001-0004-0002-0000-000000000007'::uuid
        WHEN 'engagement'  THEN '00000001-0004-0002-0000-000000000008'::uuid
        WHEN 'separation'  THEN '00000001-0004-0002-0000-000000000009'::uuid
        WHEN 'retirement'  THEN '00000001-0004-0002-0000-000000000010'::uuid
        WHEN 'other'       THEN '00000001-0004-0002-0000-000000000011'::uuid

        /* *************************************************************************
         * GAME OF THRONES
         * ************************************************************************* */
        -- TODO: Add Game of Thrones event types

        /* *************************************************************************
         * NOS ÉTÉS
         * ************************************************************************* */
        -- TODO: Add Nos Étés event types

        ELSE NULL
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
