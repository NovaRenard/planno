import {
  useState,
  type FormEvent,
} from 'react'

import { EmptyState } from '../components/states/EmptyState'
import { ErrorState } from '../components/states/ErrorState'
import { LoadingState } from '../components/states/LoadingState'
import { useAuth } from '../features/auth/AuthProvider'
import {
  useAcceptWorkspaceInvite,
  useInviteWorkspaceMember,
  useMyWorkspaceInvites,
  useRemoveWorkspaceMember,
  useRevokeWorkspaceInvite,
  useUpdateWorkspaceMemberRole,
  useWorkspaceMembers,
  useWorkspacePendingInvites,
} from '../features/workspaces/workspaceCollaboration.queries'
import { useWorkspace } from '../features/workspaces/WorkspaceProvider'

import type { WorkspaceRole } from '../features/workspaces/workspaceMemberService'

type InviteRole = Exclude<WorkspaceRole, 'owner'>
type StatusMessage = {
  type: 'success' | 'error'
  text: string
}

function getErrorMessage(
  error: unknown,
  fallback: string,
) {
  return error instanceof Error
    ? error.message
    : fallback
}

export function SettingsPage() {
  const { user } = useAuth()

  const {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    createWorkspace,
    refreshWorkspaces,
  } = useWorkspace()

  const [workspaceName, setWorkspaceName] =
    useState('')

  const [creating, setCreating] =
    useState(false)

  const [workspaceError, setWorkspaceError] =
    useState<string | null>(null)

  const [inviteEmail, setInviteEmail] =
    useState('')

  const [inviteRole, setInviteRole] =
    useState<InviteRole>('viewer')

  const [inviteMessage, setInviteMessage] =
    useState<StatusMessage | null>(null)

  const sharedWorkspaceId =
    currentWorkspace &&
    !currentWorkspace.is_personal
      ? currentWorkspace.id
      : ''
  const sharedWorkspaceName =
    currentWorkspace &&
    !currentWorkspace.is_personal
      ? currentWorkspace.name
      : ''
  const userId = user?.id ?? ''
  const userEmail = user?.email ?? ''

  const {
    data: members = [],
    isLoading: membersLoading,
    error: membersError,
  } = useWorkspaceMembers(
    sharedWorkspaceId,
  )

  const {
    data: invitations = [],
    isLoading: invitationsLoading,
    error: invitationsError,
  } = useMyWorkspaceInvites(userEmail)

  const {
    data: pendingInvites = [],
    isLoading: pendingInvitesLoading,
    error: pendingInvitesError,
  } = useWorkspacePendingInvites(
    sharedWorkspaceId,
  )

  const inviteMember =
    useInviteWorkspaceMember(
      sharedWorkspaceId,
      sharedWorkspaceName,
      userId,
    )

  const updateMemberRole =
    useUpdateWorkspaceMemberRole(
      sharedWorkspaceId,
    )

  const removeMember =
    useRemoveWorkspaceMember(
      sharedWorkspaceId,
    )

  const revokeInvite =
    useRevokeWorkspaceInvite(
      sharedWorkspaceId,
    )

  const acceptInvite =
    useAcceptWorkspaceInvite(
      refreshWorkspaces,
      userId,
    )

  const currentMember =
    members.find(
      (member) =>
        member.user_id === user?.id,
    )

  const isOwner =
    currentMember?.role === 'owner'

  async function handleCreateWorkspace(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const name = workspaceName.trim()

    if (!name) {
      return
    }

    setCreating(true)
    setWorkspaceError(null)

    try {
      await createWorkspace(name)
      setWorkspaceName('')
    } catch (error) {
      setWorkspaceError(
        getErrorMessage(
          error,
          'Could not create workspace.',
        ),
      )
    } finally {
      setCreating(false)
    }
  }

  async function handleInvite(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const email = inviteEmail
      .trim()
      .toLowerCase()

    if (
      !email ||
      !sharedWorkspaceId ||
      !isOwner
    ) {
      return
    }

    setInviteMessage(null)

    try {
      await inviteMember.mutateAsync({
        email,
        role: inviteRole,
      })

      setInviteEmail('')
      setInviteRole('viewer')
      setInviteMessage({
        type: 'success',
        text: 'Invitation sent successfully.',
      })
    } catch (error) {
      setInviteMessage({
        type: 'error',
        text: getErrorMessage(
          error,
          'Could not send invitation.',
        ),
      })
    }
  }

  async function handleRevokeInvite(
    inviteId: string,
  ) {
    setInviteMessage(null)

    try {
      await revokeInvite.mutateAsync(inviteId)

      setInviteMessage({
        type: 'success',
        text: 'Invitation revoked.',
      })
    } catch (error) {
      setInviteMessage({
        type: 'error',
        text: getErrorMessage(
          error,
          'Could not revoke invitation.',
        ),
      })
    }
  }

  async function handleAcceptInvite(
    inviteId: string,
  ) {
    try {
      await acceptInvite.mutateAsync(
        inviteId,
      )
    } catch {
      // Mutation error is displayed below.
    }
  }

  async function handleRoleChange(
    userId: string,
    role: InviteRole,
  ) {
    try {
      await updateMemberRole.mutateAsync({
        userId,
        role,
      })
    } catch {
      // Mutation error is displayed below.
    }
  }

  async function handleRemoveMember(
    userId: string,
  ) {
    const confirmed =
      window.confirm(
        'Remove this member from the workspace?',
      )

    if (!confirmed) {
      return
    }

    try {
      await removeMember.mutateAsync(
        userId,
      )
    } catch {
      // Mutation error is displayed below.
    }
  }

  return (
    <div className="simple-page">
      <p className="simple-page-eyebrow">
        Workspace
      </p>

      <h2>Settings</h2>

      <p className="simple-page-description">
        Manage your workspaces,
        members and invitations.
      </p>

      <div className="simple-page-card">
        <h3>Workspaces</h3>

        <div className="workspace-list">
          {workspaces.map(
            (workspace) => (
              <button
                key={workspace.id}
                type="button"
                className="workspace-list-item"
                onClick={() =>
                  setCurrentWorkspace(
                    workspace,
                  )
                }
              >
                <strong>
                  {workspace.name}
                </strong>

                <span>
                  {workspace.id ===
                  currentWorkspace?.id
                    ? 'Current'
                    : workspace.is_personal
                      ? 'Personal'
                      : 'Shared'}
                </span>
              </button>
            ),
          )}
        </div>

        <form
          className="workspace-create-form"
          onSubmit={
            handleCreateWorkspace
          }
        >
          <input
            value={workspaceName}
            onChange={(event) =>
              setWorkspaceName(
                event.target.value,
              )
            }
            placeholder="New workspace name"
            aria-label="New workspace name"
          />

          <button
            type="submit"
            className="primary-action"
            disabled={
              creating ||
              !workspaceName.trim()
            }
          >
            {creating
              ? 'Creating...'
              : 'Create workspace'}
          </button>
        </form>

        {workspaceError ? (
          <p
            className="auth-message auth-message-error"
            role="alert"
          >
            {workspaceError}
          </p>
        ) : null}
      </div>

      <div className="simple-page-card">
        <div className="workspace-card-header">
          <div>
            <h3>My Invitations</h3>
            <p>
              Accept shared workspaces that were
              sent to your email.
            </p>
          </div>
        </div>

        {invitationsLoading ? (
          <LoadingState message="Loading invitations..." />
        ) : invitationsError ? (
          <ErrorState
            title="Could not load invitations"
            message={getErrorMessage(
                invitationsError,
                'Please try again.',
            )}
          />
        ) : invitations.length === 0 ? (
          <EmptyState
            title="No invitations"
            description="When someone invites you to a workspace, it will appear here."
          />
        ) : (
          <div className="workspace-list">
            {invitations.map(
              (invite) => (
                <div
                  key={invite.id}
                  className="workspace-list-item"
                >
                  <div>
                    <strong>
                      {
                        invite.workspace_name
                      }
                    </strong>

                    <span>
                      {invite.email} · Role:{' '}
                      {invite.role}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="primary-action"
                    disabled={
                      acceptInvite.isPending
                    }
                    onClick={() =>
                      void handleAcceptInvite(
                        invite.id,
                      )
                    }
                  >
                    {acceptInvite.isPending
                      ? 'Accepting...'
                      : 'Accept Invite'}
                  </button>
                </div>
              ),
            )}
          </div>
        )}

        {acceptInvite.error ? (
          <p
            className="auth-message auth-message-error"
            role="alert"
          >
            {getErrorMessage(
              acceptInvite.error,
              'Could not accept invitation.',
            )}
          </p>
        ) : null}
      </div>

      {currentWorkspace?.is_personal ? (
        <div className="simple-page-card">
          <h3>Members</h3>

          <p>
            Personal Workspace is
            private and does not support
            additional members.
          </p>
        </div>
      ) : currentWorkspace ? (
        <>
          <div className="simple-page-card">
            <h3>Members</h3>

            {membersLoading ? (
              <p>Loading members...</p>
            ) : membersError ? (
              <p
                className="auth-message auth-message-error"
                role="alert"
              >
                {getErrorMessage(
                  membersError,
                  'Could not load members.',
                )}
              </p>
            ) : (
              <div className="workspace-list">
                {members.map(
                  (member) => (
                    <div
                      key={member.user_id}
                      className="workspace-list-item"
                    >
                      <div>
                        <strong>
                          {member.profile
                            ?.full_name ??
                            'Workspace member'}
                        </strong>

                        <span>
                          {member.role}
                        </span>
                      </div>

                      {isOwner &&
                      member.role !==
                        'owner' ? (
                        <div>
                          <select
                            value={
                              member.role
                            }
                            disabled={
                              updateMemberRole.isPending
                            }
                            onChange={(
                              event,
                            ) =>
                              void handleRoleChange(
                                member.user_id,
                                event
                                  .target
                                  .value as InviteRole,
                              )
                            }
                          >
                            <option value="editor">
                              Editor
                            </option>

                            <option value="viewer">
                              Viewer
                            </option>
                          </select>

                          <button
                            type="button"
                            className="secondary-action"
                            disabled={
                              removeMember.isPending
                            }
                            onClick={() =>
                              void handleRemoveMember(
                                member.user_id,
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ),
                )}
              </div>
            )}

            {updateMemberRole.error ? (
              <p
                className="auth-message auth-message-error"
                role="alert"
              >
                {getErrorMessage(
                  updateMemberRole.error,
                  'Could not change member role.',
                )}
              </p>
            ) : null}

            {removeMember.error ? (
              <p
                className="auth-message auth-message-error"
                role="alert"
              >
                {getErrorMessage(
                  removeMember.error,
                  'Could not remove member.',
                )}
              </p>
            ) : null}
          </div>

          {isOwner ? (
            <div className="simple-page-card">
              <div className="workspace-card-header">
                <div>
                  <h3>
                    Invite Member
                  </h3>

                  <p>
                    Send workspace access to an
                    editor or viewer by email.
                  </p>
                </div>
              </div>

              <form
                className="workspace-create-form"
                onSubmit={handleInvite}
              >
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(event) =>
                    setInviteEmail(
                      event.target.value,
                    )
                  }
                  placeholder="member@example.com"
                  aria-label="Member email"
                  required
                />

                <select
                  value={inviteRole}
                  onChange={(event) =>
                    setInviteRole(
                      event.target
                        .value as InviteRole,
                    )
                  }
                  aria-label="Member role"
                >
                  <option value="editor">
                    Editor
                  </option>

                  <option value="viewer">
                    Viewer
                  </option>
                </select>

                <button
                  type="submit"
                  className="primary-action"
                  disabled={
                    inviteMember.isPending ||
                    !inviteEmail.trim()
                  }
                >
                  {inviteMember.isPending
                    ? 'Sending...'
                    : 'Invite Member'}
                </button>
              </form>

              {inviteMessage ? (
                <p
                  className={
                    inviteMessage.type ===
                    'error'
                      ? 'auth-message auth-message-error'
                      : 'auth-message'
                  }
                  role={
                    inviteMessage.type ===
                    'error'
                      ? 'alert'
                      : 'status'
                  }
                >
                  {inviteMessage.text}
                </p>
              ) : null}

              <div className="workspace-pending-invites">
                <div className="workspace-section-heading">
                  <h4>Pending invitations</h4>

                  <span>
                    {pendingInvites.length}
                  </span>
                </div>

                {pendingInvitesLoading ? (
                  <LoadingState message="Loading pending invitations..." />
                ) : pendingInvitesError ? (
                  <ErrorState
                    title="Could not load pending invitations"
                    message={getErrorMessage(
                      pendingInvitesError,
                      'Please try again.',
                    )}
                  />
                ) : pendingInvites.length === 0 ? (
                  <EmptyState
                    title="No pending invitations"
                    description="Invites you send from this workspace will appear here until they are accepted or revoked."
                  />
                ) : (
                  <div className="workspace-list">
                    {pendingInvites.map(
                      (invite) => (
                        <div
                          key={invite.id}
                          className="workspace-list-item"
                        >
                          <div>
                            <strong>
                              {invite.email}
                            </strong>

                            <span>
                              Role: {invite.role}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="secondary-action"
                            disabled={
                              revokeInvite.isPending
                            }
                            onClick={() =>
                              void handleRevokeInvite(
                                invite.id,
                              )
                            }
                          >
                            {revokeInvite.isPending
                              ? 'Revoking...'
                              : 'Revoke'}
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
