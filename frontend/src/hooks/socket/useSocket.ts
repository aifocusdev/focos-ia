import { useEffect, useCallback, useRef } from 'react'
import { useSocketStore } from '../../stores/socketStore'
import { socketService } from '../../services/websocket/socket.service'
import { useSocketConnection } from './useSocketConnection'
import { useSocketEvents } from './useSocketEvents'
import { useSocketMessages } from './useSocketMessages'

export const useSocket = () => {
  const socketStore = useSocketStore()
  
  // Use modularized hooks
  const connection = useSocketConnection()
  const events = useSocketEvents()
  const messages = useSocketMessages()

  // Store handler references for cleanup
  const handlersRef = useRef<Map<string, Function>>(new Map())

  // Setup event handlers
  const setupEventHandlers = useCallback(() => {
    // Clear existing handlers
    handlersRef.current.forEach((handler, event) => {
      socketService.off(event as any, handler as any)
    })
    handlersRef.current.clear()

    // Connection events
    socketService.on('connect', connection.onConnect)
    handlersRef.current.set('connect', connection.onConnect)

    socketService.on('disconnect', connection.onDisconnect)
    handlersRef.current.set('disconnect', connection.onDisconnect)

    socketService.on('connect_error', connection.onConnectError)
    handlersRef.current.set('connect_error', connection.onConnectError)

    socketService.on('reconnect', events.onReconnect)
    handlersRef.current.set('reconnect', events.onReconnect)

    // Authentication events
    socketService.on('authenticated', connection.onAuthenticated)
    handlersRef.current.set('authenticated', connection.onAuthenticated)

    socketService.on('unauthorized', connection.onUnauthorized)
    handlersRef.current.set('unauthorized', connection.onUnauthorized)

    // Message events
    socketService.on('message:new', messages.onNewMessage)
    handlersRef.current.set('message:new', messages.onNewMessage)

    socketService.on('whatsapp:message', messages.onWhatsAppMessage)
    handlersRef.current.set('whatsapp:message', messages.onWhatsAppMessage)

    socketService.on('message:read', messages.onMessageStatus)
    handlersRef.current.set('message:read', messages.onMessageStatus)


    // Conversation events
    socketService.on('conversation:new', events.onConversationNew)
    handlersRef.current.set('conversation:new', events.onConversationNew)

    socketService.on('conversation:assigned', events.onConversationAssigned)
    handlersRef.current.set('conversation:assigned', events.onConversationAssigned)

    socketService.on('conversation:status_changed', events.onConversationStatusChanged)
    handlersRef.current.set('conversation:status_changed', events.onConversationStatusChanged)

    socketService.on('conversation:read', events.onConversationRead)
    handlersRef.current.set('conversation:read', events.onConversationRead)


    // Notification events
    socketService.on('system:notification', messages.onNotification)
    handlersRef.current.set('system:notification', messages.onNotification)

  }, [
    connection.onConnect,
    connection.onDisconnect, 
    connection.onConnectError,
    connection.onAuthenticated,
    connection.onUnauthorized,
    events.onReconnect,
    events.onConversationStatusChanged,
    events.onConversationNew,
    events.onConversationAssigned,
    events.onConversationRead,
    messages.onNewMessage,
    messages.onWhatsAppMessage,
    messages.onMessageStatus,
    messages.onConversationAssigned,
    messages.onConversationUpdated,
    messages.onNotification
  ])

  // Cleanup function
  const cleanupEventHandlers = useCallback(() => {
    // Remove all stored event listeners
    handlersRef.current.forEach((handler, event) => {
      socketService.off(event as any, handler as any)
    })
    handlersRef.current.clear()
    
    // Disconnect socket
    socketService.disconnect()
  }, [])

  // Socket actions
  const joinConversation = useCallback((conversationId: string) => {
    socketStore.joinConversation(conversationId)
  }, [])

  const leaveConversation = useCallback((conversationId: string) => {
    socketStore.leaveConversation(conversationId)
  }, [])


  const sendMessage = useCallback((event: string, data: any) => {
    socketService.send(event, data)
  }, [])

  return {
    // Connection state
    isConnected: connection.isConnected,
    isConnecting: connection.isConnecting,
    connectionError: connection.connectionError,
    socketId: socketService.id,

    // Actions
    initialize: connection.initializeSocket,
    disconnect: connection.disconnect,
    setupEventHandlers,
    cleanupEventHandlers,

    // Conversation actions
    joinConversation,
    leaveConversation,
    sendMessage,

    // Socket service (for advanced usage)
    socketService
  }
}

// Hook for setting up socket in app initialization
export const useSocketInitialization = () => {
  const { initialize, setupEventHandlers, cleanupEventHandlers } = useSocket()
  const isInitialized = useRef(false)
  const handlersSetup = useRef(false)

  useEffect(() => {
    // Setup event handlers only once
    if (!handlersSetup.current) {
      setupEventHandlers()
      handlersSetup.current = true
    }

    // Initialize connection if not already initialized
    if (!isInitialized.current) {
      const token = localStorage.getItem('accessToken')
      if (token) {
        initialize().catch(console.error)
        isInitialized.current = true
      }
    }

    return () => {
      // Only cleanup on final unmount
      if (isInitialized.current) {
        cleanupEventHandlers()
        isInitialized.current = false
        handlersSetup.current = false
      }
    }
  }, []) // Empty deps to run only once

  // Reset on token change
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token && !isInitialized.current) {
      initialize().catch(console.error)
      isInitialized.current = true
    }
  }, [initialize])
}

