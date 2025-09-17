import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { socketService } from '../services/websocket/socket.service'
import type { User } from '../types'



interface SocketState {
  // Connection state
  isConnected: boolean
  isConnecting: boolean
  connectionError: string | null
  lastConnected: Date | null
  reconnectAttempts: number

  // Authentication
  isAuthenticated: boolean
  authenticatedUser: User | null


  // Real-time data
  activeConversations: Set<string>
  unreadCounts: Map<string, number>

  // Notifications
  hasNewMessages: boolean
  lastActivity: Date | null
}

interface SocketActions {
  // Connection management
  connect: (token?: string) => Promise<void>
  disconnect: () => void
  setConnectionState: (connected: boolean, connecting?: boolean) => void
  setConnectionError: (error: string | null) => void
  setReconnectAttempts: (attempts: number) => void

  // Authentication
  setAuthenticated: (authenticated: boolean, user?: User) => void


  // Conversation management
  joinConversation: (conversationId: string) => void
  leaveConversation: (conversationId: string) => void
  setUnreadCount: (conversationId: string, count: number) => void
  incrementUnreadCount: (conversationId: string) => void

  // Activity tracking
  updateActivity: () => void
  setHasNewMessages: (hasNew: boolean) => void

  // Cleanup
  reset: () => void
}

type SocketStore = SocketState & SocketActions

const initialState: SocketState = {
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  lastConnected: null,
  reconnectAttempts: 0,
  isAuthenticated: false,
  authenticatedUser: null,
  activeConversations: new Set(),
  unreadCounts: new Map(),
  hasNewMessages: false,
  lastActivity: null,
}

export const useSocketStore = create<SocketStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Connection management
      connect: async (token?: string) => {
        set({ isConnecting: true, connectionError: null })
        
        try {
          await socketService.connect(token)
          set({ 
            isConnected: true, 
            isConnecting: false, 
            lastConnected: new Date(),
            reconnectAttempts: 0 
          })
        } catch (error) {
          set({ 
            isConnected: false, 
            isConnecting: false, 
            connectionError: error instanceof Error ? error.message : 'Connection failed' 
          })
          throw error
        }
      },

      disconnect: () => {
        socketService.disconnect()
        set({ 
          isConnected: false, 
          isConnecting: false,
          isAuthenticated: false,
          authenticatedUser: null
        })
      },

      setConnectionState: (connected: boolean, connecting = false) => {
        set({ 
          isConnected: connected, 
          isConnecting: connecting,
          lastConnected: connected ? new Date() : get().lastConnected
        })
      },

      setConnectionError: (error: string | null) => {
        set({ connectionError: error })
      },

      setReconnectAttempts: (attempts: number) => {
        set({ reconnectAttempts: attempts })
      },

      // Authentication
      setAuthenticated: (authenticated: boolean, user?: User) => {
        set({ 
          isAuthenticated: authenticated, 
          authenticatedUser: user || null 
        })
      },



      // Conversation management
      joinConversation: (conversationId: string) => {
        socketService.joinRoom(conversationId)
        set(state => {
          const newActiveConversations = new Set(state.activeConversations)
          newActiveConversations.add(conversationId)
          return { activeConversations: newActiveConversations }
        })
      },

      leaveConversation: (conversationId: string) => {
        socketService.leaveRoom(conversationId)
        set(state => {
          const newActiveConversations = new Set(state.activeConversations)
          newActiveConversations.delete(conversationId)
          return { activeConversations: newActiveConversations }
        })
      },

      setUnreadCount: (conversationId: string, count: number) => {
        set(state => {
          const newUnreadCounts = new Map(state.unreadCounts)
          if (count > 0) {
            newUnreadCounts.set(conversationId, count)
          } else {
            newUnreadCounts.delete(conversationId)
          }
          return { unreadCounts: newUnreadCounts }
        })
      },

      incrementUnreadCount: (conversationId: string) => {
        set(state => {
          const newUnreadCounts = new Map(state.unreadCounts)
          const current = newUnreadCounts.get(conversationId) || 0
          newUnreadCounts.set(conversationId, current + 1)
          return { 
            unreadCounts: newUnreadCounts,
            hasNewMessages: true
          }
        })
      },

      // Activity tracking
      updateActivity: () => {
        set({ lastActivity: new Date() })
      },

      setHasNewMessages: (hasNew: boolean) => {
        set({ hasNewMessages: hasNew })
      },

      // Cleanup
      reset: () => {
        set({ ...initialState })
      }
    }),
    {
      name: 'socket-store',
    }
  )
)

// Utility functions

export const getTotalUnreadCount = (): number => {
  const { unreadCounts } = useSocketStore.getState()
  return Array.from(unreadCounts.values()).reduce((total, count) => total + count, 0)
}

