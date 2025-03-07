CREATE OR REPLACE FUNCTION get_place_id(key text) RETURNS uuid AS $$
    BEGIN
        RETURN CASE key
            /* Countries */
            WHEN 'united_kingdom' THEN       '00000008-0000-0000-0001-000000000001'::uuid
            
            /* States/Regions */
            WHEN 'england' THEN              '00000008-0000-0000-0002-000000000001'::uuid
            WHEN 'scotland' THEN             '00000008-0000-0000-0002-000000000002'::uuid
            WHEN 'west_country' THEN         '00000008-0000-0000-0002-000000000003'::uuid
            WHEN 'devon' THEN                '00000008-0000-0000-0002-000000000004'::uuid
            
            /* Cities/Towns/Villages */
            WHEN 'london' THEN               '00000008-0000-0000-0003-000000000001'::uuid
            WHEN 'godrics_hollow' THEN       '00000008-0000-0000-0003-000000000002'::uuid
            WHEN 'hogsmeade' THEN            '00000008-0000-0000-0003-000000000003'::uuid
            WHEN 'ottery_st_catchpole' THEN  '00000008-0000-0000-0003-000000000004'::uuid
            
            /* Specific Locations */
            WHEN 'hogwarts' THEN             '00000008-0000-0000-0004-000000000001'::uuid
            WHEN 'diagon_alley' THEN         '00000008-0000-0000-0004-000000000002'::uuid
            WHEN 'the_burrow' THEN           '00000008-0000-0000-0004-000000000003'::uuid
            WHEN 'grimmauld_place' THEN      '00000008-0000-0000-0004-000000000004'::uuid
            WHEN 'ministry_of_magic' THEN    '00000008-0000-0000-0004-000000000005'::uuid
            WHEN 'st_mungos' THEN            '00000008-0000-0000-0004-000000000006'::uuid
            
            ELSE NULL
        END;
    END;
$$ LANGUAGE plpgsql IMMUTABLE; 
