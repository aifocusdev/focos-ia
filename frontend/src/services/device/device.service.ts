import { api } from '../api'
import type { 
  Device, 
  DeviceListResponse, 
  DeviceListParams, 
  CreateDeviceRequest, 
  UpdateDeviceRequest 
} from '../../types/device.types'

class DeviceService {
  async getDevices(params: DeviceListParams = {}): Promise<DeviceListResponse> {
    const queryParams = new URLSearchParams()
    
    if (params.page) {
      queryParams.append('page', params.page.toString())
    }
    if (params.limit) {
      queryParams.append('limit', params.limit.toString())
    }
    if (params.search) {
      queryParams.append('search', params.search)
    }
    
    const queryString = queryParams.toString()
    const url = queryString ? `/devices?${queryString}` : '/devices'
    
    return await api.get<DeviceListResponse>(url)
  }

  async getDevice(id: number): Promise<Device> {
    return await api.get<Device>(`/devices/${id}`)
  }

  async createDevice(data: CreateDeviceRequest): Promise<Device> {
    return await api.post<Device>('/devices', data)
  }

  async updateDevice(id: number, data: UpdateDeviceRequest): Promise<Device> {
    return await api.patch<Device>(`/devices/${id}`, data)
  }

  async deleteDevice(id: number): Promise<void> {
    await api.delete(`/devices/${id}`)
  }
}

export const deviceService = new DeviceService()