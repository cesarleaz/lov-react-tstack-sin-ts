import { SocketProvider } from '@/contexts/socket'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import '@/assets/style/index.css'

const root = document.getElementById('root')
createRoot(root).render(
  <StrictMode>
    <SocketProvider>
      <App />
    </SocketProvider>
  </StrictMode>
)
