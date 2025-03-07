CREATE OR REPLACE FUNCTION get_place_type_id(key text) RETURNS uuid AS $$
    BEGIN
        RETURN CASE key
            WHEN 'country' THEN     '00000006-0000-0000-0000-000000000001'::uuid
            WHEN 'state' THEN       '00000006-0000-0000-0000-000000000002'::uuid
            WHEN 'province' THEN    '00000006-0000-0000-0000-000000000003'::uuid
            WHEN 'city' THEN        '00000006-0000-0000-0000-000000000004'::uuid
            WHEN 'town' THEN        '00000006-0000-0000-0000-000000000005'::uuid
            WHEN 'village' THEN     '00000006-0000-0000-0000-000000000006'::uuid
            WHEN 'address' THEN     '00000006-0000-0000-0000-000000000007'::uuid
            WHEN 'cemetery' THEN    '00000006-0000-0000-0000-000000000008'::uuid
            WHEN 'church' THEN      '00000006-0000-0000-0000-000000000009'::uuid
            WHEN 'hospital' THEN    '00000006-0000-0000-0000-000000000010'::uuid
            WHEN 'other' THEN       '00000006-0000-0000-0000-000000000011'::uuid
            
            ELSE NULL
        END;
    END;
$$ LANGUAGE plpgsql IMMUTABLE; 
