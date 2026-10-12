import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  acceptWorkspaceInvite,
  getWorkspacePendingInvites,
  getMyWorkspaceInvites,
  inviteWorkspaceMember,
  revokeWorkspaceInvite,
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

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: () => getWorkspaceMembers(workspaceId),
    enabled: Boolean(workspaceId),
  })
}

export function useMyWorkspaceInvites(email: string) {
  return useQuery({
    queryKey: ['workspace-invites', 'mine', email],
    queryFn: () => getMyWorkspaceInvites(email),
    enabled: Boolean(email),
  })
}

export function useWorkspacePendingInvites(
  workspaceId: string,
) {
  return useQuery({
    queryKey: [
      'workspace-invites',
      workspaceId,
      'pending',
    ],
    queryFn: () =>
      getWorkspacePendingInvites(workspaceId),
    enabled: Boolean(workspaceId),
  })
}

export function useInviteWorkspaceMember(
  workspaceId: string,
  workspaceName: string,
  invitedBy: string,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      email,
      role,
    }: InviteMemberInput) =>
      inviteWorkspaceMember({
        workspaceId,
        workspaceName,
        invitedBy,
        email,
        role,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          'workspace-invites',
          workspaceId,
          'pending',
        ],
      })
    },
  })
}

export function useAcceptWorkspaceInvite(
  refreshWorkspaces: () => Promise<void>,
  userId: string,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (inviteId: string) =>
      acceptWorkspaceInvite(inviteId, userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['workspace-invites'],
      })
      await refreshWorkspaces()
    },
  })
}

export function useRevokeWorkspaceInvite(
  workspaceId: string,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (inviteId: string) =>
      revokeWorkspaceInvite(inviteId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['workspace-invites'],
      })
      await queryClient.invalidateQueries({
        queryKey: [
          'workspace-invites',
          workspaceId,
          'pending',
        ],
      })
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
      removeWorkspaceMember(workspaceId, userId),
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