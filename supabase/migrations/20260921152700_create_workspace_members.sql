create type public.workspace_role as enum ('owner', 'editor', 'viewer');

create table public.workspace_members (
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role public.workspace_role not null default 'viewer',
    created_at timestamptz not null default now(),

    primary key (workspace_id, user_id)
);

create index workspace_members_user_id_idx
    on public.workspace_members(user_id);

alter table public.workspace_members enable row level security;