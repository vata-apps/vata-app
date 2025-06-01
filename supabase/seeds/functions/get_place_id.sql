CREATE OR REPLACE FUNCTION get_place_id(key text) RETURNS uuid AS $$
BEGIN
    RETURN CASE key
        /* *************************************************************************
         * HARRY POTTER
         * ************************************************************************* */

        -- Countries
        WHEN 'united_kingdom'        THEN '00000001-0003-0000-0001-000000000001'::uuid
        
        -- States
        WHEN 'england'               THEN '00000001-0003-0000-0002-000000000001'::uuid
        WHEN 'scotland'              THEN '00000001-0003-0000-0002-000000000002'::uuid
        WHEN 'west_country'          THEN '00000001-0003-0000-0002-000000000003'::uuid
        WHEN 'devon'                 THEN '00000001-0003-0000-0002-000000000004'::uuid
        
        -- Cities
        WHEN 'london'                THEN '00000001-0003-0000-0004-000000000001'::uuid
        
        -- Villages
        WHEN 'godrics_hollow'        THEN '00000001-0003-0000-0006-000000000001'::uuid
        WHEN 'hogsmeade'             THEN '00000001-0003-0000-0006-000000000002'::uuid
        WHEN 'ottery_st_catchpole'   THEN '00000001-0003-0000-0006-000000000003'::uuid
        
        -- Addresses
        WHEN 'diagon_alley'          THEN '00000001-0003-0000-0007-000000000001'::uuid
        WHEN 'the_burrow'            THEN '00000001-0003-0000-0007-000000000002'::uuid
        WHEN 'grimmauld_place'       THEN '00000001-0003-0000-0007-000000000003'::uuid

        -- Hospitals
        WHEN 'st_mungos'             THEN '00000001-0003-0000-0010-000000000001'::uuid
        
        -- Other
        WHEN 'hogwarts'              THEN '00000001-0003-0000-0011-000000000001'::uuid
        WHEN 'ministry_of_magic'     THEN '00000001-0003-0000-0011-000000000002'::uuid

        /* *************************************************************************
         * GAME OF THRONES
         * ************************************************************************* */
        -- TODO: Add Game of Thrones places

        /* *************************************************************************
         * NOS ÉTÉS
         * ************************************************************************* */
        -- TODO: Add Nos Étés places

        ELSE NULL
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE; 
