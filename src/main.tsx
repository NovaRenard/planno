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

import './index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
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
