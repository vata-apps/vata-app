CREATE OR REPLACE FUNCTION get_tree_id(key text) RETURNS uuid AS $$
BEGIN
    RETURN CASE key
        WHEN 'harry_potter'    THEN '0000001-0000-0000-0000-000000000000'::uuid
        WHEN 'game_of_thrones' THEN '0000002-0000-0000-0000-000000000000'::uuid
        WHEN 'nos_etes'        THEN '0000003-0000-0000-0000-000000000000'::uuid

        ELSE NULL
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
