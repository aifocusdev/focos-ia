import io from 'socket.io-client'
import type { User } from '../../types'

export interface SocketEventMap {
  // Connection events
  connect: () => void
  disconnect: (reason: string) => void
  connect_error: (error: Error) => void
  reconnect: (attemptNumber: number) => void
  reconnect_error: (error: Error) => void
  reconnect_failed: () => void

  // Authentication events
  authenticated: (data: { user: User }) => void
  unauthorized: (error: string) => void

  // Message events (API format)
  'message:new': (message: any) => void
  'message:read': (data: { messageId: string; status: 'sent' | 'delivered' | 'read' }) => void
  
  // WhatsApp webhook events
  'whatsapp:message': (data: { conversationId: number; message: any; contact: any }) => void
  'whatsapp:message_status': (data: { messageId: string; status: string }) => void

  // Conversation events (API format)
  'conversation:new': (conversation: any) => void
  'conversation:assigned': (data: { conversationId: string; assignedTo: User }) => void
  'conversation:status_changed': (data: { conversationId: string; status: string }) => void
  'conversation:updated': (conversation: any) => void
  'conversation:read': (data: { conversationId: string; read: boolean }) => void
  'conversation:unread': (data: { conversationId: string; read: boolean }) => void


  // System events (API format)
  'system:notification': (notification: any) => void
  'system:error': (error: any) => void
}

export type SocketEvent = keyof SocketEventMap
export type SocketEventHandler<T extends SocketEvent> = SocketEventMap[T]

class SocketService {
  private socket: any | null = null
  private isConnecting = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private eventHandlers = new Map<string, Set<Function>>()
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected'

  constructor() {
    this.setupVisibilityChangeHandler()
  }

  // Connection Management
  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve()
        return
      }

      if (this.isConnecting) {
        return
      }

      this.isConnecting = true
      this.connectionState = 'connecting'

      const socketUrl = (import.meta.env.VITE_SOCKET_URL || 'https://new-api.apiceplay.com') + '/crm'
      
      // Clean up existing socket first
      if (this.socket) {
        this.socket.disconnect()
        this.socket.removeAllListeners()
        this.socket = null
      }
      
      const authToken = token || localStorage.getItem('accessToken')
      
      this.socket = io(socketUrl, {
        auth: {
          token: authToken
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: false,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000
      })

      // Connection event handlers
      this.socket.on('connect', () => {
        this.isConnecting = false
        this.reconnectAttempts = 0
        this.connectionState = 'connected'
        this.emit('connect')
        resolve()
      })

      this.socket.on('connect_error', (error: any) => {
        this.isConnecting = false
        this.connectionState = 'error'
        this.emit('connect_error', error)
        
        // Stop trying after max attempts
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.connectionState = 'error'
          this.socket?.disconnect()
        }
        
        reject(error)
      })

      this.socket.on('disconnect', (reason: string) => {
        this.connectionState = 'disconnected'
        this.emit('disconnect', reason)
        
        // Don't auto-reconnect - let Socket.IO handle it
        // Manual reconnect can be triggered by calling connect() again
      })

      this.socket.on('reconnect', (attemptNumber: number) => {
        this.connectionState = 'connected'
        this.reconnectAttempts = 0
        this.emit('reconnect', attemptNumber)
      })

      this.socket.on('reconnect_error', (error: any) => {
        this.emit('reconnect_error', error)
      })

      this.socket.on('reconnect_failed', () => {
        this.connectionState = 'error'
        this.emit('reconnect_failed')
      })

      // Setup default event forwarding
      this.setupDefaultEventForwarding()
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket.removeAllListeners()
      this.socket = null
    }
    this.isConnecting = false
    this.reconnectAttempts = 0
    this.connectionState = 'disconnected'
    this.eventHandlers.clear()
  }

  // Event Management
  on<T extends SocketEvent>(event: T, handler: SocketEventHandler<T>): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }
    this.eventHandlers.get(event)!.add(handler)
  }

  off<T extends SocketEvent>(event: T, handler: SocketEventHandler<T>): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.eventHandlers.delete(event)
      }
    }
  }

  emit(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args)
        } catch (error) {
        }
      })
    }
  }

  // Send Events
  send(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    } else {
    }
  }

  // Room Management
  joinRoom(roomId: string): void {
    this.send('join:conversation', { conversationId: roomId })
  }

  leaveRoom(roomId: string): void {
    this.send('leave:conversation', { conversationId: roomId })
  }


  // Mark Conversation as Read
  markConversationAsRead(conversationId: string | number): void {
    const numericId = typeof conversationId === 'string' ? parseInt(conversationId, 10) : conversationId
    this.send('conversation:read', { conversationId: numericId })
  }

  // Status
  get connected(): boolean {
    return this.socket?.connected || false
  }

  get connecting(): boolean {
    return this.isConnecting
  }

  get state(): string {
    return this.connectionState
  }

  get id(): string | undefined {
    return this.socket?.id
  }

  // Private Methods
  private setupDefaultEventForwarding(): void {
    if (!this.socket) return

    // Forward all relevant events to internal handlers
    const eventsToForward = [
      'authenticated', 'unauthorized',
      'message:new', 'message:read',
      'whatsapp:message', 'whatsapp:message_status',
      'conversation:new', 'conversation:assigned', 'conversation:status_changed', 'conversation:updated',
      'conversation:read', 'conversation:unread',
      'system:notification', 'system:error',
      'joined_conversation', 'left_conversation'
    ]

    eventsToForward.forEach(event => {
      this.socket!.on(event, (...args: any[]) => {
        this.emit(event, ...args)
      })
    })

    // Listen for ANY event to debug what's actually coming from the API
    this.socket.onAny((_eventName: string, ..._args: any[]) => {
    })
  }


  private setupVisibilityChangeHandler(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden - reduce activity
      } else {
        // Page is visible - ensure connection
        const token = localStorage.getItem('accessToken')
        if (token && !this.connected && !this.connecting) {
          this.connect(token).catch(() => {})
        }
      }
    })
  }
}

export const socketService = new SocketService()