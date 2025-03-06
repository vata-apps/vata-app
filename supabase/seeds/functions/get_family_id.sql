CREATE OR REPLACE FUNCTION get_family_id(key text) RETURNS uuid AS $$
    BEGIN
        RETURN CASE key
            /* Generation 5 - Unknown parent families */
            WHEN 'unknown_fleamont' THEN   '00000003-0005-0000-0001-000000000001'::uuid
            WHEN 'unknown_euphemia' THEN   '00000003-0005-0000-0002-000000000001'::uuid
            WHEN 'unknown_john' THEN       '00000003-0005-0000-0003-000000000001'::uuid
            WHEN 'unknown_mary' THEN       '00000003-0005-0000-0004-000000000001'::uuid
            WHEN 'unknown_septimus' THEN   '00000003-0005-0000-0005-000000000001'::uuid
            WHEN 'unknown_cedrella' THEN   '00000003-0005-0000-0006-000000000001'::uuid
            WHEN 'unknown_ignatius' THEN   '00000003-0005-0000-0007-000000000001'::uuid
            WHEN 'unknown_lucretia' THEN   '00000003-0005-0000-0008-000000000001'::uuid

            /* Generation 4 */
            WHEN 'fleamont_euphemia' THEN  '00000003-0004-0000-0001-000000000001'::uuid
            WHEN 'john_mary' THEN          '00000003-0004-0000-0002-000000000001'::uuid
            WHEN 'septimus_cedrella' THEN  '00000003-0004-0000-0003-000000000001'::uuid
            WHEN 'ignatius_lucretia' THEN  '00000003-0004-0000-0004-000000000001'::uuid

            /* Generation 3 */
            WHEN 'james_lily' THEN         '00000003-0003-0000-0001-000000000001'::uuid
            WHEN 'arthur_molly' THEN       '00000003-0003-0000-0002-000000000001'::uuid
            WHEN 'william_helen' THEN      '00000003-0003-0000-0003-000000000001'::uuid

            /* Generation 2 */
            WHEN 'harry_ginny' THEN        '00000003-0002-0000-0001-000000000001'::uuid
            WHEN 'ron_hermione' THEN       '00000003-0002-0000-0002-000000000001'::uuid

            ELSE NULL
        END;
    END;
$$ LANGUAGE plpgsql IMMUTABLE; 
