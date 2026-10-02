create table if not exists public.projects (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null
        references public.workspaces(id) on delete cascade,
    name text not null
        check (length(trim(name)) > 0),
    description text,
    created_by uuid not null
        references auth.users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint projects_id_workspace_id_unique
        unique (id, workspace_id)
);

create index if not exists projects_workspace_id_idx
    on public.projects(workspace_id);

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

create or replace function private.set_projects_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = pg_catalog.now();
    return new;
end;
$$;

revoke all on function private.set_projects_updated_at() from public;
grant execute on function private.set_projects_updated_at()
    to authenticated, service_role;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function private.set_projects_updated_at();


alter table public.tasks
    add column if not exists project_id uuid,
    add column if not exists position integer not null default 0
        check (position >= 0);

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conrelid = 'public.tasks'::regclass
          and conname = 'tasks_project_same_workspace_fk'
    ) then
        alter table public.tasks
            add constraint tasks_project_same_workspace_fk
            foreign key (project_id, workspace_id)
            references public.projects(id, workspace_id);
    end if;
end;
$$;

create index if not exists tasks_project_order_idx
    on public.tasks (
        workspace_id,
        project_id,
        position,
        created_at
    )
    where project_id is not null;


alter table public.projects enable row level security;

drop policy if exists "projects_select_workspace_member"
    on public.projects;
create policy "projects_select_workspace_member"
on public.projects
for select
to authenticated
using (
    private.get_workspace_role(
        workspace_id,
        (select auth.uid())
    ) is not null
);

drop policy if exists "projects_insert_workspace_member"
    on public.projects;
create policy "projects_insert_workspace_member"
on public.projects
for insert
to authenticated
with check (
    created_by = (select auth.uid())
    and private.get_workspace_role(
        workspace_id,
        (select auth.uid())
    ) in (
        'owner'::public.workspace_role,
        'editor'::public.workspace_role
    )
);

drop policy if exists "projects_update_workspace_member"
    on public.projects;
create policy "projects_update_workspace_member"
on public.projects
for update
to authenticated
using (
    private.get_workspace_role(
        workspace_id,
        (select auth.uid())
    ) in (
        'owner'::public.workspace_role,
        'editor'::public.workspace_role
    )
)
with check (
    private.get_workspace_role(
        workspace_id,
        (select auth.uid())
    ) in (
        'owner'::public.workspace_role,
        'editor'::public.workspace_role
    )
);

drop policy if exists "projects_delete_workspace_member"
    on public.projects;
create policy "projects_delete_workspace_member"
on public.projects
for delete
to authenticated
using (
    private.get_workspace_role(
        workspace_id,
        (select auth.uid())
    ) in (
        'owner'::public.workspace_role,
        'editor'::public.workspace_role
    )
);

grant select, insert, update, delete
on table public.projects
to authenticated;
