import React from 'react'
import { Wifi, WifiOff, Clock, AlertTriangle, RefreshCw } from 'lucide-react'
import { useWhatsAppStore } from '../../stores/whatsAppStore'
import { Button } from '../ui/Button'

const ConnectionStatus: React.FC = () => {
  const { configs, connectionStatus, testConnection } = useWhatsAppStore()

  // Get overall connection status
  const getOverallStatus = () => {
    if (configs.length === 0) {
      return {
        type: 'no-config' as const,
        count: 0,
        connected: 0,
        disconnected: 0,
        untested: 0
      }
    }

    let connected = 0
    let disconnected = 0
    let untested = 0

    configs.forEach(config => {
      const status = connectionStatus[config.id]
      if (!status) {
        untested++
      } else if (status.isConnected) {
        connected++
      } else {
        disconnected++
      }
    })

    return {
      type: 'has-configs' as const,
      count: configs.length,
      connected,
      disconnected,
      untested
    }
  }

  const handleTestAllConnections = async () => {
    const promises = configs.map(config => testConnection(config.id))
    await Promise.all(promises)
  }

  const status = getOverallStatus()
  const formatLastChecked = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'agora mesmo'
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h atrás`
    
    return date.toLocaleDateString('pt-BR')
  }

  if (status.type === 'no-config') {
    return (
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-900 rounded-full flex items-center justify-center mr-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Nenhuma configuração encontrada
              </h3>
              <p className="text-gray-400 text-sm">
                Adicione uma configuração para começar a usar o WhatsApp Business API
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Get the most recent check time
  const lastCheckedTimes = configs
    .map(config => connectionStatus[config.id]?.lastChecked)
    .filter(Boolean)
  
  const mostRecentCheck = lastCheckedTimes.length > 0 
    ? Math.max(...lastCheckedTimes.map(time => new Date(time!).getTime()))
    : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
      {/* Overall Status Card */}
      <div className="lg:col-span-2 bg-gray-800 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
              status.connected > 0 && status.disconnected === 0 
                ? 'bg-green-900' 
                : status.connected > 0 
                  ? 'bg-yellow-900' 
                  : 'bg-red-900'
            }`}>
              {status.connected > 0 && status.disconnected === 0 ? (
                <Wifi className="w-6 h-6 text-green-400" />
              ) : status.connected > 0 ? (
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              ) : (
                <WifiOff className="w-6 h-6 text-red-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Status da Integração
              </h3>
              <p className="text-gray-400 text-sm">
                {status.count} configuração{status.count !== 1 ? 'ões' : ''} cadastrada{status.count !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleTestAllConnections}
            variant="secondary"
            size="sm"
            className="flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Testar Todas
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {status.connected}
            </div>
            <div className="text-xs text-gray-400">Conectadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {status.disconnected}
            </div>
            <div className="text-xs text-gray-400">Desconectadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">
              {status.untested}
            </div>
            <div className="text-xs text-gray-400">Não testadas</div>
          </div>
        </div>

        {mostRecentCheck && (
          <div className="mt-4 pt-4 border-t border-gray-700 flex items-center text-sm text-gray-400">
            <Clock className="w-4 h-4 mr-2" />
            Última verificação: {formatLastChecked(new Date(mostRecentCheck).toISOString())}
          </div>
        )}
      </div>

      {/* Connected Count */}
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-green-900 rounded-full flex items-center justify-center mr-4">
            <Wifi className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {status.connected}
            </div>
            <div className="text-sm text-gray-400">
              Conexões Ativas
            </div>
          </div>
        </div>
      </div>

      {/* Disconnected Count */}
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-red-900 rounded-full flex items-center justify-center mr-4">
            <WifiOff className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {status.disconnected}
            </div>
            <div className="text-sm text-gray-400">
              Com Problemas
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConnectionStatus