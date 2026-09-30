-- Private schema for RLS helper functions.
-- Keeping SECURITY DEFINER helpers outside the public schema
-- avoids exposing them through the Data API.

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;


-- =========================================================
-- HELPER: get a user's role in a workspace
-- =========================================================

create or replace function private.get_workspace_role(
    target_workspace_id uuid,
    target_user_id uuid
)
returns public.workspace_role
language sql
stable
security definer
set search_path = ''
as $$
    select wm.role
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = target_user_id
    limit 1;
$$;

revoke all on function private.get_workspace_role(uuid, uuid) from public;
grant execute on function private.get_workspace_role(uuid, uuid) to authenticated;


-- =========================================================
-- HELPER: check whether two users share a workspace
-- =========================================================

create or replace function private.users_share_workspace(
    first_user_id uuid,
    second_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.workspace_members first_member
        join public.workspace_members second_member
          on second_member.workspace_id = first_member.workspace_id
        where first_member.user_id = first_user_id
          and second_member.user_id = second_user_id
    );
$$;

revoke all on function private.users_share_workspace(uuid, uuid) from public;
grant execute on function private.users_share_workspace(uuid, uuid) to authenticated;


-- =========================================================
-- PROFILES
-- =========================================================

create policy "profiles_select_shared_workspace"
on public.profiles
for select
to authenticated
using (
    id = (select auth.uid())
    or private.users_share_workspace(
        id,
        (select auth.uid())
    )
);


create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (
    id = (select auth.uid())
)
with check (
    id = (select auth.uid())
);


-- =========================================================
-- WORKSPACES
-- =========================================================

create policy "workspaces_select_member"
on public.workspaces
for select
to authenticated
using (
    private.get_workspace_role(
        id,
        (select auth.uid())
    ) is not null
);


create policy "workspaces_update_owner"
on public.workspaces
for update
to authenticated
using (
    private.get_workspace_role(
        id,
        (select auth.uid())
    ) = 'owner'
)
with check (
    private.get_workspace_role(
        id,
        (select auth.uid())
    ) = 'owner'
);


-- =========================================================
-- WORKSPACE MEMBERS
-- =========================================================

create policy "workspace_members_select_member"
on public.workspace_members
for select
to authenticated
using (
    private.get_workspace_role(
        workspace_id,
        (select auth.uid())
    ) is not null
);


create policy "workspace_members_insert_owner"
on public.workspace_members
for insert
to authenticated
with check (
    private.get_workspace_role(
        workspace_id,
        (select auth.uid())
    ) = 'owner'
);


create policy "workspace_members_update_owner"
on public.workspace_members
for update
to authenticated
using (
    private.get_workspace_role(
        workspace_id,
        (select auth.uid())
    ) = 'owner'
    and user_id <> (select auth.uid())
)
with check (
    private.get_workspace_role(
        workspace_id,
        (select auth.uid())
    ) = 'owner'
);


create policy "workspace_members_delete_owner"
on public.workspace_members
for delete
to authenticated
using (
    private.get_workspace_role(
        workspace_id,
        (select auth.uid())
    ) = 'owner'
    and user_id <> (select auth.uid())
);