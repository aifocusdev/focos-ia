// Export all stores
export { useAuthStore } from './authStore'
export { useUIStore, showToast, showModal } from './uiStore'
export { useSocketStore, getTotalUnreadCount } from './socketStore'
export { useServerStore } from './serverStore'
export { useDeviceStore } from './deviceStore'
export { useTagStore } from './tagStore'
export { useApplicationStore } from './applicationStore'

// Re-export types that might be useful
export type { User } from '../types/user.types'