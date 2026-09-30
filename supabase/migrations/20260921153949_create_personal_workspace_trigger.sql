create or replace function public.handle_new_user()
returns trigger 
language plpgsql
security definer
set search_path = ''
as $$
declare
   new_workspace_id uuid;
begin
   insert into public.profiles (
    id,
    full_name,
    avatar_url
   )
   values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
   );

   insert into public.workspaces (
       name

   )
   values (
      'Personal Workspace'
   ) 
   returning id into new_workspace_id;

   insert into public.workspace_members (
    workspace_id,
    user_id,
    role

   )
   values (
    new_workspace_id,
    new.id,
    'owner'::public.workspace_role
   );
   
   return new;
end;  
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();