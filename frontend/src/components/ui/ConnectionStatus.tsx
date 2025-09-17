import React from 'react'
import { useSocketStore } from '../../stores/socketStore'
import { Wifi, WifiOff, Loader2, AlertTriangle } from 'lucide-react'
import { cn } from '../../utils/cn'

interface ConnectionStatusProps {
  className?: string
  showText?: boolean
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  className, 
  showText = false 
}) => {
  const { 
    isConnected, 
    isConnecting, 
    connectionError, 
    lastConnected,
    reconnectAttempts 
  } = useSocketStore()

  const getStatusConfig = () => {
    if (isConnecting) {
      return {
        icon: Loader2,
        text: 'Conectando...',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-400/20',
        animate: 'animate-spin'
      }
    }

    if (connectionError) {
      return {
        icon: AlertTriangle,
        text: 'Erro de conexão',
        color: 'text-red-400',
        bgColor: 'bg-red-400/20',
        animate: ''
      }
    }

    if (isConnected) {
      return {
        icon: Wifi,
        text: 'Online',
        color: 'text-green-400',
        bgColor: 'bg-green-400/20',
        animate: ''
      }
    }

    return {
      icon: WifiOff,
      text: 'Offline',
      color: 'text-gray-400',
      bgColor: 'bg-gray-400/20',
      animate: ''
    }
  }

  const status = getStatusConfig()
  const Icon = status.icon

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        'p-1.5 rounded-full',
        status.bgColor
      )}>
        <Icon className={cn(
          'w-3 h-3',
          status.color,
          status.animate
        )} />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={cn('text-xs font-medium', status.color)}>
            {status.text}
          </span>
          
          {connectionError && (
            <span className="text-xs text-gray-500">
              {reconnectAttempts > 0 && `Tentativa ${reconnectAttempts}`}
            </span>
          )}
          
          {isConnected && lastConnected && !showText && (
            <span className="text-xs text-gray-500">
              {lastConnected.toLocaleTimeString()}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Compact version for header
export const ConnectionIndicator: React.FC<{ className?: string }> = ({ className }) => {
  const { isConnected, isConnecting } = useSocketStore()

  if (isConnecting) {
    return (
      <div className={cn('flex items-center gap-1 text-xs text-yellow-400', className)}>
        <Loader2 className="w-3 h-3 animate-spin" />
        <span className="hidden sm:inline">Conectando...</span>
      </div>
    )
  }

  return (
    <div className={cn(
      'flex items-center gap-1 text-xs',
      isConnected ? 'text-green-400' : 'text-red-400',
      className
    )}>
      <div className={cn(
        'w-2 h-2 rounded-full',
        isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
      )} />
      <span className="hidden sm:inline">
        {isConnected ? 'Online' : 'Offline'}
      </span>
    </div>
  )
}