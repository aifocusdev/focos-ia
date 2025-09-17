import { create } from 'zustand'
import { applicationService } from '../services/application/application.service'
import { showToast } from './uiStore'
import type { Application, ApplicationListParams } from '../types/application.types'

interface ApplicationState {
  applications: Application[]
  selectedApplication: Application | null
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
  fetchApplications: (params?: ApplicationListParams) => Promise<void>
  fetchApplication: (id: number) => Promise<void>
  createApplication: (name: string) => Promise<boolean>
  updateApplication: (id: number, name: string) => Promise<boolean>
  deleteApplication: (id: number) => Promise<boolean>
  setSelectedApplication: (application: Application | null) => void
  setSearchQuery: (query: string) => void
  clearError: () => void
  resetPagination: () => void
}

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  applications: [],
  selectedApplication: null,
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
  
  fetchApplications: async (params = {}) => {
    const { currentPage, itemsPerPage, searchQuery } = get()
    
    set({ isLoading: true, error: null })
    
    try {
      const response = await applicationService.getApplications({
        page: params.page || currentPage,
        limit: params.limit || itemsPerPage,
        search: params.search !== undefined ? params.search : searchQuery,
        ...params
      })
      
      set({
        applications: response.data,
        currentPage: response.page,
        totalPages: response.totalPages,
        totalItems: response.total,
        itemsPerPage: response.limit,
        isLoading: false
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar aplicações'
      set({ 
        error: errorMessage, 
        isLoading: false 
      })
      showToast.error('Erro ao carregar aplicações')
    }
  },
  
  fetchApplication: async (id: number) => {
    set({ isLoading: true, error: null })
    
    try {
      const application = await applicationService.getApplication(id)
      set({ 
        selectedApplication: application, 
        isLoading: false 
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar aplicação'
      set({ 
        error: errorMessage, 
        isLoading: false 
      })
      showToast.error('Erro ao carregar aplicação')
    }
  },
  
  createApplication: async (name: string) => {
    set({ isCreating: true, error: null })
    
    try {
      const newApplication = await applicationService.createApplication({ name })
      
      // Add new application to the list
      set(state => ({
        applications: [newApplication, ...state.applications],
        totalItems: state.totalItems + 1,
        isCreating: false
      }))
      
      showToast.success('Aplicação criada com sucesso')
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar aplicação'
      set({ 
        error: errorMessage, 
        isCreating: false 
      })
      showToast.error('Erro ao criar aplicação')
      return false
    }
  },
  
  updateApplication: async (id: number, name: string) => {
    set({ isUpdating: true, error: null })
    
    try {
      const updatedApplication = await applicationService.updateApplication(id, { name })
      
      // Update application in the list
      set(state => ({
        applications: state.applications.map(application => 
          application.id === id ? updatedApplication : application
        ),
        selectedApplication: state.selectedApplication?.id === id ? updatedApplication : state.selectedApplication,
        isUpdating: false
      }))
      
      showToast.success('Aplicação atualizada com sucesso')
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar aplicação'
      set({ 
        error: errorMessage, 
        isUpdating: false 
      })
      showToast.error('Erro ao atualizar aplicação')
      return false
    }
  },
  
  deleteApplication: async (id: number) => {
    set({ isDeleting: true, error: null })
    
    try {
      await applicationService.deleteApplication(id)
      
      // Remove application from the list
      set(state => ({
        applications: state.applications.filter(application => application.id !== id),
        selectedApplication: state.selectedApplication?.id === id ? null : state.selectedApplication,
        totalItems: Math.max(0, state.totalItems - 1),
        isDeleting: false
      }))
      
      showToast.success('Aplicação removida com sucesso')
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao remover aplicação'
      set({ 
        error: errorMessage, 
        isDeleting: false 
      })
      showToast.error('Erro ao remover aplicação')
      return false
    }
  },
  
  setSelectedApplication: (application: Application | null) => {
    set({ selectedApplication: application })
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