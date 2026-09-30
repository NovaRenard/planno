create table public.user_preferences (
    user_id uuid primary key
        references auth.users(id)
        on delete cascade,

    current_workspace_id uuid
        references public.workspaces(id)
        on delete set null,

    updated_at timestamptz
        not null
        default now()
);

alter table public.user_preferences
enable row level security;


-- =========================================================
-- GRANTS
-- =========================================================

grant select, insert, update
on public.user_preferences
to authenticated;


-- =========================================================
-- SELECT OWN PREFERENCES
-- =========================================================

create policy "user_preferences_select_own"
on public.user_preferences
for select
to authenticated
using (
    user_id = (select auth.uid())
);


-- =========================================================
-- INSERT OWN PREFERENCES
-- =========================================================

create policy "user_preferences_insert_own"
on public.user_preferences
for insert
to authenticated
with check (
    user_id = (select auth.uid())
    and (
        current_workspace_id is null
        or private.get_workspace_role(
            current_workspace_id,
            (select auth.uid())
        ) is not null
    )
);


-- =========================================================
-- UPDATE OWN PREFERENCES
-- =========================================================

create policy "user_preferences_update_own"
on public.user_preferences
for update
to authenticated
using (
    user_id = (select auth.uid())
)
with check (
    user_id = (select auth.uid())
    and (
        current_workspace_id is null
        or private.get_workspace_role(
            current_workspace_id,
            (select auth.uid())
        ) is not null
    )
);