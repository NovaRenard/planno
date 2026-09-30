import {
  useMemo,
  useState,
} from 'react'

import { EmptyState } from '../components/states/EmptyState'
import { ErrorState } from '../components/states/ErrorState'
import { LoadingState } from '../components/states/LoadingState'
import { TaskDialog } from '../features/tasks/TaskDialog'
import { useActiveTasks } from '../features/tasks/task.queries'
import { useWorkspace } from '../features/workspaces/WorkspaceProvider'

import './CalendarPage.css'

const weekDays = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun',
]

function getMonthCells(
  year: number,
  month: number,
) {
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(
    year,
    month + 1,
    0,
  ).getDate()
  const firstDayIndex =
    (firstDay.getDay() + 6) % 7
  const cells: Array<number | null> = []

  for (
    let index = 0;
    index < firstDayIndex;
    index += 1
  ) {
    cells.push(null)
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day += 1
  ) {
    cells.push(day)
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

function toDateKey(
  year: number,
  month: number,
  day: number,
) {
  return [
    year,
    String(month + 1).padStart(2, '0'),
    String(day).padStart(2, '0'),
  ].join('-')
}

function todayKey() {
  const today = new Date()

  return toDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  )
}

export function CalendarPage() {
  const today = new Date()
  const { currentWorkspace, loading: workspaceLoading } =
    useWorkspace()
  const workspaceId = currentWorkspace?.id ?? ''
  const {
    data: tasks = [],
    isLoading,
    error,
  } = useActiveTasks(workspaceId)

  const [showCreateTask, setShowCreateTask] =
    useState(false)
  const [selectedDate, setSelectedDate] =
    useState(todayKey())
  const [currentMonth, setCurrentMonth] =
    useState(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      ),
    )

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const monthCells = useMemo(
    () => getMonthCells(year, month),
    [year, month],
  )

  const tasksByDate = useMemo(() => {
    const map = new Map<
      string,
      typeof tasks
    >()

    for (const task of tasks) {
      if (!task.task_date) continue

      const list = map.get(task.task_date) ?? []
      list.push(task)
      map.set(task.task_date, list)
    }

    return map
  }, [tasks])

  const selectedTasks =
    tasksByDate.get(selectedDate) ?? []

  const monthTitle =
    currentMonth.toLocaleDateString(
      'en-US',
      {
        month: 'long',
        year: 'numeric',
      },
    )

  function goToPreviousMonth() {
    setCurrentMonth(
      new Date(year, month - 1, 1),
    )
  }

  function goToNextMonth() {
    setCurrentMonth(
      new Date(year, month + 1, 1),
    )
  }

  function goToToday() {
    const next = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    )

    setCurrentMonth(next)
    setSelectedDate(todayKey())
  }

  return (
    <div className="calendar-page">
      <header className="calendar-page-header">
        <div>
          <p className="page-eyebrow">
            Schedule
          </p>

          <h2>Calendar</h2>

          <p className="calendar-description">
            Review your month and plan
            upcoming tasks.
          </p>
        </div>

        <button
          type="button"
          className="primary-action"
          onClick={() => setShowCreateTask(true)}
        >
          + New task
        </button>
      </header>

      {workspaceLoading || isLoading ? (
        <LoadingState message="Loading calendar..." />
      ) : error ? (
        <ErrorState
          title="Could not load calendar"
          message={
            error instanceof Error
              ? error.message
              : 'Please try again.'
          }
        />
      ) : (
        <div className="calendar-layout">
          <section className="calendar-card">
            <div className="calendar-toolbar">
              <div>
                <p className="calendar-toolbar-label">
                  Monthly view
                </p>

                <h3>{monthTitle}</h3>
              </div>

              <div className="calendar-actions">
                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  aria-label="Previous month"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={goToToday}
                >
                  Today
                </button>

                <button
                  type="button"
                  onClick={goToNextMonth}
                  aria-label="Next month"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="calendar-scroll-area">
              <div className="calendar-weekdays">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="calendar-weekday"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="calendar-grid">
                {monthCells.map(
                  (day, index) => {
                    if (day === null) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="calendar-day calendar-day-empty"
                          aria-hidden="true"
                        />
                      )
                    }

                    const dateKey = toDateKey(
                      year,
                      month,
                      day,
                    )
                    const dayTasks =
                      tasksByDate.get(dateKey) ?? []
                    const isToday =
                      dateKey === todayKey()
                    const isSelected =
                      dateKey === selectedDate

                    return (
                      <button
                        key={day}
                        type="button"
                        className={[
                          'calendar-day',
                          isToday
                            ? 'calendar-day-today'
                            : '',
                          isSelected
                            ? 'calendar-day-selected'
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        aria-label={`${day} ${monthTitle}`}
                        onClick={() =>
                          setSelectedDate(dateKey)
                        }
                      >
                        <span className="calendar-day-number">
                          {day}
                        </span>

                        <span className="calendar-day-task-count">
                          {dayTasks.length === 0
                            ? 'No tasks'
                            : `${dayTasks.length} task${dayTasks.length === 1 ? '' : 's'}`}
                        </span>

                        {dayTasks[0] ? (
                          <small>
                            {dayTasks[0].title}
                          </small>
                        ) : null}
                      </button>
                    )
                  },
                )}
              </div>
            </div>
          </section>

          <aside className="calendar-agenda">
            <div className="calendar-agenda-header">
              <p className="panel-eyebrow">
                Agenda
              </p>

              <h3>{selectedDate}</h3>
            </div>

            {selectedTasks.length === 0 ? (
              <EmptyState
                title="No tasks planned"
                description="Tasks assigned to the selected day will appear here."
                actionLabel="Add task"
                onAction={() =>
                  setShowCreateTask(true)
                }
              />
            ) : (
              <div className="calendar-agenda-list">
                {selectedTasks.map((task) => (
                  <article
                    key={task.id}
                    className="calendar-agenda-task"
                  >
                    <strong>{task.title}</strong>
                    <span>
                      {task.status.replace(
                        '_',
                        ' ',
                      )}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}

      <TaskDialog
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
      />
    </div>
  )
}
