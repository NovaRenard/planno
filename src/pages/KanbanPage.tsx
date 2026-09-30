import { useState } from 'react'

import { EmptyState } from '../components/states/EmptyState'
import { ErrorState } from '../components/states/ErrorState'
import { LoadingState } from '../components/states/LoadingState'
import { TaskDialog } from '../features/tasks/TaskDialog'
import {
  useActiveTasks,
  useArchiveTask,
  useCompleteTask,
  useUpdateTask,
} from '../features/tasks/task.queries'
import { useWorkspace } from '../features/workspaces/WorkspaceProvider'
import type { TaskStatus } from '../foundation/types/task'

import './KanbanPage.css'

const columns: Array<{
  status: TaskStatus
  title: string
  accent: string
  hint: string
  description: string
}> = [
  {
    status: 'todo',
    title: 'To do',
    accent: 'todo',
    hint: 'Backlog',
    description:
      'Tasks waiting to be started will appear here.',
  },
  {
    status: 'in_progress',
    title: 'In progress',
    accent: 'progress',
    hint: 'Active work',
    description:
      'Tasks currently being worked on will appear here.',
  },
  {
    status: 'done',
    title: 'Done',
    accent: 'done',
    hint: 'Completed',
    description:
      'Completed tasks will appear here.',
  },
]

export function KanbanPage() {
  const { currentWorkspace, loading: workspaceLoading } =
    useWorkspace()
  const workspaceId = currentWorkspace?.id ?? ''
  const {
    data: tasks = [],
    isLoading,
    error,
  } = useActiveTasks(workspaceId)

  const updateTask = useUpdateTask()
  const completeTask = useCompleteTask()
  const archiveTask = useArchiveTask()
  const [showCreateTask, setShowCreateTask] =
    useState(false)

  return (
    <div className="kanban-page">
      <header className="kanban-header">
        <div>
          <p className="page-eyebrow">Workflow</p>
          <h2>Kanban board</h2>
          <p className="page-description">
            See the status of your work at a glance.
          </p>
        </div>

        <div className="kanban-header-actions">
          <button
            type="button"
            className="primary-action"
            onClick={() => setShowCreateTask(true)}
          >
            + New task
          </button>
        </div>
      </header>

      {workspaceLoading || isLoading ? (
        <LoadingState message="Loading board..." />
      ) : error ? (
        <ErrorState
          title="Could not load board"
          message={
            error instanceof Error
              ? error.message
              : 'Please try again.'
          }
        />
      ) : (
        <div className="kanban-board">
          {columns.map((column) => {
            const columnTasks = tasks.filter(
              (task) => task.status === column.status,
            )

            return (
              <section
                key={column.status}
                className="kanban-column"
              >
                <header className="kanban-column-header">
                  <div>
                    <span className="kanban-column-hint">
                      {column.hint}
                    </span>

                    <div className="kanban-column-title">
                      <span
                        className={`kanban-dot kanban-dot-${column.accent}`}
                      />
                      <h3>{column.title}</h3>
                    </div>
                  </div>

                  <span className="kanban-count">
                    {columnTasks.length}
                  </span>
                </header>

                <div className="kanban-column-metrics">
                  <span>
                    <strong>{columnTasks.length}</strong>
                    cards
                  </span>

                  <span>
                    <strong>
                      {tasks.length === 0
                        ? 0
                        : Math.round(
                            (columnTasks.length /
                              tasks.length) *
                              100,
                          )}
                      %
                    </strong>
                    load
                  </span>
                </div>

                <div className="kanban-column-content">
                  {columnTasks.length === 0 ? (
                    <EmptyState
                      title="Nothing here yet"
                      description={column.description}
                    />
                  ) : (
                    columnTasks.map((task) => (
                      <article
                        key={task.id}
                        className="kanban-task-card"
                      >
                        <div className="kanban-task-card-top">
                          <strong>{task.title}</strong>
                          <span
                            className={`priority-pill priority-${task.priority}`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {task.description ? (
                          <p>{task.description}</p>
                        ) : null}

                        <div className="kanban-task-meta">
                          <span>
                            {task.task_date ?? 'No date'}
                          </span>
                          <span>
                            {task.assigned_to ??
                              'Unassigned'}
                          </span>
                        </div>

                        <div className="kanban-task-actions">
                          {task.status === 'todo' ? (
                            <button
                              type="button"
                              onClick={() =>
                                updateTask.mutate({
                                  id: task.id,
                                  input: {
                                    status:
                                      'in_progress',
                                  },
                                })
                              }
                            >
                              Start
                            </button>
                          ) : null}

                          {task.status ===
                          'in_progress' ? (
                            <button
                              type="button"
                              onClick={() =>
                                completeTask.mutate(
                                  task.id,
                                )
                              }
                            >
                              Complete
                            </button>
                          ) : null}

                          {task.status === 'done' ? (
                            <button
                              type="button"
                              onClick={() =>
                                archiveTask.mutate(
                                  task.id,
                                )
                              }
                            >
                              Archive
                            </button>
                          ) : null}
                        </div>
                      </article>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  className="kanban-add-button"
                  onClick={() =>
                    setShowCreateTask(true)
                  }
                >
                  + Add task
                </button>
              </section>
            )
          })}
        </div>
      )}

      <TaskDialog
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
      />
    </div>
  )
}
