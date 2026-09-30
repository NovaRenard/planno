import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { EmptyState } from '../components/states/EmptyState'
import { ErrorState } from '../components/states/ErrorState'
import { LoadingState } from '../components/states/LoadingState'
import { TaskDialog } from '../features/tasks/TaskDialog'
import {
  useActiveTasks,
  useCompleteTask,
} from '../features/tasks/task.queries'
import { useWorkspace } from '../features/workspaces/WorkspaceProvider'

function localDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function statusLabel(status: string) {
  if (status === 'in_progress') {
    return 'In progress'
  }

  if (status === 'done') {
    return 'Done'
  }

  return 'To do'
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { currentWorkspace, loading: workspaceLoading } =
    useWorkspace()
  const workspaceId = currentWorkspace?.id ?? ''

  const {
    data: tasks = [],
    isLoading,
    error,
  } = useActiveTasks(workspaceId)

  const completeTask = useCompleteTask()
  const [showCreateTask, setShowCreateTask] =
    useState(false)

  const now = new Date()
  const today = localDateKey(now)
  const currentMonth = today.slice(0, 7)

  const todayTasks = tasks.filter(
    (task) => task.task_date === today,
  )
  const completedToday = todayTasks.filter(
    (task) => task.status === 'done',
  ).length
  const todayProgress =
    todayTasks.length === 0
      ? 0
      : Math.round(
          (completedToday / todayTasks.length) * 100,
        )

  const monthlyTasks = tasks.filter(
    (task) =>
      task.task_date?.startsWith(currentMonth),
  )
  const completedThisMonth = monthlyTasks.filter(
    (task) => task.status === 'done',
  ).length
  const monthlyCompletion =
    monthlyTasks.length === 0
      ? 0
      : Math.round(
          (completedThisMonth /
            monthlyTasks.length) *
            100,
        )

  const inProgress = tasks.filter(
    (task) => task.status === 'in_progress',
  ).length
  const todo = tasks.filter(
    (task) => task.status === 'todo',
  ).length

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="dashboard-hero-eyebrow">
            {now.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>

          <h2>Stay focused on what matters.</h2>

          <p className="dashboard-hero-description">
            {currentWorkspace
              ? `Workspace: ${currentWorkspace.name}`
              : 'Select a workspace to see your tasks.'}
          </p>
        </div>

        <button
          type="button"
          className="primary-action"
          onClick={() => setShowCreateTask(true)}
        >
          + Create task
        </button>
      </section>

      {workspaceLoading || isLoading ? (
        <LoadingState message="Loading dashboard..." />
      ) : error ? (
        <ErrorState
          title="Could not load dashboard"
          message={
            error instanceof Error
              ? error.message
              : 'Please try again.'
          }
        />
      ) : (
        <>
          <section className="dashboard-stat-grid">
            <article className="metric-card metric-card-primary">
              <div className="metric-card-top">
                <span className="metric-label">
                  Today's progress
                </span>
                <span className="metric-icon">↗</span>
              </div>

              <strong className="metric-number">
                {todayProgress}%
              </strong>

              <div className="metric-progress">
                <span
                  style={{
                    width: `${todayProgress}%`,
                  }}
                />
              </div>

              <p>
                {completedToday} of {todayTasks.length}{' '}
                tasks completed
              </p>
            </article>

            <article className="metric-card">
              <div className="metric-card-top">
                <span className="metric-label">
                  Completed
                </span>

                <span className="metric-bubble metric-success">
                  ✓
                </span>
              </div>

              <strong className="metric-number">
                {completedThisMonth}
              </strong>

              <p>This month</p>
            </article>

            <article className="metric-card">
              <div className="metric-card-top">
                <span className="metric-label">
                  In progress
                </span>

                <span className="metric-bubble metric-warning">
                  ◐
                </span>
              </div>

              <strong className="metric-number">
                {inProgress}
              </strong>

              <p>Active tasks</p>
            </article>

            <article className="metric-card">
              <div className="metric-card-top">
                <span className="metric-label">
                  To do
                </span>

                <span className="metric-bubble metric-neutral">
                  +
                </span>
              </div>

              <strong className="metric-number">
                {todo}
              </strong>

              <p>Waiting to start</p>
            </article>
          </section>

          <section className="dashboard-main-grid">
            <article className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <p className="panel-eyebrow">
                    Today
                  </p>
                  <h3>Your tasks</h3>
                </div>

                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => navigate('/tasks')}
                >
                  View all
                </button>
              </div>

              {todayTasks.length === 0 ? (
                <EmptyState
                  title="Nothing scheduled today"
                  description="Create a task and assign today's date to see it here."
                  actionLabel="Create task"
                  onAction={() =>
                    setShowCreateTask(true)
                  }
                />
              ) : (
                <div className="modern-task-list">
                  {todayTasks.map((task) => (
                    <article
                      key={task.id}
                      className="modern-task-row"
                    >
                      <button
                        type="button"
                        className="task-check"
                        aria-label={`Mark ${task.title} complete`}
                        disabled={
                          task.status === 'done'
                        }
                        onClick={() =>
                          completeTask.mutate(task.id)
                        }
                      />

                      <div className="modern-task-main">
                        <h4>{task.title}</h4>

                        <div className="task-meta">
                          <span>
                            {statusLabel(
                              task.status,
                            )}
                          </span>
                          {task.due_at ? (
                            <>
                              <span>•</span>
                              <span>
                                {new Date(
                                  task.due_at,
                                ).toLocaleTimeString(
                                  [],
                                  {
                                    hour: '2-digit',
                                    minute:
                                      '2-digit',
                                  },
                                )}
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>

                      <span
                        className={`priority-pill priority-${task.priority}`}
                      >
                        {task.priority}
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </article>

            <aside className="dashboard-panel focus-panel">
              <div className="panel-heading">
                <div>
                  <p className="panel-eyebrow">
                    Monthly overview
                  </p>

                  <h3>Keep the momentum</h3>
                </div>
              </div>

              <div className="focus-circle">
                <div>
                  <strong>
                    {completedThisMonth}
                  </strong>
                  <span>tasks done</span>
                </div>
              </div>

              <div className="focus-summary">
                <div>
                  <strong>
                    {monthlyCompletion}%
                  </strong>
                  <span>completion rate</span>
                </div>

                <div>
                  <strong>
                    {monthlyTasks.length}
                  </strong>
                  <span>scheduled tasks</span>
                </div>
              </div>
            </aside>
          </section>
        </>
      )}

      <TaskDialog
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
      />
    </div>
  )
}
