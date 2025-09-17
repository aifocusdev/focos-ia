import { create } from 'zustand'
import { quickReplyService } from '../services/quickReply/quickReply.service'
import { showToast } from './uiStore'
import type { QuickReply, QuickReplyListParams, CreateQuickReplyRequest, UpdateQuickReplyRequest } from '../types/quickReply.types'

interface QuickReplyState {
  quickReplies: QuickReply[]
  selectedQuickReply: QuickReply | null
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
  fetchQuickReplies: (params?: QuickReplyListParams) => Promise<void>
  fetchQuickReply: (id: number) => Promise<void>
  createQuickReply: (data: CreateQuickReplyRequest) => Promise<boolean>
  updateQuickReply: (id: number, data: UpdateQuickReplyRequest) => Promise<boolean>
  deleteQuickReply: (id: number) => Promise<boolean>
  setSelectedQuickReply: (quickReply: QuickReply | null) => void
  setSearchQuery: (query: string) => void
  clearError: () => void
  resetPagination: () => void
}

export const useQuickReplyStore = create<QuickReplyState>((set, get) => ({
  quickReplies: [],
  selectedQuickReply: null,
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
  
  fetchQuickReplies: async (params = {}) => {
    const { currentPage, itemsPerPage, searchQuery } = get()
    
    set({ isLoading: true, error: null })
    
    try {
      const response = await quickReplyService.getQuickReplies({
        page: params.page || currentPage,
        limit: params.limit || itemsPerPage,
        search: params.search !== undefined ? params.search : searchQuery,
        ...params
      })
      
      set({
        quickReplies: response.data,
        currentPage: response.page,
        totalPages: response.totalPages,
        totalItems: response.total,
        itemsPerPage: response.limit,
        isLoading: false
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar respostas rápidas'
      set({ 
        error: errorMessage, 
        isLoading: false 
      })
      showToast.error('Erro ao carregar respostas rápidas')
    }
  },
  
  fetchQuickReply: async (id: number) => {
    set({ isLoading: true, error: null })
    
    try {
      const quickReply = await quickReplyService.getQuickReply(id)
      set({ 
        selectedQuickReply: quickReply, 
        isLoading: false 
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar resposta rápida'
      set({ 
        error: errorMessage, 
        isLoading: false 
      })
      showToast.error('Erro ao carregar resposta rápida')
    }
  },
  
  createQuickReply: async (data: CreateQuickReplyRequest) => {
    set({ isCreating: true, error: null })
    
    try {
      const newQuickReply = await quickReplyService.createQuickReply(data)
      
      // Add new quick reply to the list
      set(state => ({
        quickReplies: [newQuickReply, ...state.quickReplies],
        totalItems: state.totalItems + 1,
        isCreating: false
      }))
      
      showToast.success('Resposta rápida criada com sucesso')
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar resposta rápida'
      set({ 
        error: errorMessage, 
        isCreating: false 
      })
      showToast.error('Erro ao criar resposta rápida')
      return false
    }
  },
  
  updateQuickReply: async (id: number, data: UpdateQuickReplyRequest) => {
    set({ isUpdating: true, error: null })
    
    try {
      const updatedQuickReply = await quickReplyService.updateQuickReply(id, data)
      
      // Update quick reply in the list
      set(state => ({
        quickReplies: state.quickReplies.map(quickReply => 
          quickReply.id === id ? updatedQuickReply : quickReply
        ),
        selectedQuickReply: state.selectedQuickReply?.id === id ? updatedQuickReply : state.selectedQuickReply,
        isUpdating: false
      }))
      
      showToast.success('Resposta rápida atualizada com sucesso')
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar resposta rápida'
      set({ 
        error: errorMessage, 
        isUpdating: false 
      })
      showToast.error('Erro ao atualizar resposta rápida')
      return false
    }
  },
  
  deleteQuickReply: async (id: number) => {
    set({ isDeleting: true, error: null })
    
    try {
      await quickReplyService.deleteQuickReply(id)
      
      // Remove quick reply from the list
      set(state => ({
        quickReplies: state.quickReplies.filter(quickReply => quickReply.id !== id),
        selectedQuickReply: state.selectedQuickReply?.id === id ? null : state.selectedQuickReply,
        totalItems: Math.max(0, state.totalItems - 1),
        isDeleting: false
      }))
      
      showToast.success('Resposta rápida removida com sucesso')
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao remover resposta rápida'
      set({ 
        error: errorMessage, 
        isDeleting: false 
      })
      showToast.error('Erro ao remover resposta rápida')
      return false
    }
  },
  
  setSelectedQuickReply: (quickReply: QuickReply | null) => {
    set({ selectedQuickReply: quickReply })
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