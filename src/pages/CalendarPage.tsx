import { useMemo, useState } from 'react'
import { EmptyState } from '../components/states/EmptyState'
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

export function CalendarPage() {
  const today = new Date()

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
    setCurrentMonth(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      ),
    )
  }

  function isToday(day: number) {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
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
        >
          + New event
        </button>
      </header>

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

          <div className="calendar-legend">
            <span>
              <i className="calendar-legend-dot calendar-legend-dot-today" />
              Today
            </span>

            <span>
              <i className="calendar-legend-dot calendar-legend-dot-free" />
              No tasks
            </span>
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

                  return (
                    <button
                      key={day}
                      type="button"
                      className={
                        isToday(day)
                          ? 'calendar-day calendar-day-today'
                          : 'calendar-day'
                      }
                      aria-label={`${day} ${monthTitle}`}
                    >
                      <span className="calendar-day-number">
                        {day}
                      </span>

                      <span className="calendar-day-placeholder">
                        No tasks
                      </span>
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

            <h3>Selected day</h3>
          </div>

          <EmptyState
            title="No events planned"
            description="Tasks and calendar events for the selected day will appear here."
            actionLabel="Add event"
          />
        </aside>
      </div>
    </div>
  )
}
