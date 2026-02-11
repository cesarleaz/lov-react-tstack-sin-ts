import { eventBus } from './event'
class NotificationManager {
  notifications = []
  listeners = []
  currentCanvasId = null
  constructor() {
    this.initializeEventListeners()
  }
  setCurrentCanvasId(canvasId) {
    this.currentCanvasId = canvasId
  }
  initializeEventListeners() {
    // Image Generated
    eventBus.on('Socket::Session::ImageGenerated', (data) => {
      this.addNotification({
        type: 'canvas_update',
        title: 'Image generated',
        message: 'Image added to canvas',
        canvasId: data.canvas_id,
        imageUrl: data.image_url
      })
    })
    // Info
    eventBus.on('Socket::Session::Info', (data) => {
      this.addNotification({
        type: 'info',
        title: 'Info',
        message: data.info
      })
    })
  }
  addNotification(notification) {
    if (
      notification.type === 'canvas_update' &&
      notification.canvasId === this.currentCanvasId
    ) {
      return
    }
    const uniqueKey = `${notification.type}_${notification.title}_${notification.canvasId || ''}_${notification.sessionId || ''}`
    if (
      this.notifications.some(
        (n) =>
          `${n.type}_${n.title}_${n.canvasId || ''}_${n.sessionId || ''}` ===
          uniqueKey
      )
    ) {
      return
    }
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    }
    this.notifications.unshift(newNotification)
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50)
    }
    this.notifyListeners()
  }
  getNotifications() {
    return [...this.notifications]
  }
  getUnreadCount() {
    return this.notifications.filter((n) => !n.read).length
  }
  markAsRead(id) {
    const notification = this.notifications.find((n) => n.id === id)
    if (notification) {
      notification.read = true
      this.notifyListeners()
    }
  }
  markAllAsRead() {
    this.notifications.forEach((n) => (n.read = true))
    this.notifyListeners()
  }
  clearNotifications() {
    this.notifications = []
    this.notifyListeners()
  }
  subscribe(listener) {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }
  notifyListeners() {
    this.listeners.forEach((listener) => listener(this.notifications))
  }
  // Get canvas notifications
  getCanvasNotifications(canvasId) {
    return this.notifications.filter((n) => n.canvasId === canvasId)
  }
  // Get session notifications
  getSessionNotifications(sessionId) {
    return this.notifications.filter((n) => n.sessionId === sessionId)
  }
}
export const notificationManager = new NotificationManager()
