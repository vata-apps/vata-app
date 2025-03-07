CREATE OR REPLACE FUNCTION get_family_event_id(key text) RETURNS uuid AS $$
    BEGIN
        RETURN CASE key
            /* Generation 4 Marriages */
            WHEN 'fleamont_euphemia_marriage' THEN  '00000009-0004-0000-0001-000000000001'::uuid
            WHEN 'john_mary_marriage' THEN          '00000009-0004-0000-0002-000000000001'::uuid
            WHEN 'septimus_cedrella_marriage' THEN  '00000009-0004-0000-0003-000000000001'::uuid
            WHEN 'ignatius_lucretia_marriage' THEN  '00000009-0004-0000-0004-000000000001'::uuid

            /* Generation 3 Marriages */
            WHEN 'james_lily_marriage' THEN         '00000009-0003-0000-0001-000000000001'::uuid
            WHEN 'arthur_molly_marriage' THEN       '00000009-0003-0000-0002-000000000001'::uuid
            WHEN 'william_helen_union' THEN         '00000009-0003-0000-0003-000000000001'::uuid

            /* Generation 2 Marriages */
            WHEN 'harry_ginny_marriage' THEN        '00000009-0002-0000-0001-000000000001'::uuid
            WHEN 'ron_hermione_marriage' THEN       '00000009-0002-0000-0002-000000000001'::uuid
            
            ELSE NULL
        END;
    END;
$$ LANGUAGE plpgsql IMMUTABLE; 
