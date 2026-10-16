import {
  useMemo,
  useState,
} from 'react'


import { EmptyState } from '../components/states/EmptyState'
import { ErrorState } from '../components/states/ErrorState'
import { LoadingState } from '../components/states/LoadingState'
import { TaskDetailsDialog } from '../features/tasks/TaskDetailsDialog'
import { TaskDialog } from '../features/tasks/TaskDialog'
import {
  useActiveTasks,
  useArchiveTask,
  useCompleteTask,
} from '../features/tasks/task.queries'
import { useWorkspace } from '../features/workspaces/WorkspaceProvider'
import type { Task } from '../foundation/types/task'

import './TasksPage.css'

function formatDate(value: string | null) {
  if (!value) return '—'

  return new Date(
    `${value}T00:00:00`,
  ).toLocaleDateString()
}

function formatStatus(status: string) {
  if (status === 'in_progress') {
    return 'In progress'
  }

  if (status === 'done') {
    return 'Done'
  }

  return 'To do'
}

export function TasksPage() {
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

  const completeTask =
    useCompleteTask()

  const archiveTask =
    useArchiveTask()

  const [
    showCreateTask,
    setShowCreateTask,
  ] = useState(false)

  const [
    selectedTask,
    setSelectedTask,
  ] = useState<Task | null>(null)

  const [search, setSearch] =
    useState('')

  const [status, setStatus] =
    useState('all')

  const [priority, setPriority] =
    useState('all')

  const visibleTasks = useMemo(() => {
    const query =
      search.trim().toLowerCase()

    return tasks.filter((task) => {
      const matchesSearch =
        !query ||
        task.title
          .toLowerCase()
          .includes(query) ||
        task.description
          ?.toLowerCase()
          .includes(query)

      const matchesStatus =
        status === 'all' ||
        task.status === status

      const matchesPriority =
        priority === 'all' ||
        task.priority === priority

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      )
    })
  }, [
    priority,
    search,
    status,
    tasks,
  ])

  const openCount = tasks.filter(
    (task) =>
      task.status !== 'done',
  ).length

  const inProgressCount =
    tasks.filter(
      (task) =>
        task.status === 'in_progress',
    ).length

  const completedCount =
    tasks.filter(
      (task) =>
        task.status === 'done',
    ).length

  const taskStats = [
    {
      label: 'Open',
      value: String(openCount),
      tone: 'blue',
    },
    {
      label: 'In progress',
      value: String(
        inProgressCount,
      ),
      tone: 'amber',
    },
    {
      label: 'Completed',
      value: String(
        completedCount,
      ),
      tone: 'green',
    },
  ]

  function openTask(task: Task) {
    setSelectedTask(task)
  }

  function handleTaskKeyDown(
    event: React.KeyboardEvent,
    task: Task,
  ) {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault()
      openTask(task)
    }
  }

  return (
    <div className="tasks-page">
      <header className="tasks-header">
        <div>
          <p className="page-eyebrow">
            Task management
          </p>

          <h2>All tasks</h2>

          <p className="page-description">
            Search, filter and organize
            everything in one place.
          </p>
        </div>

        <div className="tasks-header-actions">
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

      <section
        className="tasks-summary-grid"
        aria-label="Task summary"
      >
        {taskStats.map((stat) => (
          <article
            key={stat.label}
            className={`tasks-summary-card tasks-summary-card-${stat.tone}`}
          >
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      <section
        className="tasks-toolbar"
        aria-label="Task filters"
      >
        <label className="tasks-search">
          <span className="tasks-search-icon">
            ⌕
          </span>

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search tasks..."
            aria-label="Search tasks"
          />
        </label>

        <div className="tasks-filter-group">
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value,
              )
            }
          >
            <option value="all">
              All statuses
            </option>

            <option value="todo">
              To do
            </option>

            <option value="in_progress">
              In progress
            </option>

            <option value="done">
              Done
            </option>
          </select>

          <select
            aria-label="Filter by priority"
            value={priority}
            onChange={(event) =>
              setPriority(
                event.target.value,
              )
            }
          >
            <option value="all">
              All priorities
            </option>

            <option value="high">
              High
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="low">
              Low
            </option>
          </select>
        </div>
      </section>

      <section
        className="desktop-task-table"
        aria-label="Task table"
      >
        <div className="task-table-header">
          <span>Status</span>
          <span>Task</span>
          <span>Priority</span>
          <span>Assignee</span>
          <span>Date</span>
          <span>Deadline</span>
          <span>Actions</span>
        </div>

        {workspaceLoading ||
        isLoading ? (
          <LoadingState message="Loading tasks..." />
        ) : error ? (
          <ErrorState
            title="Could not load tasks"
            message={
              error instanceof Error
                ? error.message
                : 'Please try again.'
            }
          />
        ) : visibleTasks.length ===
          0 ? (
          <EmptyState
            title={
              tasks.length === 0
                ? 'Your task list is empty'
                : 'No tasks match these filters'
            }
            description={
              tasks.length === 0
                ? 'Create your first task for this workspace.'
                : 'Adjust the search or filters to see more tasks.'
            }
            actionLabel={
              tasks.length === 0
                ? 'Create first task'
                : undefined
            }
            onAction={() =>
              setShowCreateTask(true)
            }
          />
        ) : (
          <div className="task-table-body">
            {visibleTasks.map(
              (task) => (
                <article
                  key={task.id}
                  className="task-table-row task-table-row-openable"
                  tabIndex={0}
                  onClick={() =>
                    openTask(task)
                  }
                  onKeyDown={(
                    event,
                  ) =>
                    handleTaskKeyDown(
                      event,
                      task,
                    )
                  }
                >
                  <span>
                    {formatStatus(
                      task.status,
                    )}
                  </span>

                  <div className="task-row-title">
                    <strong>
                      {task.title}
                    </strong>

                    {task.description ? (
                      <small>
                        {
                          task.description
                        }
                      </small>
                    ) : null}
                  </div>

                  <span
                    className={`priority-pill priority-${task.priority}`}
                  >
                    {task.priority}
                  </span>

                  <span>
                    {task.assigned_to ??
                      '—'}
                  </span>

                  <span>
                    {formatDate(
                      task.task_date,
                    )}
                  </span>

                  <span>
                    {formatDate(
                      task.due_at,
                    )}
                  </span>

                  <div className="task-row-actions">
                    {task.status !==
                    'done' ? (
                      <button
                        type="button"
                        onClick={(
                          event,
                        ) => {
                          event.stopPropagation()

                          completeTask.mutate(
                            task.id,
                          )
                        }}
                      >
                        Done
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(
                          event,
                        ) => {
                          event.stopPropagation()

                          archiveTask.mutate(
                            task.id,
                          )
                        }}
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>

      <section className="mobile-task-list">
        {visibleTasks.map((task) => (
          <article
            key={task.id}
            className="mobile-task-card mobile-task-card-openable"
            tabIndex={0}
            onClick={() =>
              openTask(task)
            }
            onKeyDown={(event) =>
              handleTaskKeyDown(
                event,
                task,
              )
            }
          >
            <div>
              <strong>
                {task.title}
              </strong>

              <span>
                {formatStatus(
                  task.status,
                )}
              </span>
            </div>

            <span
              className={`priority-pill priority-${task.priority}`}
            >
              {task.priority}
            </span>
          </article>
        ))}
      </section>

      <TaskDialog
        open={showCreateTask}
        onClose={() =>
          setShowCreateTask(false)
        }
      />

      <TaskDetailsDialog
        task={selectedTask}
        onClose={() =>
          setSelectedTask(null)
        }
      />
    </div>
  )
}
