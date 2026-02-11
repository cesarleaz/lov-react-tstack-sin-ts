import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getAuthStatus } from '../api/auth'
const AuthContext = createContext(undefined)
export function AuthProvider({ children }) {
  const [authStatus, setAuthStatus] = useState({
    status: 'logged_out',
    is_logged_in: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const refreshAuth = async () => {
    try {
      setIsLoading(true)
      const status = await getAuthStatus()
      // Check if token expired based on the status returned by getAuthStatus
      if (status.tokenExpired) {
        toast.error('登录状态已过期，请重新登录', {
          duration: 5000
        })
      }
      setAuthStatus(status)
    } catch (error) {
      console.error('获取认证状态失败:', error)
    } finally {
      setIsLoading(false)
    }
  }
  useEffect(() => {
    refreshAuth()
  }, [])
  return (
    <AuthContext.Provider value={{ authStatus, isLoading, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  )
}
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
