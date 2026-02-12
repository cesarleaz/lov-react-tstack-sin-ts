import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

const PORT = 57988

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src')
    }
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: `http://localhost:${PORT}`,
        changeOrigin: true
        // Uncomment the following if you want to remove the /api prefix when forwarding to Flask
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
      // Also proxy WebSocket connections
      '/socket.io': {
        target: `ws://localhost:${PORT}`,
        changeOrigin: true,
        // target: `ws://localhost:${PORT}`,
        // ws: true,
        // rewriteWsOrigin: true,
      }
    }
  }
})
