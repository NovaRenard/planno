import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const mobileNavigation = [
  {
    label: 'Home',
    icon: '⌂',
    to: '/',
  },
  {
    label: 'Tasks',
    icon: '✓',
    to: '/tasks',
  },
  {
    label: 'Kanban',
    icon: '▦',
    to: '/kanban',
  },
  {
    label: 'Calendar',
    icon: '◷',
    to: '/calendar',
  },
]

const moreNavigation = [
  {
    label: 'Projects',
    icon: '▧',
    to: '/projects',
  },
  {
    label: 'Table',
    icon: '☷',
    to: '/tasks',
  },
  {
    label: 'Templates',
    icon: '◇',
    to: '/templates',
  },
  {
    label: 'Archive',
    icon: '□',
    to: '/archive',
  },
  {
    label: 'Settings',
    icon: '⚙',
    to: '/settings',
  },
  {
    label: 'Profile',
    icon: '◉',
    to: '/profile',
  },
]

export function MobileNavigation() {
  const [isMoreOpen, setIsMoreOpen] =
    useState(false)

  function toggleMoreMenu() {
    setIsMoreOpen((currentValue) => !currentValue)
  }

  function closeMoreMenu() {
    setIsMoreOpen(false)
  }

  return (
    <>
      {isMoreOpen && (
        <div
          className="mobile-more-backdrop"
          onClick={closeMoreMenu}
          aria-hidden="true"
        />
      )}

      {isMoreOpen && (
        <section
          id="mobile-more-menu"
          className="mobile-more-menu"
          aria-label="More navigation"
        >
          <div className="mobile-more-header">
            <h2>More</h2>

            <button
              type="button"
              className="mobile-more-close"
              onClick={closeMoreMenu}
              aria-label="Close more menu"
            >
              Close
            </button>
          </div>

          <nav
            className="mobile-more-links"
            aria-label="Additional navigation"
          >
            {moreNavigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="mobile-more-link"
                onClick={closeMoreMenu}
              >
                <span aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            ))}

            <button
              type="button"
              className="mobile-more-link"
            onClick={closeMoreMenu}
          >
            <span aria-hidden="true">✦</span>
            Workspace
          </button>
        </nav>
        </section>
      )}

      <nav
        className="mobile-navigation"
        aria-label="Mobile navigation"
      >
        {mobileNavigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={closeMoreMenu}
            className={({ isActive }) =>
              isActive
                ? 'mobile-navigation-item mobile-navigation-item-active'
                : 'mobile-navigation-item'
            }
          >
            <span
              className="mobile-navigation-icon"
              aria-hidden="true"
            >
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}

        <button
          type="button"
          className={
            isMoreOpen
              ? 'mobile-navigation-item mobile-navigation-item-active'
              : 'mobile-navigation-item'
          }
          onClick={toggleMoreMenu}
          aria-expanded={isMoreOpen}
          aria-controls="mobile-more-menu"
        >
          <span
            className="mobile-navigation-icon"
            aria-hidden="true"
          >
            ⋯
          </span>
          More
        </button>
      </nav>
    </>
  )
}
