create table public.tasks (
    id uuid primary key default gen_random_uuid(),
    title text not null check (length(trim(title)) > 0),
    description text,
    status text not null default 'todo'
        check (status in ('todo', 'in_progress', 'done')),
    priority text not null default 'medium'
        check (priority in ('low', 'medium', 'high')),
    task_date date,
    due_at timestamptz,
    assigned_to text,
    created_by uuid not null references auth.users(id),
    workspace_id uuid not null
        references public.workspaces(id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    completed_at timestamptz,
    archived_at timestamptz
);

create table public.templates (
    id uuid primary key default gen_random_uuid(),
    title text not null check (length(trim(title)) > 0),
    description text,
    status text not null default 'todo'
        check (status in ('todo', 'in_progress', 'done')),
    priority text not null default 'medium'
        check (priority in ('low', 'medium', 'high')),
    created_by uuid not null references auth.users(id),
    workspace_id uuid not null
        references public.workspaces(id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index tasks_workspace_id_idx
    on public.tasks(workspace_id);
create index tasks_workspace_task_date_idx
    on public.tasks(workspace_id, task_date);
create index tasks_workspace_archived_idx
    on public.tasks(workspace_id, archived_at);
create index templates_workspace_id_idx
    on public.templates(workspace_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create trigger templates_set_updated_at
before update on public.templates
for each row execute function public.set_updated_at();

alter table public.tasks enable row level security;
alter table public.templates enable row level security;

create policy "tasks_select_workspace_member"
on public.tasks
for select
to authenticated
using (
    private.get_workspace_role(
        workspace_id,
        (select auth.uid())
    ) is not null
);

create policy "tasks_insert_workspace_member"
on public.tasks
for insert
to authenticated
with check (
    created_by = (select auth.uid())
    and private.get_workspace_role(
        workspace_id,
        (select auth.uid())
    ) is not null
);

create policy "tasks_update_workspace_member"
on public.tasks
for update
to authenticated
using (
    private.get_workspace_role(
        workspace_id,
        (select auth.uid())
    ) is not null
)
with check (
    private.get_workspace_role(
        workspace_id,
        (select auth.uid())
    ) is not null
);

create policy "tasks_delete_workspace_member"
on public.tasks
for delete
to authenticated
using (
    private.get_workspace_role(
        workspace_id,
        (select auth.uid())
    ) is not null
);

create policy "templates_select_workspace_member"
on public.templates
for select
to authenticated
using (
    private.get_workspace_role(
        workspace_id,
        (select auth.uid())
    ) is not null
);

create policy "templates_insert_workspace_member"
on public.templates
for insert
to authenticated
with check (
    created_by = (select auth.uid())
    and private.get_workspace_role(
        workspace_id,
        (select auth.uid())
    ) is not null
);

create policy "templates_update_workspace_member"
on public.templates
for update
to authenticated
using (
    private.get_workspace_role(
        workspace_id,
        (select auth.uid())
    ) is not null
)
with check (
    private.get_workspace_role(
        workspace_id,
        (select auth.uid())
    ) is not null
);

create policy "templates_delete_workspace_member"
on public.templates
for delete
to authenticated
using (
    private.get_workspace_role(
        workspace_id,
        (select auth.uid())
    ) is not null
);

grant select, insert, update, delete
on table public.tasks, public.templates
to authenticated;
