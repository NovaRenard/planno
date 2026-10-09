import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  acceptWorkspaceInvite,
  getMyWorkspaceInvites,
  inviteWorkspaceMember,
} from './workspaceInviteService'

import {
  getWorkspaceMembers,
  removeWorkspaceMember,
  updateWorkspaceMemberRole,
  type WorkspaceRole,
} from './workspaceMemberService'

type InviteMemberInput = {
  email: string
  role: Exclude<WorkspaceRole, 'owner'>
}

type UpdateMemberRoleInput = {
  userId: string
  role: Exclude<WorkspaceRole, 'owner'>
}

export function useWorkspaceMembers(
  workspaceId: string,
) {
  return useQuery({
    queryKey: [
      'workspace-members',
      workspaceId,
    ],
    queryFn: () =>
      getWorkspaceMembers(workspaceId),
    enabled: Boolean(workspaceId),
  })
}

export function useMyWorkspaceInvites() {
  return useQuery({
    queryKey: ['workspace-invites', 'mine'],
    queryFn: getMyWorkspaceInvites,
  })
}

export function useInviteWorkspaceMember(
  workspaceId: string,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      email,
      role,
    }: InviteMemberInput) =>
      inviteWorkspaceMember(
        workspaceId,
        email,
        role,
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          'workspace-members',
          workspaceId,
        ],
      })
    },
  })
}

export function useAcceptWorkspaceInvite(
  refreshWorkspaces: () => Promise<void>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (inviteId: string) =>
      acceptWorkspaceInvite(inviteId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          'workspace-invites',
          'mine',
        ],
      })

      await queryClient.invalidateQueries({
        queryKey: ['workspace-members'],
      })

      await refreshWorkspaces()
    },
  })
}

export function useUpdateWorkspaceMemberRole(
  workspaceId: string,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: UpdateMemberRoleInput) =>
      updateWorkspaceMemberRole(
        workspaceId,
        userId,
        role,
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          'workspace-members',
          workspaceId,
        ],
      })
    },
  })
}

export function useRemoveWorkspaceMember(
  workspaceId: string,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) =>
      removeWorkspaceMember(
        workspaceId,
        userId,
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          'workspace-members',
          workspaceId,
        ],
      })
    },
  })
}