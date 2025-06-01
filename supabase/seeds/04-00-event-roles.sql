INSERT INTO event_roles (tree_id, id, name)
VALUES
    /* *************************************************************************
     * HARRY POTTER
     * ************************************************************************* */

    (get_tree_id('hp'), get_event_role_id('subject'), 'Subject'),
    (get_tree_id('hp'), get_event_role_id('husband'), 'Husband'),
    (get_tree_id('hp'), get_event_role_id('wife'), 'Wife'),
    (get_tree_id('hp'), get_event_role_id('deceased'), 'Deceased'),
    (get_tree_id('hp'), get_event_role_id('mother'), 'Mother'),
    (get_tree_id('hp'), get_event_role_id('father'), 'Father'),
    (get_tree_id('hp'), get_event_role_id('witness'), 'Witness'),
    (get_tree_id('hp'), get_event_role_id('godfather'), 'Godfather'),
    (get_tree_id('hp'), get_event_role_id('godmother'), 'Godmother'),
    (get_tree_id('hp'), get_event_role_id('officiant'), 'Officiant'),
    (get_tree_id('hp'), get_event_role_id('doctor'), 'Doctor'),
    (get_tree_id('hp'), get_event_role_id('father_of_husband'), 'Father of Husband'),
    (get_tree_id('hp'), get_event_role_id('mother_of_husband'), 'Mother of Husband'),
    (get_tree_id('hp'), get_event_role_id('father_of_wife'), 'Father of Wife'),
    (get_tree_id('hp'), get_event_role_id('mother_of_wife'), 'Mother of Wife'),
    (get_tree_id('hp'), get_event_role_id('other'), 'Other');

    /* *************************************************************************
     * GAME OF THRONES
     * ************************************************************************* */
    -- TODO: Add Game of Thrones event types

    /* *************************************************************************
     * NOS ÉTÉS
     * ************************************************************************* */
    -- TODO: Add Nos Étés event types 
