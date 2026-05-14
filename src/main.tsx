import '@vitejs/plugin-react-swc/preamble'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { ThemeProvider } from './context/ThemeContext'
import { MessageNotificationsProvider } from './context/MessageNotificationsContext'
import { ToastProvider } from './context/ToastContext'
import { SessionExpiredBridge } from './components/auth/SessionExpiredBridge'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <SessionExpiredBridge />
            <MessageNotificationsProvider>
              <App />
            </MessageNotificationsProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
