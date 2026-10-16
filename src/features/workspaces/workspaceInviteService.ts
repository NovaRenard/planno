import type {
  WorkspaceMember,
  WorkspaceRole,
} from './workspaceMemberService'

const localInviteStorageKey =
  'planno.workspaceInvites'

export type WorkspaceInviteStatus =
  | 'pending'
  | 'accepted'
  | 'revoked'

export type WorkspaceInvite = {
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

export type IncomingWorkspaceInvite =
  WorkspaceInvite

export type WorkspacePendingInvite =
  WorkspaceInvite

type InviteWorkspaceMemberInput = {
  workspaceId: string
  workspaceName: string
  email: string
  role: Exclude<WorkspaceRole, 'owner'>
  invitedBy: string
}

function createInviteId() {
  if ('randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`
}

function readInvites() {
  const rawValue = localStorage.getItem(
    localInviteStorageKey,
  )

  if (!rawValue) {
    return []
  }

  try {
    return JSON.parse(
      rawValue,
    ) as WorkspaceInvite[]
  } catch {
    return []
  }
}

function writeInvites(invites: WorkspaceInvite[]) {
  localStorage.setItem(
    localInviteStorageKey,
    JSON.stringify(invites),
  )
}

export async function inviteWorkspaceMember({
  workspaceId,
  workspaceName,
  email,
  role,
  invitedBy,
}: InviteWorkspaceMemberInput): Promise<WorkspaceInvite> {
  const normalizedEmail =
    email.trim().toLowerCase()

  if (!normalizedEmail) {
    throw new Error('Email is required')
  }

  const invites = readInvites()
  const hasPendingInvite = invites.some(
    (invite) =>
      invite.workspace_id === workspaceId &&
      invite.email === normalizedEmail &&
      invite.status === 'pending',
  )

  if (hasPendingInvite) {
    throw new Error(
      'A pending invitation already exists',
    )
  }

  const now = new Date().toISOString()
  const invite: WorkspaceInvite = {
    id: createInviteId(),
    workspace_id: workspaceId,
    workspace_name: workspaceName,
    email: normalizedEmail,
    role,
    invited_by: invitedBy,
    status: 'pending',
    created_at: now,
    accepted_at: null,
  }

  writeInvites([invite, ...invites])

  return invite
}

export async function getMyWorkspaceInvites(
  email: string,
): Promise<IncomingWorkspaceInvite[]> {
  const normalizedEmail =
    email.trim().toLowerCase()

  if (!normalizedEmail) {
    return []
  }

  return readInvites().filter(
    (invite) =>
      invite.email === normalizedEmail &&
      invite.status === 'pending',
  )
}

export async function getWorkspacePendingInvites(
  workspaceId: string,
): Promise<WorkspacePendingInvite[]> {
  if (!workspaceId) {
    return []
  }

  return readInvites().filter(
    (invite) =>
      invite.workspace_id === workspaceId &&
      invite.status === 'pending',
  )
}

export async function acceptWorkspaceInvite(
  inviteId: string,
  userId: string,
): Promise<WorkspaceMember> {
  const invites = readInvites()
  const inviteIndex = invites.findIndex(
    (invite) =>
      invite.id === inviteId &&
      invite.status === 'pending',
  )

  if (inviteIndex === -1) {
    throw new Error('Invitation not found')
  }

  const acceptedAt = new Date().toISOString()
  const invite = {
    ...invites[inviteIndex],
    status: 'accepted' as const,
    accepted_at: acceptedAt,
  }

  invites[inviteIndex] = invite
  writeInvites(invites)

  return {
    workspace_id: invite.workspace_id,
    user_id: userId,
    role: invite.role,
    created_at: acceptedAt,
    profile: null,
  }
}

export async function revokeWorkspaceInvite(
  inviteId: string,
): Promise<WorkspaceInvite> {
  const invites = readInvites()
  const inviteIndex = invites.findIndex(
    (invite) =>
      invite.id === inviteId &&
      invite.status === 'pending',
  )

  if (inviteIndex === -1) {
    throw new Error(
      'Pending invitation not found',
    )
  }

  const invite = {
    ...invites[inviteIndex],
    status: 'revoked' as const,
  }

  invites[inviteIndex] = invite
  writeInvites(invites)

  return invite
}