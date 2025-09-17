import { useCallback } from 'react'
import { useSocketStore } from '../../stores/socketStore'
import { useUIStore } from '../../stores/uiStore'

export const useSocketConnection = () => {
  const socketStore = useSocketStore()
  const { setConnectionStatus } = useUIStore()
  
  const {
    isConnected,
    isConnecting,
    connectionError,
    connect,
    disconnect,
    setConnectionState,
    setConnectionError,
    setAuthenticated
  } = socketStore

  // Initialize socket connection
  const initializeSocket = useCallback(async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setConnectionError('No auth token available')
      return
    }

    // Avoid multiple simultaneous connection attempts
    if (isConnecting) {
      return
    }

    try {
      await connect(token)
    } catch (error) {
      setConnectionError('Failed to connect to server')
    }
  }, [connect, setConnectionError, isConnecting])

  // Connection event handlers
  const onConnect = useCallback(() => {
    setConnectionState(true, false)
    setConnectionStatus('connected')
    setConnectionError(null)
  }, [setConnectionState, setConnectionStatus, setConnectionError])

  const onDisconnect = useCallback((_reason: string) => {
    setConnectionState(false, false)
    setConnectionStatus('disconnected')
  }, [setConnectionState, setConnectionStatus])

  const onConnectError = useCallback((_error: Error) => {
    setConnectionState(false, false)
    setConnectionError(_error.message)
    setConnectionStatus('error')
  }, [setConnectionState, setConnectionError, setConnectionStatus])

  const onAuthenticated = useCallback((data: any) => {
    setAuthenticated(true, data.user)
  }, [setAuthenticated])

  const onUnauthorized = useCallback((_error: string) => {
    setAuthenticated(false)
  }, [setAuthenticated])

  return {
    // State
    isConnected,
    isConnecting,
    connectionError,
    
    // Actions
    initializeSocket,
    disconnect,
    
    // Event handlers
    onConnect,
    onDisconnect,
    onConnectError,
    onAuthenticated,
    onUnauthorized
  }
}