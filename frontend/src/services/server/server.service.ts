import { api } from '../api'
import type { 
  Server, 
  ServerListResponse, 
  ServerListParams, 
  CreateServerRequest, 
  UpdateServerRequest 
} from '../../types/server.types'

class ServerService {
  async getServers(params: ServerListParams = {}): Promise<ServerListResponse> {
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
    const url = queryString ? `/servers?${queryString}` : '/servers'
    
    return await api.get<ServerListResponse>(url)
  }

  async getServer(id: number): Promise<Server> {
    return await api.get<Server>(`/servers/${id}`)
  }

  async createServer(data: CreateServerRequest): Promise<Server> {
    return await api.post<Server>('/servers', data)
  }

  async updateServer(id: number, data: UpdateServerRequest): Promise<Server> {
    return await api.patch<Server>(`/servers/${id}`, data)
  }

  async deleteServer(id: number): Promise<void> {
    await api.delete(`/servers/${id}`)
  }
}

export const serverService = new ServerService()