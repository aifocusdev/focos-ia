import { create } from 'zustand'
import { tagService } from '../services/tag/tag.service'
import { showToast } from './uiStore'
import type { Tag, TagListParams, TagColor } from '../types/tag.types'

interface TagState {
  tags: Tag[]
  selectedTag: Tag | null
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
  fetchTags: (params?: TagListParams) => Promise<void>
  fetchTag: (id: number) => Promise<void>
  createTag: (name: string, color: TagColor) => Promise<boolean>
  updateTag: (id: number, name: string, color: TagColor) => Promise<boolean>
  deleteTag: (id: number) => Promise<boolean>
  setSelectedTag: (tag: Tag | null) => void
  setSearchQuery: (query: string) => void
  clearError: () => void
  resetPagination: () => void
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],
  selectedTag: null,
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
  
  fetchTags: async (params = {}) => {
    const { currentPage, itemsPerPage, searchQuery } = get()
    
    set({ isLoading: true, error: null })
    
    try {
      const response = await tagService.getTags({
        page: params.page || currentPage,
        limit: params.limit || itemsPerPage,
        search: params.search !== undefined ? params.search : searchQuery,
        ...params
      })
      
      set({
        tags: response.data,
        currentPage: response.page,
        totalPages: response.totalPages,
        totalItems: response.total,
        itemsPerPage: response.limit,
        isLoading: false
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar tags'
      set({ 
        error: errorMessage, 
        isLoading: false 
      })
      showToast.error('Erro ao carregar tags')
    }
  },
  
  fetchTag: async (id: number) => {
    set({ isLoading: true, error: null })
    
    try {
      const tag = await tagService.getTag(id)
      set({ 
        selectedTag: tag, 
        isLoading: false 
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar tag'
      set({ 
        error: errorMessage, 
        isLoading: false 
      })
      showToast.error('Erro ao carregar tag')
    }
  },
  
  createTag: async (name: string, color: TagColor) => {
    set({ isCreating: true, error: null })
    
    try {
      const newTag = await tagService.createTag({ name, color })
      
      // Add new tag to the list
      set(state => ({
        tags: [newTag, ...state.tags],
        totalItems: state.totalItems + 1,
        isCreating: false
      }))
      
      showToast.success('Tag criada com sucesso')
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar tag'
      set({ 
        error: errorMessage, 
        isCreating: false 
      })
      showToast.error('Erro ao criar tag')
      return false
    }
  },
  
  updateTag: async (id: number, name: string, color: TagColor) => {
    set({ isUpdating: true, error: null })
    
    try {
      const updatedTag = await tagService.updateTag(id, { name, color })
      
      // Update tag in the list
      set(state => ({
        tags: state.tags.map(tag => 
          tag.id === id ? updatedTag : tag
        ),
        selectedTag: state.selectedTag?.id === id ? updatedTag : state.selectedTag,
        isUpdating: false
      }))
      
      showToast.success('Tag atualizada com sucesso')
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar tag'
      set({ 
        error: errorMessage, 
        isUpdating: false 
      })
      showToast.error('Erro ao atualizar tag')
      return false
    }
  },
  
  deleteTag: async (id: number) => {
    set({ isDeleting: true, error: null })
    
    try {
      await tagService.deleteTag(id)
      
      // Remove tag from the list
      set(state => ({
        tags: state.tags.filter(tag => tag.id !== id),
        selectedTag: state.selectedTag?.id === id ? null : state.selectedTag,
        totalItems: Math.max(0, state.totalItems - 1),
        isDeleting: false
      }))
      
      showToast.success('Tag removida com sucesso')
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao remover tag'
      set({ 
        error: errorMessage, 
        isDeleting: false 
      })
      showToast.error('Erro ao remover tag')
      return false
    }
  },
  
  setSelectedTag: (tag: Tag | null) => {
    set({ selectedTag: tag })
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