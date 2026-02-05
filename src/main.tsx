import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { FileProvider } from './context/FileContext'
import { NotificationProvider } from './context/NotificationContext';
import { MeetingProvider } from './context/MeetingContext';
import { TaskProvider } from './context/TaskContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <FileProvider>
          <MeetingProvider>
            <TaskProvider>
              <LanguageProvider>
                <ThemeProvider>
                  <App />
                </ThemeProvider>
              </LanguageProvider>
            </TaskProvider>
          </MeetingProvider>
        </FileProvider>
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>,
)
