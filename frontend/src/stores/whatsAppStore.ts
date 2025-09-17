import { create } from 'zustand'
import { whatsAppService } from '../services/whatsapp/whatsapp.service'
import type { 
  WhatsAppConfig, 
  CreateWhatsAppConfig, 
  UpdateWhatsAppConfig, 
  WhatsAppConfigFilters, 
  WhatsAppConfigResponse,
  ConnectionStatus
} from '../types/whatsapp.types'

interface WhatsAppState {
  // State
  configs: WhatsAppConfig[]
  total: number
  page: number
  limit: number
  totalPages: number
  filters: WhatsAppConfigFilters
  loading: boolean
  error: string | null
  selectedConfig: WhatsAppConfig | null
  connectionStatus: Record<number, ConnectionStatus>

  // Actions
  setConfigs: (response: WhatsAppConfigResponse) => void
  setFilters: (filters: WhatsAppConfigFilters) => void
  setPage: (page: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSelectedConfig: (config: WhatsAppConfig | null) => void
  setConnectionStatus: (configId: number, status: ConnectionStatus) => void
  
  // API Actions
  fetchConfigs: (filters?: WhatsAppConfigFilters) => Promise<void>
  createConfig: (configData: CreateWhatsAppConfig) => Promise<void>
  updateConfig: (id: number, configData: UpdateWhatsAppConfig) => Promise<void>
  deleteConfig: (id: number) => Promise<void>
  testConnection: (configId: number) => Promise<void>
  refreshConfigs: () => Promise<void>
}

export const useWhatsAppStore = create<WhatsAppState>((set, get) => ({
  // Initial State
  configs: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  filters: {},
  loading: false,
  error: null,
  selectedConfig: null,
  connectionStatus: {},

  // Basic Actions
  setConfigs: (response) => set({
    configs: response.data,
    total: response.total,
    page: response.page,
    limit: response.limit,
    totalPages: response.totalPages
  }),

  setFilters: (filters) => set({ filters }),

  setPage: (page) => set({ page }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setSelectedConfig: (config) => set({ selectedConfig: config }),

  setConnectionStatus: (configId, status) => set((state) => ({
    connectionStatus: {
      ...state.connectionStatus,
      [configId]: status
    }
  })),

  // API Actions
  fetchConfigs: async (filters) => {
    const state = get()
    const currentFilters = filters || state.filters
    const finalFilters = { ...currentFilters, page: state.page, limit: state.limit }

    set({ loading: true, error: null })
    
    try {
      const response = await whatsAppService.getConfigs(finalFilters)
      state.setConfigs(response)
      if (filters) {
        state.setFilters(currentFilters)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar configurações'
      set({ error: errorMessage })
    } finally {
      set({ loading: false })
    }
  },

  createConfig: async (configData) => {
    set({ loading: true, error: null })
    
    try {
      await whatsAppService.createConfig(configData)
      await get().refreshConfigs()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar configuração'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  updateConfig: async (id, configData) => {
    set({ loading: true, error: null })
    
    try {
      await whatsAppService.updateConfig(id, configData)
      await get().refreshConfigs()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar configuração'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  deleteConfig: async (id) => {
    set({ loading: true, error: null })
    
    try {
      await whatsAppService.deleteConfig(id)
      // Remove connection status for deleted config
      set((state) => {
        const newConnectionStatus = { ...state.connectionStatus }
        delete newConnectionStatus[id]
        return { connectionStatus: newConnectionStatus }
      })
      await get().refreshConfigs()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar configuração'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  testConnection: async (configId) => {
    try {
      const status = await whatsAppService.testConnection(configId)
      get().setConnectionStatus(configId, status)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao testar conexão'
      get().setConnectionStatus(configId, {
        isConnected: false,
        lastChecked: new Date().toISOString(),
        error: errorMessage
      })
    }
  },

  refreshConfigs: async () => {
    const state = get()
    await state.fetchConfigs()
  }
}))