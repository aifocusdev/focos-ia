import { create } from 'zustand'
import { userService } from '../services/user/user.service'
import type { 
  User, 
  CreateUser, 
  UpdateUser, 
  UserFilters, 
  UserResponse 
} from '../types/user.types'

interface UserState {
  // State
  users: User[]
  total: number
  page: number
  limit: number
  totalPages: number
  filters: UserFilters
  loading: boolean
  error: string | null
  selectedUser: User | null

  // Actions
  setUsers: (response: UserResponse) => void
  setFilters: (filters: UserFilters) => void
  setPage: (page: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSelectedUser: (user: User | null) => void
  
  // API Actions
  fetchUsers: (filters?: UserFilters) => Promise<void>
  createUser: (userData: CreateUser) => Promise<void>
  updateUser: (id: number, userData: UpdateUser) => Promise<void>
  deleteUser: (id: number) => Promise<void>
  refreshUsers: () => Promise<void>
}

export const useUserStore = create<UserState>((set, get) => ({
  // Initial State
  users: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  filters: {},
  loading: false,
  error: null,
  selectedUser: null,

  // Basic Actions
  setUsers: (response) => set({
    users: response.data,
    total: response.total,
    page: response.page,
    limit: response.limit,
    totalPages: response.totalPages
  }),

  setFilters: (filters) => set({ filters }),

  setPage: (page) => set({ page }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setSelectedUser: (user) => set({ selectedUser: user }),

  // API Actions
  fetchUsers: async (filters) => {
    const state = get()
    const currentFilters = filters || state.filters
    const finalFilters = { ...currentFilters, page: state.page, limit: state.limit }

    set({ loading: true, error: null })
    
    try {
      const response = await userService.getUsers(finalFilters)
      state.setUsers(response)
      if (filters) {
        state.setFilters(currentFilters)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar usuários'
      set({ error: errorMessage })
    } finally {
      set({ loading: false })
    }
  },

  createUser: async (userData) => {
    set({ loading: true, error: null })
    
    try {
      await userService.createUser(userData)
      await get().refreshUsers()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar usuário'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  updateUser: async (id, userData) => {
    set({ loading: true, error: null })
    
    try {
      await userService.updateUser(id, userData)
      await get().refreshUsers()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar usuário'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  deleteUser: async (id) => {
    set({ loading: true, error: null })
    
    try {
      await userService.deleteUser(id)
      await get().refreshUsers()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar usuário'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  refreshUsers: async () => {
    const state = get()
    await state.fetchUsers()
  }
}))