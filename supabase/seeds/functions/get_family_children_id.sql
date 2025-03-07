CREATE OR REPLACE FUNCTION get_family_children_id(key text) RETURNS uuid AS $$
    BEGIN
        RETURN CASE key
            /* Generation 4 with unknown parents */
            WHEN 'unknown_fleamont' THEN      '00000007-0005-0000-0001-000000000001'::uuid
            WHEN 'unknown_euphemia' THEN      '00000007-0005-0000-0002-000000000001'::uuid
            WHEN 'unknown_john' THEN          '00000007-0005-0000-0003-000000000001'::uuid
            WHEN 'unknown_mary' THEN          '00000007-0005-0000-0004-000000000001'::uuid
            WHEN 'unknown_septimus' THEN      '00000007-0005-0000-0005-000000000001'::uuid
            WHEN 'unknown_cedrella' THEN      '00000007-0005-0000-0006-000000000001'::uuid
            WHEN 'unknown_ignatius' THEN      '00000007-0005-0000-0007-000000000001'::uuid
            WHEN 'unknown_lucretia' THEN      '00000007-0005-0000-0008-000000000001'::uuid
            
            /* Generation 3 - Children of Generation 4 */
            WHEN 'fleamont_euphemia_james' THEN  '00000007-0004-0000-0001-000000000001'::uuid
            WHEN 'john_mary_lily' THEN           '00000007-0004-0000-0002-000000000001'::uuid
            WHEN 'septimus_cedrella_arthur' THEN '00000007-0004-0000-0003-000000000001'::uuid
            WHEN 'ignatius_lucretia_molly' THEN  '00000007-0004-0000-0004-000000000001'::uuid

            /* Generation 2 - Children of Generation 3 */
            WHEN 'james_lily_harry' THEN         '00000007-0003-0000-0001-000000000001'::uuid
            WHEN 'arthur_molly_bill' THEN        '00000007-0003-0000-0002-000000000001'::uuid
            WHEN 'arthur_molly_charlie' THEN     '00000007-0003-0000-0002-000000000002'::uuid
            WHEN 'arthur_molly_percy' THEN       '00000007-0003-0000-0002-000000000003'::uuid
            WHEN 'arthur_molly_fred' THEN        '00000007-0003-0000-0002-000000000004'::uuid
            WHEN 'arthur_molly_george' THEN      '00000007-0003-0000-0002-000000000005'::uuid
            WHEN 'arthur_molly_ron' THEN         '00000007-0003-0000-0002-000000000006'::uuid
            WHEN 'arthur_molly_ginny' THEN       '00000007-0003-0000-0002-000000000007'::uuid
            WHEN 'william_helen_hermione' THEN   '00000007-0003-0000-0003-000000000001'::uuid

            /* Generation 1 - Children of Generation 2 */
            WHEN 'harry_ginny_james' THEN        '00000007-0002-0000-0001-000000000001'::uuid
            WHEN 'harry_ginny_albus' THEN        '00000007-0002-0000-0001-000000000002'::uuid
            WHEN 'harry_ginny_lily' THEN         '00000007-0002-0000-0001-000000000003'::uuid
            WHEN 'ron_hermione_rose' THEN        '00000007-0002-0000-0002-000000000001'::uuid
            WHEN 'ron_hermione_hugo' THEN        '00000007-0002-0000-0002-000000000002'::uuid

            ELSE NULL
        END;
    END;
$$ LANGUAGE plpgsql IMMUTABLE;
