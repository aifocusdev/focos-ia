import { useState, useEffect } from 'react'
import { deviceService } from '../../services/device/device.service'
import type { Device } from '../../types/device.types'

interface UseDevicesReturn {
  devices: Device[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useDevices = (): UseDevicesReturn => {
  const [devices, setDevices] = useState<Device[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDevices = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await deviceService.getDevices({ 
        limit: 1000 // Carregar todos os dispositivos para o select
      })
      
      setDevices(response.data)
    } catch (err) {
      console.error('Error fetching devices:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar dispositivos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [])

  return {
    devices,
    isLoading,
    error,
    refetch: fetchDevices
  }
}