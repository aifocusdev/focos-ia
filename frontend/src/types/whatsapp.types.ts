export interface WhatsAppConfig {
  id: number
  phone_number_id: string
  business_account_id?: string
  api_version: string
  created_at: string
  updated_at: string
}

export interface CreateWhatsAppConfig {
  access_token: string
  phone_number_id: string
  business_account_id?: string
  api_version?: string
}

export interface UpdateWhatsAppConfig {
  access_token?: string
  phone_number_id?: string
  business_account_id?: string
  api_version?: string
}

export interface WhatsAppConfigFilters {
  page?: number
  limit?: number
  phone_number_id?: string
  api_version?: string
}

export type WhatsAppConfigResponse = import('./user.types').PaginatedResponse<WhatsAppConfig>

export interface ConnectionStatus {
  isConnected: boolean
  lastChecked?: string
  error?: string
}

// API Version options
export const API_VERSIONS = [
  { value: 'v23.0', label: 'v23.0' }
] as const

export type ApiVersion = typeof API_VERSIONS[number]['value']