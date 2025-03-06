set check_function_bodies = off;

create policy "Enable read access for all users"
on "public"."family_children"
as permissive
for select
to public
using (true);

-- Add a trigger to ensure every individual has a family as a child
CREATE OR REPLACE FUNCTION ensure_individual_has_family_as_child()
RETURNS TRIGGER AS $$
BEGIN
  -- If the individual doesn't have a family as a child, create one with unknown parents
  IF NOT EXISTS (
    SELECT 1 FROM family_children 
    WHERE individual_id = NEW.id
  ) THEN
    -- Create a new family with unknown parents
    WITH new_family AS (
      INSERT INTO families (husband_id, wife_id)
      VALUES (NULL, NULL)
      RETURNING id
    )
    -- Add the individual as a child to this family
    INSERT INTO family_children (family_id, individual_id)
    SELECT id, NEW.id FROM new_family;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that runs after an individual is inserted
CREATE TRIGGER ensure_individual_has_family_trigger
AFTER INSERT ON individuals
FOR EACH ROW
EXECUTE FUNCTION ensure_individual_has_family_as_child();



