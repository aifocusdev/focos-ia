import { useState, useEffect } from 'react'
import { serverService } from '../../services/server/server.service'
import type { Server } from '../../types/server.types'

interface UseServersReturn {
  servers: Server[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useServers = (): UseServersReturn => {
  const [servers, setServers] = useState<Server[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchServers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await serverService.getServers({ 
        limit: 1000 // Carregar todos os servidores para o select
      })
      
      setServers(response.data)
    } catch (err) {
      console.error('Error fetching servers:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar servidores')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchServers()
  }, [])

  return {
    servers,
    isLoading,
    error,
    refetch: fetchServers
  }
}