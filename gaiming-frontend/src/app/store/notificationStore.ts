/**
 * Simplified Notification store for testing
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Simplified notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: number
  read: boolean
}

// Notification state
interface NotificationState {
  notifications: Notification[]
  maxNotifications: number
  defaultDuration: number
  soundEnabled: boolean
}

interface NotificationActions {
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => string
  dismissNotification: (id: string) => void
  markAsRead: (id: string) => void
  clearAll: () => void
  
  // Convenience methods
  showSuccess: (title: string, message: string) => string
  showError: (title: string, message: string) => string
  showWarning: (title: string, message: string) => string
  showInfo: (title: string, message: string) => string
  
  // Settings
  setMaxNotifications: (max: number) => void
  setSoundEnabled: (enabled: boolean) => void
}

type NotificationStore = NotificationState & NotificationActions

// Generate unique notification ID
const generateId = () => `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// Create the notification store
export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      notifications: [],
      maxNotifications: 5,
      defaultDuration: 5000,
      soundEnabled: true,

      // Core notification management
      addNotification: (notificationData) => {
        const id = generateId()
        const notification: Notification = {
          ...notificationData,
          id,
          timestamp: Date.now(),
          read: false,
        }

        const currentNotifications = get().notifications
        const newNotifications = [notification, ...currentNotifications]
        
        // Limit to max notifications
        if (newNotifications.length > get().maxNotifications) {
          newNotifications.splice(get().maxNotifications)
        }
        
        set({ notifications: newNotifications })

        // Auto-dismiss after default duration
        setTimeout(() => {
          get().dismissNotification(id)
        }, get().defaultDuration)

        return id
      },

      dismissNotification: (id: string) => {
        const currentNotifications = get().notifications
        set({ notifications: currentNotifications.filter(n => n.id !== id) })
      },

      markAsRead: (id: string) => {
        const currentNotifications = get().notifications
        const updatedNotifications = currentNotifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
        set({ notifications: updatedNotifications })
      },

      clearAll: () => {
        set({ notifications: [] })
      },

      // Convenience methods
      showSuccess: (title, message) => {
        return get().addNotification({
          type: 'success',
          title,
          message,
        })
      },

      showError: (title, message) => {
        return get().addNotification({
          type: 'error',
          title,
          message,
        })
      },

      showWarning: (title, message) => {
        return get().addNotification({
          type: 'warning',
          title,
          message,
        })
      },

      showInfo: (title, message) => {
        return get().addNotification({
          type: 'info',
          title,
          message,
        })
      },

      // Settings
      setMaxNotifications: (max: number) => {
        const validMax = Math.max(1, Math.min(20, max))
        set({ maxNotifications: validMax })
        
        // Trim notifications if needed
        const currentNotifications = get().notifications
        if (currentNotifications.length > validMax) {
          set({ notifications: currentNotifications.slice(0, validMax) })
        }
      },

      setSoundEnabled: (enabled: boolean) => {
        set({ soundEnabled: enabled })
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        maxNotifications: state.maxNotifications,
        defaultDuration: state.defaultDuration,
        soundEnabled: state.soundEnabled,
      }),
      version: 1,
    }
  )
)

// Simplified selectors for testing
export const notificationSelectors = {
  all: (state: NotificationStore) => state.notifications,
  unread: (state: NotificationStore) => state.notifications.filter(n => !n.read),
  count: (state: NotificationStore) => state.notifications.length,
  unreadCount: (state: NotificationStore) => state.notifications.filter(n => !n.read).length,
  hasUnread: (state: NotificationStore) => state.notifications.some(n => !n.read),
}
