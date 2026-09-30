create type public.workspace_invite_status
as enum (
    'pending',
    'accepted',
    'revoked'
);

create table public.workspace_invites (
    id uuid primary key default gen_random_uuid(),

    workspace_id uuid not null
        references public.workspaces(id)
        on delete cascade,

    email text not null,

    role public.workspace_role
        not null
        default 'viewer',

    invited_by uuid not null
        references auth.users(id),

    status public.workspace_invite_status
        not null
        default 'pending',

    created_at timestamptz
        not null
        default now(),

    accepted_at timestamptz,

    constraint workspace_invites_email_not_empty
        check (length(trim(email)) > 0),

    constraint workspace_invites_role_not_owner
        check (
            role <> 'owner'::public.workspace_role
        )
);

create index workspace_invites_workspace_id_idx
    on public.workspace_invites(workspace_id);

create index workspace_invites_email_idx
    on public.workspace_invites(lower(email));

create unique index workspace_invites_unique_pending_idx
    on public.workspace_invites(
        workspace_id,
        lower(email)
    )
    where status = 'pending';

alter table public.workspace_invites
enable row level security;