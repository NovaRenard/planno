import {
  useState,
  type FormEvent,
} from 'react'

import { useAuth } from '../features/auth/AuthProvider'
import {
  useAcceptWorkspaceInvite,
  useInviteWorkspaceMember,
  useMyWorkspaceInvites,
  useRemoveWorkspaceMember,
  useUpdateWorkspaceMemberRole,
  useWorkspaceMembers,
} from '../features/workspaces/workspaceCollaboration.queries'
import { useWorkspace } from '../features/workspaces/WorkspaceProvider'

import type { WorkspaceRole } from '../features/workspaces/workspaceMemberService'

type InviteRole = Exclude<WorkspaceRole, 'owner'>

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
    useState<string | null>(null)

  const sharedWorkspaceId =
    currentWorkspace &&
    !currentWorkspace.is_personal
      ? currentWorkspace.id
      : ''

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
  } = useMyWorkspaceInvites()

  const inviteMember =
    useInviteWorkspaceMember(
      sharedWorkspaceId,
    )

  const updateMemberRole =
    useUpdateWorkspaceMemberRole(
      sharedWorkspaceId,
    )

  const removeMember =
    useRemoveWorkspaceMember(
      sharedWorkspaceId,
    )

  const acceptInvite =
    useAcceptWorkspaceInvite(
      refreshWorkspaces,
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
      setInviteMessage(
        'Invitation sent successfully.',
      )
    } catch (error) {
      setInviteMessage(
        getErrorMessage(
          error,
          'Could not send invitation.',
        ),
      )
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
        <h3>My Invitations</h3>

        {invitationsLoading ? (
          <p>Loading invitations...</p>
        ) : invitationsError ? (
          <p
            className="auth-message auth-message-error"
            role="alert"
          >
            {getErrorMessage(
              invitationsError,
              'Could not load invitations.',
            )}
          </p>
        ) : invitations.length === 0 ? (
          <p>
            You have no pending
            invitations.
          </p>
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
                      Role:{' '}
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
              <h3>
                Invite Member
              </h3>

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
                    inviteMember.error
                      ? 'auth-message auth-message-error'
                      : 'auth-message'
                  }
                >
                  {inviteMessage}
                </p>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}