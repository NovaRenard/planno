
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

import App from './App'
import { AuthGate } from './features/auth/AuthGate'
import { AuthProvider } from './features/auth/AuthProvider'
import { WorkspaceProvider } from './features/workspaces/WorkspaceProvider'

import {logger} from './lib/logger'

import './index.css'

const queryClient = new QueryClient()

// Логирование запуска приложения
logger.info('Planno initialization started')

// Обработка необработанных ошибок браузера
if (import.meta.env.DEV) {
  window.addEventListener('error', () => {
    logger.error('An uncaught browser error occurred')
  })

  window.addEventListener('unhandledrejection', () => {
    logger.error('An unhandled promise rejection occurred')
  })
}

const root = document.getElementById('root')

if (!root) {
  logger.error('Root element not found')
  throw new Error('Root element not found')
}

logger.info('Starting React application')

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuthGate>
            <WorkspaceProvider>
              <App />
            </WorkspaceProvider>
          </AuthGate>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)

logger.info('React render requested')
