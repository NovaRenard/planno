import { supabase } from '../../lib/supabase/client'

import type {
  WorkspaceMember,
  WorkspaceRole,
} from './workspaceMemberService'

export type WorkspaceInviteStatus =
  | 'pending'
  | 'accepted'
  | 'revoked'

export type WorkspaceInvite = {
  id: string
  workspace_id: string
  email: string
  role: WorkspaceRole
  invited_by: string
  status: WorkspaceInviteStatus
  created_at: string
  accepted_at: string | null
}

export type IncomingWorkspaceInvite = {
  id: string
  workspace_id: string
  workspace_name: string
  email: string
  role: WorkspaceRole
  invited_by: string
  status: WorkspaceInviteStatus
  created_at: string
  accepted_at: string | null
}

export async function inviteWorkspaceMember(
  workspaceId: string,
  email: string,
  role: Exclude<WorkspaceRole, 'owner'>,
): Promise<WorkspaceInvite> {
  const { data, error } = await supabase.rpc(
    'invite_workspace_member',
    {
      target_workspace_id: workspaceId,
      invite_email: email,
      invite_role: role,
    },
  )

  if (error) {
    throw error
  }

  return data as WorkspaceInvite
}

export async function getMyWorkspaceInvites():
Promise<IncomingWorkspaceInvite[]> {
  const { data, error } = await supabase.rpc(
    'get_my_workspace_invites',
  )

  if (error) {
    throw error
  }

  return (data ?? []) as IncomingWorkspaceInvite[]
}

export async function acceptWorkspaceInvite(
  inviteId: string,
): Promise<WorkspaceMember> {
  const { data, error } = await supabase.rpc(
    'accept_workspace_invite',
    {
      invite_id: inviteId,
    },
  )

  if (error) {
    throw error
  }

  return data as WorkspaceMember
}