create or replace function public.get_my_workspace_invites()
returns table (
    id uuid,
    workspace_id uuid,
    workspace_name text,
    email text,
    role public.workspace_role,
    status public.workspace_invite_status,
    invited_by uuid,
    created_at timestamptz,
    accepted_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_user_id uuid;
    current_user_email text;
begin
    current_user_id := auth.uid();

    if current_user_id is null then
        raise exception 'Authentication required';
    end if;

    select lower(u.email)
    into current_user_email
    from auth.users u
    where u.id = current_user_id;

    if current_user_email is null then
        raise exception 'Current user has no email';
    end if;

    return query
    select
        wi.id,
        wi.workspace_id,
        w.name,
        wi.email,
        wi.role,
        wi.status,
        wi.invited_by,
        wi.created_at,
        wi.accepted_at
    from public.workspace_invites wi
    join public.workspaces w
      on w.id = wi.workspace_id
    where lower(wi.email) = current_user_email
      and wi.status = 'pending'::public.workspace_invite_status
    order by wi.created_at desc;
end;
$$;

revoke execute
on function public.get_my_workspace_invites()
from public;

revoke execute
on function public.get_my_workspace_invites()
from anon;

grant execute
on function public.get_my_workspace_invites()
to authenticated;