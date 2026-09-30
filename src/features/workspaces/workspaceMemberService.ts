import { supabase } from '../../lib/supabase/client'

export type WorkspaceRole =
  | 'owner'
  | 'editor'
  | 'viewer'

export type MemberProfile = {
  id: string
  full_name: string | null
  avatar_url: string | null
}

export type WorkspaceMember = {
  workspace_id: string
  user_id: string
  role: WorkspaceRole
  created_at: string
  profile: MemberProfile | null
}

export type WorkspaceMemberRecord = {
  workspace_id: string
  user_id: string
  role: WorkspaceRole
  created_at: string
}

export async function getWorkspaceMembers(
  workspaceId: string,
): Promise<WorkspaceMember[]> {
  const { data: members, error: membersError } =
    await supabase
      .from('workspace_members')
      .select(
        'workspace_id, user_id, role, created_at',
      )
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true })

  if (membersError) {
    throw membersError
  }

  if (!members || members.length === 0) {
    return []
  }

  const userIds = members.map(
    (member) => member.user_id,
  )

  const { data: profiles, error: profilesError } =
    await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds)

  if (profilesError) {
    throw profilesError
  }

  return members.map((member) => {
    const profile =
      profiles?.find(
        (item) => item.id === member.user_id,
      ) ?? null

    return {
      ...member,
      profile,
    } as WorkspaceMember
  })
}

export async function updateWorkspaceMemberRole(
  workspaceId: string,
  userId: string,
  role: Exclude<WorkspaceRole, 'owner'>,
): Promise<WorkspaceMemberRecord> {
  const { data, error } = await supabase.rpc(
    'update_workspace_member_role',
    {
      target_workspace_id: workspaceId,
      target_user_id: userId,
      new_role: role,
    },
  )

  if (error) {
    throw error
  }

  return data as WorkspaceMemberRecord
}

export async function removeWorkspaceMember(
  workspaceId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase.rpc(
    'remove_workspace_member',
    {
      target_workspace_id: workspaceId,
      target_user_id: userId,
    },
  )

  if (error) {
    throw error
  }
}