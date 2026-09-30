const todayTasks = [
  {
    id: 1,
    title: 'Prepare dashboard layout',
    status: 'In progress',
    priority: 'High',
    time: '10:30',
  },
  {
    id: 2,
    title: 'Check mobile navigation',
    status: 'To do',
    priority: 'Medium',
    time: '14:00',
  },
  {
    id: 3,
    title: 'Review responsive layout',
    status: 'Done',
    priority: 'Low',
    time: '17:30',
  },
]

export function DashboardPage() {
  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="dashboard-hero-eyebrow">
            Friday · September 25
          </p>

          <h2>Stay focused on what matters.</h2>

          <p className="dashboard-hero-description">
            You are making good progress. Here is a quick
            view of your work for today.
          </p>
        </div>

        <button
          type="button"
          className="primary-action"
        >
          + Create task
        </button>
      </section>

      <section className="dashboard-stat-grid">
        <article className="metric-card metric-card-primary">
          <div className="metric-card-top">
            <span className="metric-label">
              Today's progress
            </span>

            <span className="metric-icon">↗</span>
          </div>

          <strong className="metric-number">60%</strong>

          <div className="metric-progress">
            <span />
          </div>

          <p>3 of 5 tasks completed</p>
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

          <strong className="metric-number">24</strong>

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

          <strong className="metric-number">8</strong>

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

          <strong className="metric-number">5</strong>

          <p>Waiting to start</p>
        </article>
      </section>

      <section className="dashboard-main-grid">
        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-eyebrow">Today</p>
              <h3>Your tasks</h3>
            </div>

            <button
              type="button"
              className="ghost-button"
            >
              View all
            </button>
          </div>

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
                />

                <div className="modern-task-main">
                  <h4>{task.title}</h4>

                  <div className="task-meta">
                    <span>{task.status}</span>
                    <span>•</span>
                    <span>{task.time}</span>
                  </div>
                </div>

                <span
                  className={`priority-pill priority-${task.priority.toLowerCase()}`}
                >
                  {task.priority}
                </span>
              </article>
            ))}
          </div>
        </article>

        <aside className="dashboard-panel focus-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-eyebrow">
                Monthly goal
              </p>

              <h3>Keep the momentum</h3>
            </div>
          </div>

          <div className="focus-circle">
            <div>
              <strong>24</strong>
              <span>tasks done</span>
            </div>
          </div>

          <div className="focus-summary">
            <div>
              <strong>78%</strong>
              <span>completion rate</span>
            </div>

            <div>
              <strong>6</strong>
              <span>days streak</span>
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}