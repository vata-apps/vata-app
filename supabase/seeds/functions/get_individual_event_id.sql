CREATE OR REPLACE FUNCTION get_individual_event_id(key text) RETURNS uuid AS $$
    BEGIN
        RETURN CASE key
            /* Generation 4 - Birth and Death Events */
            WHEN 'fleamont_potter_birth' THEN     '00000010-0004-0000-0001-000000000001'::uuid
            WHEN 'fleamont_potter_death' THEN     '00000010-0004-0000-0001-000000000002'::uuid
            WHEN 'euphemia_potter_birth' THEN     '00000010-0004-0000-0002-000000000001'::uuid
            WHEN 'euphemia_potter_death' THEN     '00000010-0004-0000-0002-000000000002'::uuid
            WHEN 'john_evans_birth' THEN          '00000010-0004-0000-0003-000000000001'::uuid
            WHEN 'john_evans_death' THEN          '00000010-0004-0000-0003-000000000002'::uuid
            WHEN 'mary_evans_birth' THEN          '00000010-0004-0000-0004-000000000001'::uuid
            WHEN 'mary_evans_death' THEN          '00000010-0004-0000-0004-000000000002'::uuid
            WHEN 'septimus_weasley_birth' THEN    '00000010-0004-0000-0005-000000000001'::uuid
            WHEN 'septimus_weasley_death' THEN    '00000010-0004-0000-0005-000000000002'::uuid
            WHEN 'cedrella_black_birth' THEN      '00000010-0004-0000-0006-000000000001'::uuid
            WHEN 'cedrella_black_death' THEN      '00000010-0004-0000-0006-000000000002'::uuid
            WHEN 'ignatius_prewett_birth' THEN    '00000010-0004-0000-0007-000000000001'::uuid
            WHEN 'ignatius_prewett_death' THEN    '00000010-0004-0000-0007-000000000002'::uuid
            WHEN 'lucretia_prewett_birth' THEN    '00000010-0004-0000-0008-000000000001'::uuid
            WHEN 'lucretia_prewett_death' THEN    '00000010-0004-0000-0008-000000000002'::uuid

            /* Generation 3 - Birth and Death Events */
            WHEN 'james_potter_birth' THEN        '00000010-0003-0000-0001-000000000001'::uuid
            WHEN 'james_potter_death' THEN        '00000010-0003-0000-0001-000000000002'::uuid
            WHEN 'lily_evans_birth' THEN          '00000010-0003-0000-0002-000000000001'::uuid
            WHEN 'lily_evans_death' THEN          '00000010-0003-0000-0002-000000000002'::uuid
            WHEN 'arthur_weasley_birth' THEN      '00000010-0003-0000-0003-000000000001'::uuid
            WHEN 'molly_prewett_birth' THEN       '00000010-0003-0000-0004-000000000001'::uuid
            WHEN 'william_granger_birth' THEN     '00000010-0003-0000-0005-000000000001'::uuid
            WHEN 'helen_granger_birth' THEN       '00000010-0003-0000-0006-000000000001'::uuid

            /* Generation 2 - Birth Events */
            WHEN 'bill_weasley_birth' THEN        '00000010-0002-0000-0001-000000000001'::uuid
            WHEN 'charlie_weasley_birth' THEN     '00000010-0002-0000-0002-000000000001'::uuid
            WHEN 'percy_weasley_birth' THEN       '00000010-0002-0000-0003-000000000001'::uuid
            WHEN 'fred_weasley_birth' THEN        '00000010-0002-0000-0004-000000000001'::uuid
            WHEN 'fred_weasley_death' THEN        '00000010-0002-0000-0004-000000000002'::uuid
            WHEN 'george_weasley_birth' THEN      '00000010-0002-0000-0005-000000000001'::uuid
            WHEN 'ron_weasley_birth' THEN         '00000010-0002-0000-0006-000000000001'::uuid
            WHEN 'ginny_weasley_birth' THEN       '00000010-0002-0000-0007-000000000001'::uuid
            WHEN 'harry_potter_birth' THEN        '00000010-0002-0000-0008-000000000001'::uuid
            WHEN 'hermione_granger_birth' THEN    '00000010-0002-0000-0009-000000000001'::uuid

            /* Generation 1 - Birth Events */
            WHEN 'james_sirius_potter_birth' THEN '00000010-0001-0000-0001-000000000001'::uuid
            WHEN 'albus_potter_birth' THEN        '00000010-0001-0000-0002-000000000001'::uuid
            WHEN 'lily_luna_potter_birth' THEN    '00000010-0001-0000-0003-000000000001'::uuid
            WHEN 'rose_weasley_birth' THEN        '00000010-0001-0000-0004-000000000001'::uuid
            WHEN 'hugo_weasley_birth' THEN        '00000010-0001-0000-0005-000000000001'::uuid
            
            ELSE NULL
        END;
    END;
$$ LANGUAGE plpgsql IMMUTABLE; 
