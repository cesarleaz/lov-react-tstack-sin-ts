// import InstallComfyUIDialog from '@/components/comfyui/InstallComfyUIDialog'
import UpdateNotificationDialog from '@/components/common/UpdateNotificationDialog'
import SettingsDialog from '@/components/settings/dialog'
import { LoginDialog } from '@/components/auth/LoginDialog'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { ConfigsProvider } from '@/contexts/configs'
import { AuthProvider } from '@/contexts/AuthContext'
import { useTheme } from '@/hooks/use-theme'
import { Route, Switch } from 'wouter'
import { useEffect } from 'react'
import { Toaster } from 'sonner'
import '@/assets/style/App.css'
import '@/i18n'
import { AgentStudio } from './routes/agent_studio'
import Asset from './routes/assets'
import { Knowledge } from './routes/knowledge'
import Canvas from './routes/canvas.$id'
import Home from './routes'
function App() {
  const { theme } = useTheme()
  // Auto-start ComfyUI on app startup
  useEffect(() => {
    const autoStartComfyUI = async () => {
      try {
        // Check if ComfyUI is installed
        const isInstalled = await window.electronAPI?.checkComfyUIInstalled()
        if (!isInstalled) {
          console.log('ComfyUI is not installed, skipping auto-start')
          return
        }
        // Start ComfyUI process
        console.log('Auto-starting ComfyUI...')
        const result = await window.electronAPI?.startComfyUIProcess()
        if (result?.success) {
          console.log('ComfyUI auto-started successfully:', result.message)
        } else {
          console.log('Failed to auto-start ComfyUI:', result?.message)
        }
      } catch (error) {
        console.error('Error during ComfyUI auto-start:', error)
      }
    }
    // Only run if electronAPI is available (in Electron environment)
    if (window.electronAPI) {
      autoStartComfyUI()
    }
  }, [])
  return (
    <ThemeProvider defaultTheme={theme} storageKey="vite-ui-theme">
        <AuthProvider>
          <ConfigsProvider>
            <div className="app-container">
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/agent_studio" component={AgentStudio} />
                <Route path="/assets" component={Asset} />
                <Route path="/knowledge" component={Knowledge} />
                <Route path="/canvas/:id" component={Canvas} />
              </Switch>

              {/* Install ComfyUI Dialog */}
              {/* <InstallComfyUIDialog /> */}

              {/* Update Notification Dialog */}
              <UpdateNotificationDialog />

              {/* Settings Dialog */}
              <SettingsDialog />

              {/* Login Dialog */}
              <LoginDialog />
            </div>
          </ConfigsProvider>
        </AuthProvider>
      <Toaster position="bottom-center" richColors />
    </ThemeProvider>
  )
}
export default App
