import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './app/components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { TasksPage } from './pages/TasksPage'
import { KanbanPage } from './pages/KanbanPage'
import { CalendarPage } from './pages/CalendarPage'
import { TemplatesPage } from './pages/TemplatesPage'
import { ArchivePage } from './pages/ArchivePage'
import { SettingsPage } from './pages/SettingsPage'
import { ProfilePage } from './pages/ProfilePage'
import { NotFoundPage } from './pages/NotFoundPage'
import './App.css'

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />

        <Route
          path="/tasks"
          element={<TasksPage />}
        />

        <Route
          path="/kanban"
          element={<KanbanPage />}
        />

        <Route
          path="/calendar"
          element={<CalendarPage />}
        />

        <Route
          path="/templates"
          element={<TemplatesPage />}
        />

        <Route
          path="/archive"
          element={<ArchivePage />}
        />

        <Route
          path="/settings"
          element={<SettingsPage />}
        />

        <Route
          path="/profile"
          element={<ProfilePage />}
        />

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </AppLayout>
  )
}

export default App