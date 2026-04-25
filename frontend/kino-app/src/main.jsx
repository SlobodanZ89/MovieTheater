import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './app/store.js'
import ColorModeProvider from './theme/ColorModeProvider.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import { ToastProvider } from './ui/ToastProvider.jsx'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <StrictMode>
      <ColorModeProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <AuthProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </AuthProvider>
        </LocalizationProvider>
      </ColorModeProvider>
    </StrictMode>
  </Provider>
)