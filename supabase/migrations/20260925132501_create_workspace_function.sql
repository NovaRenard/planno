create or replace function public.create_workspace(
    workspace_name text
)
returns public.workspaces
language plpgsql
security definer
set search_path = ''
as $$
declare
    new_workspace public.workspaces;
    current_user_id uuid;
begin
    current_user_id := auth.uid();

    if current_user_id is null then
        raise exception 'Authentication required';
    end if;

    if workspace_name is null
       or length(trim(workspace_name)) = 0 then
        raise exception 'Workspace name is required';
    end if;

    insert into public.workspaces (
        name
    )
    values (
        trim(workspace_name)
    )
    returning * into new_workspace;

    insert into public.workspace_members (
        workspace_id,
        user_id,
        role
    )
    values (
        new_workspace.id,
        current_user_id,
        'owner'::public.workspace_role
    );

    return new_workspace;
end;
$$;

revoke execute
on function public.create_workspace(text)
from public;

revoke execute
on function public.create_workspace(text)
from anon;

grant execute
on function public.create_workspace(text)
to authenticated;