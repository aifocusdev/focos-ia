import { api } from '../api'
import type { 
  WhatsAppConfig, 
  CreateWhatsAppConfig, 
  UpdateWhatsAppConfig, 
  WhatsAppConfigFilters, 
  WhatsAppConfigResponse,
  ConnectionStatus
} from '../../types/whatsapp.types'

class WhatsAppService {
  private baseURL = '/whatsapp-integration-config'

  async getConfigs(filters: WhatsAppConfigFilters = {}): Promise<WhatsAppConfigResponse> {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.phone_number_id) params.append('phone_number_id', filters.phone_number_id)
    if (filters.api_version) params.append('api_version', filters.api_version)

    const queryString = params.toString()
    const url = queryString ? `${this.baseURL}?${queryString}` : this.baseURL

    return api.get<WhatsAppConfigResponse>(url)
  }

  async getConfigById(id: number): Promise<WhatsAppConfig> {
    return api.get<WhatsAppConfig>(`${this.baseURL}/${id}`)
  }

  async createConfig(configData: CreateWhatsAppConfig): Promise<WhatsAppConfig> {
    return api.post<WhatsAppConfig>(this.baseURL, configData)
  }

  async updateConfig(id: number, configData: UpdateWhatsAppConfig): Promise<WhatsAppConfig> {
    return api.patch<WhatsAppConfig>(`${this.baseURL}/${id}`, configData)
  }

  async deleteConfig(id: number): Promise<void> {
    return api.delete<void>(`${this.baseURL}/${id}`)
  }

  // Additional method for testing connection
  async testConnection(configId: number): Promise<ConnectionStatus> {
    try {
      const response = await api.post<{ status: string }>(`${this.baseURL}/${configId}/test`, {})
      return {
        isConnected: response.status === 'connected',
        lastChecked: new Date().toISOString()
      }
    } catch (error) {
      return {
        isConnected: false,
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Erro ao testar conexão'
      }
    }
  }
}

export const whatsAppService = new WhatsAppService()