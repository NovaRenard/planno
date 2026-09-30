-- =========================================================
-- INVITE A USER TO A WORKSPACE
-- =========================================================

create or replace function public.invite_workspace_member(
    target_workspace_id uuid,
    invite_email text,
    invite_role public.workspace_role
)
returns public.workspace_invites
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_user_id uuid;
    normalized_email text;
    new_invite public.workspace_invites;
begin
    current_user_id := auth.uid();

    if current_user_id is null then
        raise exception 'Authentication required';
    end if;

    if private.get_workspace_role(
        target_workspace_id,
        current_user_id
    ) <> 'owner'::public.workspace_role then
        raise exception 'Only workspace owners can invite members';
    end if;

    normalized_email := lower(trim(invite_email));

    if normalized_email is null
       or length(normalized_email) = 0 then
        raise exception 'Email is required';
    end if;

    if invite_role not in (
        'editor'::public.workspace_role,
        'viewer'::public.workspace_role
    ) then
        raise exception 'Invite role must be editor or viewer';
    end if;

    if exists (
        select 1
        from public.workspace_members wm
        join auth.users u
          on u.id = wm.user_id
        where wm.workspace_id = target_workspace_id
          and lower(u.email) = normalized_email
    ) then
        raise exception 'User is already a workspace member';
    end if;

    if exists (
        select 1
        from public.workspace_invites wi
        where wi.workspace_id = target_workspace_id
          and lower(wi.email) = normalized_email
          and wi.status = 'pending'
    ) then
        raise exception 'A pending invitation already exists';
    end if;

    insert into public.workspace_invites (
        workspace_id,
        email,
        role,
        invited_by
    )
    values (
        target_workspace_id,
        normalized_email,
        invite_role,
        current_user_id
    )
    returning * into new_invite;

    return new_invite;
end;
$$;

revoke execute
on function public.invite_workspace_member(
    uuid,
    text,
    public.workspace_role
)
from public;

revoke execute
on function public.invite_workspace_member(
    uuid,
    text,
    public.workspace_role
)
from anon;

grant execute
on function public.invite_workspace_member(
    uuid,
    text,
    public.workspace_role
)
to authenticated;


-- =========================================================
-- ACCEPT A WORKSPACE INVITATION
-- =========================================================

create or replace function public.accept_workspace_invite(
    invite_id uuid
)
returns public.workspace_members
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_user_id uuid;
    current_user_email text;
    target_invite public.workspace_invites;
    new_member public.workspace_members;
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

    select wi.*
    into target_invite
    from public.workspace_invites wi
    where wi.id = invite_id
      and wi.status = 'pending'
      and lower(wi.email) = current_user_email
    for update;

    if not found then
        raise exception 'Invitation not found';
    end if;

    select wm.*
    into new_member
    from public.workspace_members wm
    where wm.workspace_id = target_invite.workspace_id
      and wm.user_id = current_user_id;

    if not found then
        insert into public.workspace_members (
            workspace_id,
            user_id,
            role
        )
        values (
            target_invite.workspace_id,
            current_user_id,
            target_invite.role
        )
        returning * into new_member;
    end if;

    update public.workspace_invites
    set
        status = 'accepted',
        accepted_at = now()
    where id = target_invite.id;

    return new_member;
end;
$$;

revoke execute
on function public.accept_workspace_invite(uuid)
from public;

revoke execute
on function public.accept_workspace_invite(uuid)
from anon;

grant execute
on function public.accept_workspace_invite(uuid)
to authenticated;