CREATE OR REPLACE FUNCTION get_family_event_type_id(key text) RETURNS uuid AS $$
    BEGIN
        RETURN CASE key
            WHEN 'marriage' THEN     '00000004-0000-0000-0000-000000000001'::uuid
            WHEN 'divorce' THEN      '00000004-0000-0000-0000-000000000002'::uuid
            WHEN 'engagement' THEN   '00000004-0000-0000-0000-000000000003'::uuid
            WHEN 'annulment' THEN    '00000004-0000-0000-0000-000000000004'::uuid
            WHEN 'separation' THEN   '00000004-0000-0000-0000-000000000005'::uuid
            WHEN 'civil union' THEN  '00000004-0000-0000-0000-000000000006'::uuid
            WHEN 'other' THEN        '00000004-0000-0000-0000-000000000007'::uuid
            
            ELSE NULL
        END;
    END;
$$ LANGUAGE plpgsql IMMUTABLE; 
