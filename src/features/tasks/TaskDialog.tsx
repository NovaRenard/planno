import { useAuth } from '../auth/AuthProvider'
import { useWorkspace } from '../workspaces/WorkspaceProvider'
import { ErrorState } from '../../components/states/ErrorState'
import { LoadingState } from '../../components/states/LoadingState'
import { TaskForm } from './TaskForm'

type TaskDialogProps = {
  open: boolean
  onClose: () => void
  projectId?: string
}

export function TaskDialog({
  open,
  onClose,
  projectId,
}: TaskDialogProps) {
  const { user, loading: authLoading } = useAuth()
  const {
    currentWorkspace,
    loading: workspaceLoading,
  } = useWorkspace()

  if (!open) {
    return null
  }

  return (
    <div
      className="task-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        className="task-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-dialog-title"
      >
        <header className="task-dialog-header">
          <div>
            <p className="page-eyebrow">Task</p>
            <h2 id="task-dialog-title">Create task</h2>
          </div>

          <button
            type="button"
            className="secondary-action"
            onClick={onClose}
          >
            Close
          </button>
        </header>

        {authLoading || workspaceLoading ? (
          <LoadingState message="Preparing task form..." />
        ) : !user || !currentWorkspace ? (
          <ErrorState
            title="Workspace unavailable"
            message="Sign in and select a workspace before creating a task."
          />
        ) : (
          <TaskForm
            createdBy={user.id}
            workspaceId={currentWorkspace.id}
            projectId={projectId}
            onSuccess={onClose}
          />
        )}
      </section>
    </div>
  )
}
