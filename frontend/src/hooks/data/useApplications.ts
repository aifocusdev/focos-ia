import { useState, useEffect } from 'react'
import { applicationService } from '../../services/application/application.service'
import type { Application } from '../../types/application.types'

interface UseApplicationsReturn {
  applications: Application[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useApplications = (): UseApplicationsReturn => {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await applicationService.getApplications({ 
        limit: 1000 // Carregar todas as aplicações para o select
      })
      
      setApplications(response.data)
    } catch (err) {
      console.error('Error fetching applications:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar aplicações')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  return {
    applications,
    isLoading,
    error,
    refetch: fetchApplications
  }
}