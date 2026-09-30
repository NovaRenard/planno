import { EmptyState } from '../components/states/EmptyState'
import './TasksPage.css'

export function TasksPage() {
  const taskStats = [
    {
      label: 'Open',
      value: '0',
      tone: 'blue',
    },
    {
      label: 'In progress',
      value: '0',
      tone: 'amber',
    },
    {
      label: 'Completed',
      value: '0',
      tone: 'green',
    },
  ]

  return (
    <div className="tasks-page">
      <header className="tasks-header">
        <div>
          <p className="page-eyebrow">
            Task management
          </p>

          <h2>All tasks</h2>

          <p className="page-description">
            Search, filter and organize everything in one place.
          </p>
        </div>

        <div className="tasks-header-actions">
          <button
            type="button"
            className="secondary-action"
          >
            Import
          </button>

          <button
            type="button"
            className="primary-action"
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
            placeholder="Search tasks..."
            aria-label="Search tasks"
          />
        </label>

        <div className="tasks-filter-group">
          <select
            aria-label="Filter by status"
            defaultValue="all"
          >
            <option value="all">
              All statuses
            </option>
            <option value="todo">To do</option>
            <option value="in-progress">
              In progress
            </option>
            <option value="done">Done</option>
          </select>

          <select
            aria-label="Filter by priority"
            defaultValue="all"
          >
            <option value="all">
              All priorities
            </option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
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
          <span>Updated</span>
        </div>

        <EmptyState
          title="Your task list is empty"
          description="Once task data is connected, your tasks will appear here."
          actionLabel="Create first task"
        />
      </section>

      <section className="mobile-task-list">
        <EmptyState
          title="No tasks yet"
          description="Your mobile task cards will appear here."
          actionLabel="Create first task"
        />
      </section>
    </div>
  )
}
