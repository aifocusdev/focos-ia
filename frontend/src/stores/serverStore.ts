import { create } from 'zustand'
import { serverService } from '../services/server/server.service'
import { showToast } from './uiStore'
import type { Server, ServerListParams } from '../types/server.types'

interface ServerState {
  servers: Server[]
  selectedServer: Server | null
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  error: string | null
  
  // Pagination
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  
  // Search
  searchQuery: string
  
  // Actions
  fetchServers: (params?: ServerListParams) => Promise<void>
  fetchServer: (id: number) => Promise<void>
  createServer: (name: string) => Promise<boolean>
  updateServer: (id: number, name: string) => Promise<boolean>
  deleteServer: (id: number) => Promise<boolean>
  setSelectedServer: (server: Server | null) => void
  setSearchQuery: (query: string) => void
  clearError: () => void
  resetPagination: () => void
}

export const useServerStore = create<ServerState>((set, get) => ({
  servers: [],
  selectedServer: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 20,
  
  searchQuery: '',
  
  fetchServers: async (params = {}) => {
    const { currentPage, itemsPerPage, searchQuery } = get()
    
    set({ isLoading: true, error: null })
    
    try {
      const response = await serverService.getServers({
        page: params.page || currentPage,
        limit: params.limit || itemsPerPage,
        search: params.search !== undefined ? params.search : searchQuery,
        ...params
      })
      
      set({
        servers: response.data,
        currentPage: response.page,
        totalPages: response.totalPages,
        totalItems: response.total,
        itemsPerPage: response.limit,
        isLoading: false
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar servidores'
      set({ 
        error: errorMessage, 
        isLoading: false 
      })
      showToast.error('Erro ao carregar servidores')
    }
  },
  
  fetchServer: async (id: number) => {
    set({ isLoading: true, error: null })
    
    try {
      const server = await serverService.getServer(id)
      set({ 
        selectedServer: server, 
        isLoading: false 
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar servidor'
      set({ 
        error: errorMessage, 
        isLoading: false 
      })
      showToast.error('Erro ao carregar servidor')
    }
  },
  
  createServer: async (name: string) => {
    set({ isCreating: true, error: null })
    
    try {
      const newServer = await serverService.createServer({ name })
      
      // Add new server to the list
      set(state => ({
        servers: [newServer, ...state.servers],
        totalItems: state.totalItems + 1,
        isCreating: false
      }))
      
      showToast.success('Servidor criado com sucesso')
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar servidor'
      set({ 
        error: errorMessage, 
        isCreating: false 
      })
      showToast.error('Erro ao criar servidor')
      return false
    }
  },
  
  updateServer: async (id: number, name: string) => {
    set({ isUpdating: true, error: null })
    
    try {
      const updatedServer = await serverService.updateServer(id, { name })
      
      // Update server in the list
      set(state => ({
        servers: state.servers.map(server => 
          server.id === id ? updatedServer : server
        ),
        selectedServer: state.selectedServer?.id === id ? updatedServer : state.selectedServer,
        isUpdating: false
      }))
      
      showToast.success('Servidor atualizado com sucesso')
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar servidor'
      set({ 
        error: errorMessage, 
        isUpdating: false 
      })
      showToast.error('Erro ao atualizar servidor')
      return false
    }
  },
  
  deleteServer: async (id: number) => {
    set({ isDeleting: true, error: null })
    
    try {
      await serverService.deleteServer(id)
      
      // Remove server from the list
      set(state => ({
        servers: state.servers.filter(server => server.id !== id),
        selectedServer: state.selectedServer?.id === id ? null : state.selectedServer,
        totalItems: Math.max(0, state.totalItems - 1),
        isDeleting: false
      }))
      
      showToast.success('Servidor removido com sucesso')
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao remover servidor'
      set({ 
        error: errorMessage, 
        isDeleting: false 
      })
      showToast.error('Erro ao remover servidor')
      return false
    }
  },
  
  setSelectedServer: (server: Server | null) => {
    set({ selectedServer: server })
  },
  
  setSearchQuery: (query: string) => {
    set({ searchQuery: query, currentPage: 1 })
  },
  
  clearError: () => {
    set({ error: null })
  },
  
  resetPagination: () => {
    set({ currentPage: 1, totalPages: 1, totalItems: 0 })
  }
}))