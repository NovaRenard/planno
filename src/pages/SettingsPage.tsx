import {
  useState,
  type FormEvent,
} from 'react'

import { useWorkspace } from '../features/workspaces/WorkspaceProvider'

export function SettingsPage() {
  const {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    createWorkspace,
  } = useWorkspace()

  const [workspaceName, setWorkspaceName] =
    useState('')
  const [creating, setCreating] =
    useState(false)
  const [error, setError] =
    useState<string | null>(null)

  async function handleCreateWorkspace(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const name = workspaceName.trim()

    if (!name) {
      return
    }

    setCreating(true)
    setError(null)

    try {
      await createWorkspace(name)
      setWorkspaceName('')
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : 'Could not create workspace.',
      )
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="simple-page">
      <p className="simple-page-eyebrow">
        Workspace
      </p>

      <h2>Settings</h2>

      <p className="simple-page-description">
        Manage the workspaces available to your account.
      </p>

      <div className="simple-page-card">
        <h3>Workspaces</h3>

        <div className="workspace-list">
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              type="button"
              className="workspace-list-item"
              onClick={() =>
                setCurrentWorkspace(workspace)
              }
            >
              <strong>{workspace.name}</strong>
              <span>
                {workspace.id ===
                currentWorkspace?.id
                  ? 'Current'
                  : workspace.is_personal
                    ? 'Personal'
                    : 'Workspace'}
              </span>
            </button>
          ))}
        </div>

        <form
          className="workspace-create-form"
          onSubmit={handleCreateWorkspace}
        >
          <input
            value={workspaceName}
            onChange={(event) =>
              setWorkspaceName(event.target.value)
            }
            placeholder="New workspace name"
            aria-label="New workspace name"
          />

          <button
            type="submit"
            className="primary-action"
            disabled={
              creating || !workspaceName.trim()
            }
          >
            {creating
              ? 'Creating...'
              : 'Create workspace'}
          </button>
        </form>

        {error ? (
          <p
            className="auth-message auth-message-error"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
}
