import { EmptyState } from '../components/states/EmptyState'
import { ErrorState } from '../components/states/ErrorState'
import { LoadingState } from '../components/states/LoadingState'
import {
  useArchivedTasks,
  useDeleteTask,
  useRestoreTask,
} from '../features/tasks/task.queries'
import { useWorkspace } from '../features/workspaces/WorkspaceProvider'

export function ArchivePage() {
  const { currentWorkspace, loading: workspaceLoading } =
    useWorkspace()
  const workspaceId = currentWorkspace?.id ?? ''

  const {
    data: tasks = [],
    isLoading,
    error,
  } = useArchivedTasks(workspaceId)

  const restoreTask = useRestoreTask()
  const deleteTask = useDeleteTask()

  return (
    <div className="simple-page">
      <p className="simple-page-eyebrow">
        Tasks
      </p>

      <h2>Archive</h2>

      <p className="simple-page-description">
        Review archived tasks, restore them or delete them permanently.
      </p>

      <div className="simple-page-card">
        {workspaceLoading || isLoading ? (
          <LoadingState message="Loading archive..." />
        ) : error ? (
          <ErrorState
            title="Could not load archive"
            message={
              error instanceof Error
                ? error.message
                : 'Please try again.'
            }
          />
        ) : tasks.length === 0 ? (
          <EmptyState
            title="Archive is empty"
            description="Tasks you archive from the active views will appear here."
          />
        ) : (
          <div className="archive-task-list">
            {tasks.map((task) => (
              <article
                key={task.id}
                className="archive-task-row"
              >
                <div>
                  <strong>{task.title}</strong>
                  <span>
                    {task.archived_at
                      ? new Date(
                          task.archived_at,
                        ).toLocaleString()
                      : 'Archived'}
                  </span>
                </div>

                <div className="archive-task-actions">
                  <button
                    type="button"
                    onClick={() =>
                      restoreTask.mutate(task.id)
                    }
                  >
                    Restore
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteTask.mutate(task.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
