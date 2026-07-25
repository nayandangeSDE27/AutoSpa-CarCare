import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App.jsx'
import QueryProvider from './providers/QueryProvider.jsx'
import ToastHost from './components/ui/Toast.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryProvider>
      <BrowserRouter>
        <App />
        <ToastHost />
      </BrowserRouter>
    </QueryProvider>
  </StrictMode>
)
