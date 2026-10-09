import { useState } from 'react'
import type { DragEvent } from 'react'

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
import type {
  Task,
  TaskStatus,
} from '../foundation/types/task'

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
  const {
    currentWorkspace,
    loading: workspaceLoading,
  } = useWorkspace()

  const workspaceId =
    currentWorkspace?.id ?? ''

  const {
    data: tasks = [],
    isLoading,
    error,
  } = useActiveTasks(workspaceId)

  const updateTask = useUpdateTask()
  const completeTask = useCompleteTask()
  const archiveTask = useArchiveTask()

  const [
    showCreateTask,
    setShowCreateTask,
  ] = useState(false)

  const [
    draggingTaskId,
    setDraggingTaskId,
  ] = useState<string | null>(null)

  const [
    dragOverStatus,
    setDragOverStatus,
  ] = useState<TaskStatus | null>(null)

  const draggingTask =
    tasks.find(
      (task) => task.id === draggingTaskId,
    ) ?? null

  function handleDragStart(
    event: DragEvent<HTMLElement>,
    task: Task,
  ) {
    setDraggingTaskId(task.id)

    event.dataTransfer.effectAllowed =
      'move'

    event.dataTransfer.setData(
      'text/plain',
      task.id,
    )
  }

  function handleDragEnd() {
    setDraggingTaskId(null)
    setDragOverStatus(null)
  }

  function handleDragOver(
    event: DragEvent<HTMLElement>,
    status: TaskStatus,
  ) {
    event.preventDefault()

    event.dataTransfer.dropEffect =
      'move'

    setDragOverStatus(status)
  }

  function handleDragLeave(
    event: DragEvent<HTMLElement>,
  ) {
    const nextTarget =
      event.relatedTarget

    if (
      nextTarget instanceof Node &&
      event.currentTarget.contains(
        nextTarget,
      )
    ) {
      return
    }

    setDragOverStatus(null)
  }

  function handleDrop(
    event: DragEvent<HTMLElement>,
    status: TaskStatus,
  ) {
    event.preventDefault()

    const taskId =
      draggingTaskId ||
      event.dataTransfer.getData(
        'text/plain',
      )

    setDraggingTaskId(null)
    setDragOverStatus(null)

    if (!taskId) {
      return
    }

    const task = tasks.find(
      (item) => item.id === taskId,
    )

    if (
      !task ||
      task.status === status ||
      updateTask.isPending
    ) {
      return
    }

    updateTask.mutate({
      id: task.id,
      input: {
        status,
      },
    })
  }

  return (
    <div className="kanban-page">
      <header className="kanban-header">
        <div>
          <p className="page-eyebrow">
            Workflow
          </p>

          <h2>Kanban board</h2>

          <p className="page-description">
            Drag tasks between columns
            to update their status.
          </p>
        </div>

        <div className="kanban-header-actions">
          <button
            type="button"
            className="primary-action"
            onClick={() =>
              setShowCreateTask(true)
            }
          >
            + New task
          </button>
        </div>
      </header>

      {workspaceLoading ||
      isLoading ? (
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
            const columnTasks =
              tasks.filter(
                (task) =>
                  task.status ===
                  column.status,
              )

            const isDropTarget =
              dragOverStatus ===
                column.status &&
              draggingTask?.status !==
                column.status

            return (
              <section
                key={column.status}
                className={[
                  'kanban-column',
                  isDropTarget
                    ? 'kanban-column-drop-target'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onDragOver={(event) =>
                  handleDragOver(
                    event,
                    column.status,
                  )
                }
                onDragLeave={
                  handleDragLeave
                }
                onDrop={(event) =>
                  handleDrop(
                    event,
                    column.status,
                  )
                }
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

                      <h3>
                        {column.title}
                      </h3>
                    </div>
                  </div>

                  <span className="kanban-count">
                    {
                      columnTasks.length
                    }
                  </span>
                </header>

                <div className="kanban-column-metrics">
                  <span>
                    <strong>
                      {
                        columnTasks.length
                      }
                    </strong>
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
                  {isDropTarget && (
                    <div className="kanban-drop-indicator">
                      Drop task here
                    </div>
                  )}

                  {columnTasks.length ===
                  0 ? (
                    <EmptyState
                      title="Nothing here yet"
                      description={
                        column.description
                      }
                    />
                  ) : (
                    columnTasks.map(
                      (task) => (
                        <article
                          key={task.id}
                          draggable
                          className={[
                            'kanban-task-card',
                            draggingTaskId ===
                            task.id
                              ? 'kanban-task-card-dragging'
                              : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          onDragStart={(
                            event,
                          ) =>
                            handleDragStart(
                              event,
                              task,
                            )
                          }
                          onDragEnd={
                            handleDragEnd
                          }
                        >
                          <div className="kanban-task-drag-hint">
                            ⋮⋮ Drag
                          </div>

                          <div className="kanban-task-card-top">
                            <strong>
                              {
                                task.title
                              }
                            </strong>

                            <span
                              className={`priority-pill priority-${task.priority}`}
                            >
                              {
                                task.priority
                              }
                            </span>
                          </div>

                          {task.description ? (
                            <p>
                              {
                                task.description
                              }
                            </p>
                          ) : null}

                          <div className="kanban-task-meta">
                            <span>
                              {task.task_date ??
                                'No date'}
                            </span>

                            <span>
                              {task.assigned_to ??
                                'Unassigned'}
                            </span>
                          </div>

                          <div className="kanban-task-actions">
                            {task.status ===
                            'todo' ? (
                              <button
                                type="button"
                                disabled={
                                  updateTask.isPending
                                }
                                onClick={() =>
                                  updateTask.mutate(
                                    {
                                      id: task.id,
                                      input: {
                                        status:
                                          'in_progress',
                                      },
                                    },
                                  )
                                }
                              >
                                Start
                              </button>
                            ) : null}

                            {task.status ===
                            'in_progress' ? (
                              <button
                                type="button"
                                disabled={
                                  completeTask.isPending
                                }
                                onClick={() =>
                                  completeTask.mutate(
                                    task.id,
                                  )
                                }
                              >
                                Complete
                              </button>
                            ) : null}

                            {task.status ===
                            'done' ? (
                              <button
                                type="button"
                                disabled={
                                  archiveTask.isPending
                                }
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
                      ),
                    )
                  )}
                </div>

                <button
                  type="button"
                  className="kanban-add-button"
                  onClick={() =>
                    setShowCreateTask(
                      true,
                    )
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
        onClose={() =>
          setShowCreateTask(false)
        }
      />
    </div>
  )
}
