export interface Application {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface CreateApplicationRequest {
  name: string
}

export interface UpdateApplicationRequest {
  name: string
}

export interface ApplicationListResponse {
  data: Application[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApplicationListParams {
  page?: number
  limit?: number
  search?: string
}