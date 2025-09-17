export interface Server {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface CreateServerRequest {
  name: string
}

export interface UpdateServerRequest {
  name: string
}

export interface ServerListResponse {
  data: Server[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ServerListParams {
  page?: number
  limit?: number
  search?: string
}