export interface Device {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface CreateDeviceRequest {
  name: string
}

export interface UpdateDeviceRequest {
  name: string
}

export interface DeviceListResponse {
  data: Device[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface DeviceListParams {
  page?: number
  limit?: number
  search?: string
}