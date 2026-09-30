-- =========================================================
-- STOP DIRECT MEMBER MUTATIONS FROM THE FRONTEND
-- =========================================================

drop policy if exists "workspace_members_insert_owner"
on public.workspace_members;

drop policy if exists "workspace_members_update_owner"
on public.workspace_members;

drop policy if exists "workspace_members_delete_owner"
on public.workspace_members;

revoke insert, update, delete
on public.workspace_members
from authenticated;

revoke insert, update, delete
on public.workspace_members
from anon;

grant select
on public.workspace_members
to authenticated;


-- =========================================================
-- UPDATE MEMBER ROLE
-- =========================================================

create or replace function public.update_workspace_member_role(
    target_workspace_id uuid,
    target_user_id uuid,
    new_role public.workspace_role
)
returns public.workspace_members
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_user_id uuid;
    target_member public.workspace_members;
    updated_member public.workspace_members;
begin
    current_user_id := auth.uid();

    if current_user_id is null then
        raise exception 'Authentication required';
    end if;

    if private.get_workspace_role(
        target_workspace_id,
        current_user_id
    ) <> 'owner'::public.workspace_role then
        raise exception 'Only workspace owners can change member roles';
    end if;

    if target_user_id = current_user_id then
        raise exception 'Owner cannot change their own role';
    end if;

    if new_role not in (
        'editor'::public.workspace_role,
        'viewer'::public.workspace_role
    ) then
        raise exception 'Role must be editor or viewer';
    end if;

    select wm.*
    into target_member
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = target_user_id;

    if not found then
        raise exception 'Workspace member not found';
    end if;

    if target_member.role = 'owner'::public.workspace_role then
        raise exception 'Owner role cannot be changed here';
    end if;

    update public.workspace_members
    set role = new_role
    where workspace_id = target_workspace_id
      and user_id = target_user_id
    returning * into updated_member;

    return updated_member;
end;
$$;

revoke execute
on function public.update_workspace_member_role(
    uuid,
    uuid,
    public.workspace_role
)
from public;

revoke execute
on function public.update_workspace_member_role(
    uuid,
    uuid,
    public.workspace_role
)
from anon;

grant execute
on function public.update_workspace_member_role(
    uuid,
    uuid,
    public.workspace_role
)
to authenticated;


-- =========================================================
-- REMOVE MEMBER
-- =========================================================

create or replace function public.remove_workspace_member(
    target_workspace_id uuid,
    target_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_user_id uuid;
    target_member public.workspace_members;
begin
    current_user_id := auth.uid();

    if current_user_id is null then
        raise exception 'Authentication required';
    end if;

    if private.get_workspace_role(
        target_workspace_id,
        current_user_id
    ) <> 'owner'::public.workspace_role then
        raise exception 'Only workspace owners can remove members';
    end if;

    if target_user_id = current_user_id then
        raise exception 'Owner cannot remove themselves';
    end if;

    select wm.*
    into target_member
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = target_user_id;

    if not found then
        raise exception 'Workspace member not found';
    end if;

    if target_member.role = 'owner'::public.workspace_role then
        raise exception 'Owner cannot be removed here';
    end if;

    delete from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = target_user_id;
end;
$$;

revoke execute
on function public.remove_workspace_member(
    uuid,
    uuid
)
from public;

revoke execute
on function public.remove_workspace_member(
    uuid,
    uuid
)
from anon;

grant execute
on function public.remove_workspace_member(
    uuid,
    uuid
)
to authenticated;