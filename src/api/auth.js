import { BASE_API_URL } from '../constants'
import i18n from '../i18n'
import { clearJaazApiKey } from './config'
export async function startDeviceAuth() {
  const response = await fetch(`${BASE_API_URL}/api/device/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data = await response.json()
  // Open browser for user authentication using Electron API
  const authUrl = `${BASE_API_URL}/auth/device?code=${data.code}`
  // Check if we're in Electron environment
  if (window.electronAPI?.openBrowserUrl) {
    try {
      await window.electronAPI.openBrowserUrl(authUrl)
    } catch (error) {
      console.error('Failed to open browser via Electron:', error)
      // Fallback to window.open if Electron API fails
      window.open(authUrl, '_blank')
    }
  } else {
    // Fallback for web environment
    window.open(authUrl, '_blank')
  }
  return {
    status: data.status,
    code: data.code,
    expires_at: data.expires_at,
    message: i18n.t('common:auth.browserLoginMessage')
  }
}
export async function pollDeviceAuth(deviceCode) {
  const response = await fetch(
    `${BASE_API_URL}/api/device/poll?code=${deviceCode}`
  )
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return await response.json()
}
export async function getAuthStatus() {
  // Get auth status from local storage
  const token = localStorage.getItem('jaaz_access_token')
  const userInfo = localStorage.getItem('jaaz_user_info')
  console.log('Getting auth status:', {
    hasToken: !!token,
    hasUserInfo: !!userInfo,
    userInfo: userInfo ? JSON.parse(userInfo) : null
  })
  if (token && userInfo) {
    try {
      // Always try to refresh token when we have one
      const newToken = await refreshToken(token)
      // Save the new token
      localStorage.setItem('jaaz_access_token', newToken)
      console.log('Token refreshed successfully')
      const authStatus = {
        status: 'logged_in',
        is_logged_in: true,
        user_info: JSON.parse(userInfo)
      }
      return authStatus
    } catch (error) {
      console.log('Token refresh failed:', error)
      // Only clear auth data if token is truly expired (401), not for network errors
      if (error instanceof Error && error.message === 'TOKEN_EXPIRED') {
        console.log('Token expired, clearing auth data')
        localStorage.removeItem('jaaz_access_token')
        localStorage.removeItem('jaaz_user_info')
        // Clear jaaz provider api_key
        try {
          await clearJaazApiKey()
        } catch (clearError) {
          console.error('Failed to clear jaaz api key:', clearError)
        }
        const loggedOutStatus = {
          status: 'logged_out',
          is_logged_in: false,
          tokenExpired: true
        }
        return loggedOutStatus
      } else {
        // Network error or other issues, keep user logged in with old token
        console.log(
          'Network error during token refresh, keeping user logged in with existing token'
        )
        const authStatus = {
          status: 'logged_in',
          is_logged_in: true,
          user_info: JSON.parse(userInfo)
        }
        return authStatus
      }
    }
  }
  const loggedOutStatus = {
    status: 'logged_out',
    is_logged_in: false
  }
  console.log('Returning logged out status:', loggedOutStatus)
  return loggedOutStatus
}
export async function logout() {
  // Clear local storage
  localStorage.removeItem('jaaz_access_token')
  localStorage.removeItem('jaaz_user_info')
  // Clear jaaz provider api_key
  await clearJaazApiKey()
  return {
    status: 'success',
    message: i18n.t('common:auth.logoutSuccessMessage')
  }
}
export async function getUserProfile() {
  const userInfo = localStorage.getItem('jaaz_user_info')
  if (!userInfo) {
    throw new Error(i18n.t('common:auth.notLoggedIn'))
  }
  return JSON.parse(userInfo)
}
// Helper function to save auth data to local storage
export function saveAuthData(token, userInfo) {
  localStorage.setItem('jaaz_access_token', token)
  localStorage.setItem('jaaz_user_info', JSON.stringify(userInfo))
}
// Helper function to get access token
export function getAccessToken() {
  return localStorage.getItem('jaaz_access_token')
}
// Helper function to make authenticated API calls
export async function authenticatedFetch(url, options = {}) {
  const token = getAccessToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return fetch(url, {
    ...options,
    headers
  })
}
// 刷新token
export async function refreshToken(currentToken) {
  const response = await fetch(`${BASE_API_URL}/api/device/refresh-token`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${currentToken}`
    }
  })
  if (response.status === 200) {
    const data = await response.json()
    return data.new_token
  } else if (response.status === 401) {
    // Token 真正过期，需要重新登录
    throw new Error('TOKEN_EXPIRED')
  } else {
    // 其他错误（网络错误、服务器错误等），不强制重新登录
    throw new Error(`NETWORK_ERROR: ${response.status}`)
  }
}
