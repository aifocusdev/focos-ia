import { create } from 'zustand'
import { deviceService } from '../services/device/device.service'
import { showToast } from './uiStore'
import type { Device, DeviceListParams } from '../types/device.types'

interface DeviceState {
  devices: Device[]
  selectedDevice: Device | null
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
  fetchDevices: (params?: DeviceListParams) => Promise<void>
  fetchDevice: (id: number) => Promise<void>
  createDevice: (name: string) => Promise<boolean>
  updateDevice: (id: number, name: string) => Promise<boolean>
  deleteDevice: (id: number) => Promise<boolean>
  setSelectedDevice: (device: Device | null) => void
  setSearchQuery: (query: string) => void
  clearError: () => void
  resetPagination: () => void
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  devices: [],
  selectedDevice: null,
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
  
  fetchDevices: async (params = {}) => {
    const { currentPage, itemsPerPage, searchQuery } = get()
    
    set({ isLoading: true, error: null })
    
    try {
      const response = await deviceService.getDevices({
        page: params.page || currentPage,
        limit: params.limit || itemsPerPage,
        search: params.search !== undefined ? params.search : searchQuery,
        ...params
      })
      
      set({
        devices: response.data,
        currentPage: response.page,
        totalPages: response.totalPages,
        totalItems: response.total,
        itemsPerPage: response.limit,
        isLoading: false
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar dispositivos'
      set({ 
        error: errorMessage, 
        isLoading: false 
      })
      showToast.error('Erro ao carregar dispositivos')
    }
  },
  
  fetchDevice: async (id: number) => {
    set({ isLoading: true, error: null })
    
    try {
      const device = await deviceService.getDevice(id)
      set({ 
        selectedDevice: device, 
        isLoading: false 
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar dispositivo'
      set({ 
        error: errorMessage, 
        isLoading: false 
      })
      showToast.error('Erro ao carregar dispositivo')
    }
  },
  
  createDevice: async (name: string) => {
    set({ isCreating: true, error: null })
    
    try {
      const newDevice = await deviceService.createDevice({ name })
      
      // Add new device to the list
      set(state => ({
        devices: [newDevice, ...state.devices],
        totalItems: state.totalItems + 1,
        isCreating: false
      }))
      
      showToast.success('Dispositivo criado com sucesso')
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar dispositivo'
      set({ 
        error: errorMessage, 
        isCreating: false 
      })
      showToast.error('Erro ao criar dispositivo')
      return false
    }
  },
  
  updateDevice: async (id: number, name: string) => {
    set({ isUpdating: true, error: null })
    
    try {
      const updatedDevice = await deviceService.updateDevice(id, { name })
      
      // Update device in the list
      set(state => ({
        devices: state.devices.map(device => 
          device.id === id ? updatedDevice : device
        ),
        selectedDevice: state.selectedDevice?.id === id ? updatedDevice : state.selectedDevice,
        isUpdating: false
      }))
      
      showToast.success('Dispositivo atualizado com sucesso')
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar dispositivo'
      set({ 
        error: errorMessage, 
        isUpdating: false 
      })
      showToast.error('Erro ao atualizar dispositivo')
      return false
    }
  },
  
  deleteDevice: async (id: number) => {
    set({ isDeleting: true, error: null })
    
    try {
      await deviceService.deleteDevice(id)
      
      // Remove device from the list
      set(state => ({
        devices: state.devices.filter(device => device.id !== id),
        selectedDevice: state.selectedDevice?.id === id ? null : state.selectedDevice,
        totalItems: Math.max(0, state.totalItems - 1),
        isDeleting: false
      }))
      
      showToast.success('Dispositivo removido com sucesso')
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao remover dispositivo'
      set({ 
        error: errorMessage, 
        isDeleting: false 
      })
      showToast.error('Erro ao remover dispositivo')
      return false
    }
  },
  
  setSelectedDevice: (device: Device | null) => {
    set({ selectedDevice: device })
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