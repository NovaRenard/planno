-- =========================================================
-- MARK PERSONAL VS SHARED WORKSPACES
-- =========================================================

alter table public.workspaces
add column if not exists is_personal boolean
not null
default false;


-- Backfill existing Personal Workspaces.
-- In our current development data, automatically created
-- Personal Workspaces have this name and only the owner.

update public.workspaces w
set is_personal = true
where w.name = 'Personal Workspace'
  and exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = w.id
        and wm.role = 'owner'::public.workspace_role
  )
  and not exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = w.id
        and wm.role <> 'owner'::public.workspace_role
  );


-- =========================================================
-- UPDATE NEW USER TRIGGER
-- Personal Workspace must always be marked is_personal = true
-- =========================================================

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
        name,
        is_personal
    )
    values (
        'Personal Workspace',
        true
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


-- =========================================================
-- UPDATE SHARED WORKSPACE CREATION
-- Shared workspaces must always be is_personal = false
-- =========================================================

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
        name,
        is_personal
    )
    values (
        trim(workspace_name),
        false
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


-- =========================================================
-- NO DIRECT WORKSPACE DELETE FROM FRONTEND
-- =========================================================

revoke delete
on public.workspaces
from authenticated;

revoke delete
on public.workspaces
from anon;


-- =========================================================
-- SAFE DELETE SHARED WORKSPACE
-- =========================================================

create or replace function public.delete_workspace(
    target_workspace_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_user_id uuid;
    workspace_is_personal boolean;
begin
    current_user_id := auth.uid();

    if current_user_id is null then
        raise exception 'Authentication required';
    end if;

    if private.get_workspace_role(
        target_workspace_id,
        current_user_id
    ) <> 'owner'::public.workspace_role then
        raise exception 'Only workspace owners can delete a workspace';
    end if;

    select w.is_personal
    into workspace_is_personal
    from public.workspaces w
    where w.id = target_workspace_id;

    if not found then
        raise exception 'Workspace not found';
    end if;

    if workspace_is_personal then
        raise exception 'Personal Workspace cannot be deleted';
    end if;

    delete from public.workspaces
    where id = target_workspace_id;
end;
$$;

revoke execute
on function public.delete_workspace(uuid)
from public;

revoke execute
on function public.delete_workspace(uuid)
from anon;

grant execute
on function public.delete_workspace(uuid)
to authenticated;