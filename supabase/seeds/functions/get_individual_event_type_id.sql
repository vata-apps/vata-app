CREATE OR REPLACE FUNCTION get_individual_event_type_id(key text) RETURNS uuid AS $$
    BEGIN
        RETURN CASE key
            WHEN 'birth' THEN          '00000005-0000-0000-0000-000000000001'::uuid
            WHEN 'death' THEN          '00000005-0000-0000-0000-000000000002'::uuid
            WHEN 'baptism' THEN        '00000005-0000-0000-0000-000000000003'::uuid
            WHEN 'burial' THEN         '00000005-0000-0000-0000-000000000004'::uuid
            WHEN 'graduation' THEN     '00000005-0000-0000-0000-000000000005'::uuid
            WHEN 'retirement' THEN     '00000005-0000-0000-0000-000000000006'::uuid
            WHEN 'immigration' THEN    '00000005-0000-0000-0000-000000000007'::uuid
            WHEN 'emigration' THEN     '00000005-0000-0000-0000-000000000008'::uuid
            WHEN 'naturalization' THEN '00000005-0000-0000-0000-000000000009'::uuid
            WHEN 'census' THEN         '00000005-0000-0000-0000-000000000010'::uuid
            WHEN 'will' THEN           '00000005-0000-0000-0000-000000000011'::uuid
            WHEN 'probate' THEN        '00000005-0000-0000-0000-000000000012'::uuid
            WHEN 'other' THEN          '00000005-0000-0000-0000-000000000013'::uuid
            
            ELSE NULL
        END;
    END;
$$ LANGUAGE plpgsql IMMUTABLE; 
