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

export default function App() {
  const { theme } = useTheme()

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
