set check_function_bodies = off;

create policy "Enable read access for all users"
on "public"."family_children"
as permissive
for select
to public
using (true);



