import { create } from 'zustand'
import { contactService, tagService } from '../services'
import type { 
  Contact, 
  ContactFilters, 
  Tag, 
  ContactProfileData 
} from '../types/contact.types'

interface ContactState {
  // Data
  contacts: Contact[]
  tags: Tag[]
  selectedContact: ContactProfileData | null
  
  // Pagination and filters
  total: number
  page: number
  limit: number
  totalPages: number
  filters: ContactFilters
  
  // Loading states
  loading: boolean
  tagsLoading: boolean
  profileLoading: boolean
  
  // Error handling
  error: string | null
  
  // Actions
  fetchContacts: () => Promise<void>
  fetchTags: () => Promise<void>
  fetchContactProfile: (contactId: number) => Promise<void>
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  setFilters: (filters: Partial<ContactFilters>) => void
  clearFilters: () => void
  setError: (error: string | null) => void
  clearSelectedContact: () => void
}

const initialFilters: ContactFilters = {
  page: 1,
  limit: 10,
  include_tags: true
}

export const useContactStore = create<ContactState>((set, get) => ({
  // Initial state
  contacts: [],
  tags: [],
  selectedContact: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  filters: initialFilters,
  loading: false,
  tagsLoading: false,
  profileLoading: false,
  error: null,

  // Actions
  fetchContacts: async () => {
    const state = get()
    set({ loading: true, error: null })
    
    try {
      const response = await contactService.getContacts({
        ...state.filters,
        page: state.page,
        limit: state.limit
      })
      
      set({
        contacts: response.data,
        total: response.total,
        totalPages: response.totalPages,
        page: response.page,
        limit: response.limit,
        loading: false
      })
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar contatos'
      })
    }
  },

  fetchTags: async () => {
    set({ tagsLoading: true, error: null })
    
    try {
      const tags = await tagService.getAllTags()
      set({ tags, tagsLoading: false })
    } catch (error) {
      set({
        tagsLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar tags'
      })
    }
  },

  fetchContactProfile: async (contactId: number) => {
    set({ profileLoading: true, error: null })
    
    try {
      const profileData = await contactService.getContactProfile(contactId)
      set({ 
        selectedContact: profileData,
        profileLoading: false 
      })
    } catch (error) {
      set({
        profileLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar perfil do contato'
      })
    }
  },

  setPage: (page: number) => {
    set({ page })
  },

  setLimit: (limit: number) => {
    set({ limit, page: 1 })
  },

  setFilters: (newFilters: Partial<ContactFilters>) => {
    const state = get()
    set({
      filters: { ...state.filters, ...newFilters },
      page: 1 // Reset page when filters change
    })
  },

  clearFilters: () => {
    set({
      filters: initialFilters,
      page: 1
    })
  },

  setError: (error: string | null) => {
    set({ error })
  },

  clearSelectedContact: () => {
    set({ selectedContact: null })
  }
}))