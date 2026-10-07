import { useEffect } from 'react'

import type { Task } from '../../foundation/types/task'

import './TaskDetailsDialog.css'

type TaskDetailsDialogProps = {
  task: Task | null
  onClose: () => void
}

function formatStatus(status: Task['status']) {
  if (status === 'in_progress') return 'In progress'
  if (status === 'done') return 'Done'

  return 'To do'
}

function formatPriority(priority: Task['priority']) {
  return (
    priority.charAt(0).toUpperCase() +
    priority.slice(1)
  )
}

function formatDate(value: string | null) {
  if (!value) {
    return '—'
  }

  const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/

  const date = dateOnlyPattern.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(value: string | null) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function TaskDetailsDialog({
  task,
  onClose,
}: TaskDetailsDialogProps) {
  useEffect(() => {
    if (!task) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow = 'hidden'

    window.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () => {
      document.body.style.overflow =
        previousOverflow

      window.removeEventListener(
        'keydown',
        handleKeyDown,
      )
    }
  }, [task, onClose])

  if (!task) {
    return null
  }

  return (
    <div
      className="task-details-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        className="task-details-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-details-title"
      >
        <header className="task-details-header">
          <div className="task-details-heading">
            <p className="page-eyebrow">
              Task details
            </p>

            <h2 id="task-details-title">
              {task.title}
            </h2>
          </div>

          <button
            type="button"
            className="task-details-close"
            onClick={onClose}
            aria-label="Close task details"
          >
            ×
          </button>
        </header>

        <div className="task-details-content">
          <div className="task-details-badges">
            <span
              className={`task-details-status task-details-status-${task.status}`}
            >
              {formatStatus(task.status)}
            </span>

            <span
              className={`priority-pill priority-${task.priority}`}
            >
              {formatPriority(task.priority)}
            </span>
          </div>

          <section className="task-details-section">
            <p className="task-details-label">
              Description
            </p>

            <div className="task-details-description">
              {task.description ? (
                <p>{task.description}</p>
              ) : (
                <p className="task-details-muted">
                  No description provided.
                </p>
              )}
            </div>
          </section>

          <section
            className="task-details-grid"
            aria-label="Task information"
          >
            <DetailItem
              label="Task date"
              value={formatDate(task.task_date)}
            />

            <DetailItem
              label="Deadline"
              value={formatDateTime(task.due_at)}
            />

            <DetailItem
              label="Assignee"
              value={
                task.assigned_to ??
                'Unassigned'
              }
            />

            <DetailItem
              label="Status"
              value={formatStatus(task.status)}
            />

            <DetailItem
              label="Priority"
              value={formatPriority(
                task.priority,
              )}
            />

            <DetailItem
              label="Completed"
              value={formatDateTime(
                task.completed_at,
              )}
            />
          </section>

          <section className="task-details-section">
            <p className="task-details-label">
              Activity
            </p>

            <div className="task-details-activity">
              <DetailItem
                label="Created"
                value={formatDateTime(
                  task.created_at,
                )}
              />

              <DetailItem
                label="Last updated"
                value={formatDateTime(
                  task.updated_at,
                )}
              />
            </div>
          </section>

          <footer className="task-details-footer">
            <span className="task-details-id">
              Task ID: {task.id}
            </span>

            <button
              type="button"
              className="secondary-action"
              onClick={onClose}
            >
              Close
            </button>
          </footer>
        </div>
      </section>
    </div>
  )
}

type DetailItemProps = {
  label: string
  value: string
}

function DetailItem({
  label,
  value,
}: DetailItemProps) {
  return (
    <div className="task-details-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
