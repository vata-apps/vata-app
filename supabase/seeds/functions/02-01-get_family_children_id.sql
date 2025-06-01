CREATE OR REPLACE FUNCTION get_family_children_id(key text) RETURNS uuid AS $$
BEGIN
    RETURN CASE key
        /* *************************************************************************
         * HARRY POTTER
         * ************************************************************************* */
        
        -- Generation 4 with unknown parents
        WHEN 'father_mother_fleamont'    THEN '00000001-0002-0001-0004-000000000001'::uuid
        WHEN 'father_mother_euphemia'    THEN '00000001-0002-0001-0004-000000000002'::uuid
        WHEN 'father_mother_john'        THEN '00000001-0002-0001-0004-000000000003'::uuid
        WHEN 'father_mother_mary'        THEN '00000001-0002-0001-0004-000000000004'::uuid
        WHEN 'father_mother_septimus'    THEN '00000001-0002-0001-0004-000000000005'::uuid
        WHEN 'father_mother_cedrella'    THEN '00000001-0002-0001-0004-000000000006'::uuid
        WHEN 'father_mother_ignatius'    THEN '00000001-0002-0001-0004-000000000007'::uuid
        WHEN 'father_mother_lucretia'    THEN '00000001-0002-0001-0004-000000000008'::uuid
        
        -- Generation 3 - Children of Generation 4
        WHEN 'fleamont_euphemia_james'   THEN '00000001-0002-0001-0003-000000000001'::uuid
        WHEN 'john_mary_lily'            THEN '00000001-0002-0001-0003-000000000002'::uuid
        WHEN 'septimus_cedrella_arthur'  THEN '00000001-0002-0001-0003-000000000003'::uuid
        WHEN 'ignatius_lucretia_molly'   THEN '00000001-0002-0001-0003-000000000004'::uuid

        -- Generation 2 - Children of Generation 3
        WHEN 'james_lily_harry'          THEN '00000001-0002-0001-0002-000000000001'::uuid
        WHEN 'arthur_molly_bill'         THEN '00000001-0002-0001-0002-000000000002'::uuid
        WHEN 'arthur_molly_charlie'      THEN '00000001-0002-0001-0002-000000000003'::uuid
        WHEN 'arthur_molly_percy'        THEN '00000001-0002-0001-0002-000000000004'::uuid
        WHEN 'arthur_molly_fred'         THEN '00000001-0002-0001-0002-000000000005'::uuid
        WHEN 'arthur_molly_george'       THEN '00000001-0002-0001-0002-000000000006'::uuid
        WHEN 'arthur_molly_ron'          THEN '00000001-0002-0001-0002-000000000007'::uuid
        WHEN 'arthur_molly_ginny'        THEN '00000001-0002-0001-0002-000000000008'::uuid
        WHEN 'father_mother_hermione'    THEN '00000001-0002-0001-0002-000000000009'::uuid
        WHEN 'father_apoline_fleur'      THEN '00000001-0002-0001-0002-000000000010'::uuid
        WHEN 'father_mother_audrey'      THEN '00000001-0002-0001-0002-000000000011'::uuid
        WHEN 'father_mother_angelina'    THEN '00000001-0002-0001-0002-000000000012'::uuid

        -- Generation 1 - Children of Generation 2
        WHEN 'harry_ginny_james'         THEN '00000001-0002-0001-0001-000000000001'::uuid
        WHEN 'harry_ginny_albus'         THEN '00000001-0002-0001-0001-000000000003'::uuid
        WHEN 'harry_ginny_lily'          THEN '00000001-0002-0001-0001-000000000004'::uuid
        WHEN 'ron_hermione_rose'         THEN '00000001-0002-0001-0001-000000000005'::uuid
        WHEN 'ron_hermione_hugo'         THEN '00000001-0002-0001-0001-000000000006'::uuid
        WHEN 'bill_fleur_victoire'       THEN '00000001-0002-0001-0001-000000000007'::uuid
        WHEN 'bill_fleur_louis'          THEN '00000001-0002-0001-0001-000000000008'::uuid
        WHEN 'bill_fleur_dominique'      THEN '00000001-0002-0001-0001-000000000009'::uuid
        WHEN 'percy_audrey_molly_ii'     THEN '00000001-0002-0001-0001-000000000010'::uuid
        WHEN 'percy_audrey_lucy'         THEN '00000001-0002-0001-0001-000000000011'::uuid
        WHEN 'george_angelina_fred_ii'   THEN '00000001-0002-0001-0001-000000000012'::uuid
        WHEN 'george_angelina_roxanne'   THEN '00000001-0002-0001-0001-000000000013'::uuid
        
        /* *************************************************************************
         * GAME OF THRONES
         * ************************************************************************* */
        -- TODO: Add Game of Thrones families

        /* *************************************************************************
         * NOS ÉTÉS
         * ************************************************************************* */
        -- TODO: Add Nos Étés families

        ELSE NULL
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
